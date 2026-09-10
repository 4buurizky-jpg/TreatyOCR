import os
import shutil
import tempfile
import openpyxl
from openpyxl.styles import Border, Font, Side
import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from parser.tripakarta import TripakartaParser

router = APIRouter(prefix="/api", tags=["OCR Processor"])

@router.post("/process-pdf", summary="Proses Berkas PDF Treaty")
async def process_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File harus berformat PDF")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf_file:
        shutil.copyfileobj(file.file, temp_pdf_file)
        temp_pdf_path = temp_pdf_file.name

    try:
        parser = TripakartaParser(temp_pdf_path)
        dfs = parser.process()

        df_sliding = dfs.get("Sliding Scale", pd.DataFrame())
        df_profit = dfs.get("Profit Commission", pd.DataFrame())

        if df_sliding.empty and df_profit.empty:
            raise HTTPException(status_code=422, detail="Tidak ada data tabel yang dapat diekstrak")

        output_excel_path = temp_pdf_path.replace(".pdf", "_output.xlsx")

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

        df_sliding_clean = df_sliding.astype(object).where(pd.notnull(df_sliding), None)
        df_profit_clean = df_profit.astype(object).where(pd.notnull(df_profit), None)

        return {
            "status": "success",
            "file_name": file.filename,
            "download_id": os.path.basename(output_excel_path),
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
        filename=f"Extracted_{file_id.split('_')[0]}.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )