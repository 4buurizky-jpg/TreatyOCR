import io
import os
import shutil
import tempfile
import pdfplumber
import pandas as pd
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

# Import GenericParser dan ExcelLoader
from parser.generic_parser import GenericParser
from exporter.loader import ExcelLoader

router = APIRouter(prefix="/api", tags=["OCR Processor"])


@router.post("/scan-pdf", summary="Scan PDF secara cepat untuk mengecek keberadaan tabel")
async def scan_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Berkas harus berformat PDF.")

    try:
        contents = await file.read()
        table_found = False
        detected_pages = []

        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            max_pages = min(len(pdf.pages), 10)
            
            for page_idx in range(max_pages):
                page = pdf.pages[page_idx]
                page_text = (page.extract_text() or "").lower()
                tables = page.extract_tables()

                # Cek apakah ada garis tabel visual OR ada kata kunci struktur komisi/sliding scale
                has_visual_table = bool(tables and len(tables) > 0)
                has_text_table = any(kw in page_text for kw in ["sliding scale", "loss ratio", "ri comm", "profit commission"])

                if has_visual_table or has_text_table:
                    table_found = True
                    detected_pages.append(page_idx + 1)

        if not table_found:
            return {
                "table_detected": False,
                "detected_pages": [],
                "message": "Tidak ada struktur tabel yang terdeteksi pada berkas PDF ini."
            }

        return {
            "table_detected": True,
            "detected_pages": detected_pages,
            "message": f"Tabel terdeteksi pada halaman {', '.join(map(str, detected_pages))}."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memindai PDF: {str(e)}")


@router.post("/process-pdf", summary="Proses Berkas PDF Treaty")
async def process_pdf(
    file: UploadFile = File(...),
    cedant: str = Form("auto")
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File harus berformat PDF")

    # Simpan file PDF sementara untuk diproses parser
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf_file:
        shutil.copyfileobj(file.file, temp_pdf_file)
        temp_pdf_path = temp_pdf_file.name

    try:
        filename_lower = file.filename.lower()

        # 1. Eksekusi GenericParser untuk mengekstrak data dari PDF
        parser = GenericParser(temp_pdf_path)
        dfs = parser.process()
        headers = parser.parse_headers()

        # Penentuan label parsed_type untuk tampilan UI / History
        if cedant != "auto" and cedant != "":
            parsed_type = f"{cedant.upper()} (Generic Parser)"
        elif "aca" in filename_lower:
            parsed_type = "ACA Insurance (Auto Detect)"
        elif any(kw in filename_lower for kw in ["tripakarta", "tri pakarta", "tp"]):
            parsed_type = "Tri Pakarta (Auto Detect)"
        else:
            parsed_type = "Generic Treaty Parser"

        df_sliding = dfs.get("Sliding Scale", pd.DataFrame())
        df_profit = dfs.get("Profit Commission", pd.DataFrame())

        if df_sliding.empty and df_profit.empty:
            raise HTTPException(status_code=422, detail="Tidak ada data tabel yang dapat diekstrak")

        # 2. Simpan hasil ekstraksi ke Excel via ExcelLoader
        company_name = headers.get("Reinsured", "Unknown_Company")
        loader = ExcelLoader()
        excel_filepath = loader.save_to_excel(
            data_frames=dfs,
            input_filename=file.filename,
            company_name=company_name
        )

        excel_filename = os.path.basename(excel_filepath)

        # 3. Clean NaN values untuk format respons JSON
        df_sliding_clean = df_sliding.astype(object).where(pd.notnull(df_sliding), None)
        df_profit_clean = df_profit.astype(object).where(pd.notnull(df_profit), None)

        return {
            "status": "success",
            "file_name": file.filename,
            "parsed_type": parsed_type,
            "download_id": excel_filename,
            "data": {
                "sliding_scale": df_sliding_clean.to_dict(orient="records"),
                "profit_commission": df_profit_clean.to_dict(orient="records")
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses PDF: {str(e)}")

    finally:
        # Hapus file PDF sementara
        if os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)


@router.get("/download/{file_id}", summary="Unduh File Excel Hasil Ekstraksi")
async def download_excel(file_id: str):
    # Cek lokasi file di direktori ExcelLoader
    loader = ExcelLoader()
    file_path = os.path.join(loader.output_dir, file_id)

    # Fallback pencarian di folder temp sistem
    if not os.path.exists(file_path):
        file_path = os.path.join(tempfile.gettempdir(), file_id)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File tidak ditemukan atau telah kadaluwarsa")

    return FileResponse(
        path=file_path,
        filename=file_id,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )