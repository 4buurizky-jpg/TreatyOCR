import io
import os
import shutil
import tempfile
import openpyxl
from openpyxl.styles import Border, Font, Side
import pandas as pd
import pdfplumber
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

# Import Parser yang tersedia
from parser.tripakarta import TripakartaParser

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
            max_pages = min(len(pdf.pages), 5)
            
            for page_idx in range(max_pages):
                page = pdf.pages[page_idx]
                tables = page.extract_tables()
                if tables and len(tables) > 0:
                    table_found = True
                    detected_pages.append(page_idx + 1)
                    break

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

    # Save temporary PDF file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf_file:
        shutil.copyfileobj(file.file, temp_pdf_file)
        temp_pdf_path = temp_pdf_file.name

    excel_filename = f"{os.path.basename(temp_pdf_path).replace('.pdf', '')}_output.xlsx"
    output_excel_path = os.path.join(tempfile.gettempdir(), excel_filename)

    try:
        filename_lower = file.filename.lower()

        # Deteksi parser berdasarkan Pilihan Manual ATAU Nama Berkas PDF
        if cedant == "aca" or "aca" in filename_lower:
            # Jika nanti ACAParser sudah dibuat, panggil ACAParser(temp_pdf_path) di sini
            parser = TripakartaParser(temp_pdf_path) 
            parsed_type = "ACA Insurance"
        elif cedant == "tripakarta" or any(kw in filename_lower for kw in ["tripakarta", "tri pakarta", "tp"]):
            parser = TripakartaParser(temp_pdf_path)
            parsed_type = "Tri Pakarta"
        else:
            parser = TripakartaParser(temp_pdf_path)
            parsed_type = "Tri Pakarta (Auto Detect)"

        dfs = parser.process()

        df_sliding = dfs.get("Sliding Scale", pd.DataFrame())
        df_profit = dfs.get("Profit Commission", pd.DataFrame())

        if df_sliding.empty and df_profit.empty:
            raise HTTPException(status_code=422, detail="Tidak ada data tabel yang dapat diekstrak")

        # Export to Excel
        with pd.ExcelWriter(output_excel_path, engine='openpyxl') as writer:
            if not df_sliding.empty:
                df_sliding.to_excel(writer, sheet_name='Sliding Scale', index=False)
            if not df_profit.empty:
                df_profit.to_excel(writer, sheet_name='Profit Commission', index=False)

            normal_font = Font(bold=False)
            no_border = Border(
                left=Side(style=None),
                right=Side(style=None),
                top=Side(style=None),
                bottom=Side(style=None)
            )
            for sheet_name in writer.sheets:
                ws = writer.sheets[sheet_name]
                for cell in ws[1]:
                    cell.font = normal_font
                    cell.border = no_border

        # Clean NaN values
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

    finally:
        if os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)


@router.get("/download/{file_id}", summary="Unduh File Excel Hasil Ekstraksi")
async def download_excel(file_id: str):
    file_path = os.path.join(tempfile.gettempdir(), file_id)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File tidak ditemukan atau telah kadaluwarsa")

    return FileResponse(
        path=file_path,
        filename=f"Extracted_{file_id}",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )