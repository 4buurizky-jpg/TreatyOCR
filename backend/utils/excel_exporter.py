import logging
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter


def format_excel_sheet(
    workbook_path: str,
    header_bg_color: str = "10B981",  # Warna Emerald Green (Default UI Theme)
    header_font_color: str = "FFFFFF"
):
    """
    Merapikan tampilan visual workbook Excel:
    - Membuat header cetak tebal (bold) dengan warna latar belakang profesional
    - Mengatur alokasi lebar kolom otomatis (auto-fit width)
    - Menambahkan border tipis pada seluruh sel data
    """
    try:
        wb = openpyxl.load_workbook(workbook_path)

        # Style Definitions
        header_font = Font(name="Calibri", size=11, bold=True, color=header_font_color)
        data_font = Font(name="Calibri", size=11, bold=False)
        header_fill = PatternFill(
            start_color=header_bg_color, 
            end_color=header_bg_color, 
            fill_type="solid"
        )
        
        thin_border = Border(
            left=Side(style="thin", color="CBD5E1"),
            right=Side(style="thin", color="CBD5E1"),
            top=Side(style="thin", color="CBD5E1"),
            bottom=Side(style="thin", color="CBD5E1")
        )

        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]

            # Jika sheet kosong / dummy, lewati formatting
            if ws.max_row <= 1 and ws.cell(row=1, column=1).value == "Status":
                continue

            # 1. Format Baris Header (Row 1)
            for cell in ws[1]:
                cell.font = header_font
                cell.fill = header_fill
                cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
                cell.border = thin_border

            # 2. Format Sel Data & Auto-Fit Lebar Kolom
            for col in ws.columns:
                max_len = 0
                col_letter = get_column_letter(col[0].column)

                for cell in col:
                    # Terapkan font & border data
                    if cell.row > 1:
                        cell.font = data_font
                        cell.border = thin_border
                        # Rata tengah jika isi data berupa angka atau persentase
                        if isinstance(cell.value, (int, float)):
                            cell.alignment = Alignment(horizontal="center", vertical="center")
                        else:
                            cell.alignment = Alignment(horizontal="left", vertical="center")

                    # Hitung panjang isi sel untuk menentukan lebar kolom
                    val_str = str(cell.value or "")
                    if len(val_str) > max_len:
                        max_len = len(val_str)

                # Set lebar kolom dengan margin aman +3
                ws.column_dimensions[col_letter].width = max(max_len + 3, 12)

        wb.save(workbook_path)
        logging.info(f"Berhasil menerapkan format rapi pada Excel: {workbook_path}")

    except Exception as e:
        logging.error(f"Gagal memformat berkas Excel {workbook_path}: {e}")