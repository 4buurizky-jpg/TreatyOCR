import os
import re
from datetime import datetime


def clean_filename_string(text: str) -> str:
    """
    Menghapus karakter yang tidak valid untuk nama file di OS (Windows/Linux)
    seperti / \ : * ? " < > | dan mengganti spasi/whitespace menjadi underscore.
    """
    if not text:
        return "UNKNOWN"
    # Hapus karakter ilegal OS
    cleaned = re.sub(r'[\\/*?:"<>|]', "", text)
    # Ubah spasi/whitespace ganda atau tunggal menjadi underscore
    cleaned = re.sub(r"\s+", "_", cleaned.strip())
    return cleaned


def generate_output_filename(input_filename: str, company_name: str = "") -> str:
    """
    Mengekstrak Metadata (Company, Tahun, Tipe Treaty) dan menyusun nama berkas Excel 
    berstandar ETL Enterprise dengan Timestamp:
    
    Format: Extracted_[Cedant]_[Tipe]_[Tahun]_[YYYYMMDD_HHMMSS].xlsx
    Contoh: Extracted_PT_Asuransi_Bintang_Tbk_WA_QSSPL_2024_20261015_212000.xlsx
    """
    # 1. Bersihkan nama perusahaan agar aman sebagai nama file
    company_clean = clean_filename_string(company_name) if company_name else "UNKNOWN_COMPANY"

    # 2. Ekstrak Tahun (Mencari 4 digit angka diawali 20xx dari nama file PDF)
    year_match = re.search(r"(20\d{2})", input_filename)
    year = year_match.group(1) if year_match else "UNKNOWN_YEAR"

    # 3. Ekstrak Tipe Treaty (Mendukung variasi: QS SPL, QSSPL, XOL, Excess of Loss, dll)
    input_lower = input_filename.lower()
    if re.search(r"qs\s*spl|qsspl|quota\s*share", input_lower):
        treaty_type = "WA_QSSPL"
    elif re.search(r"xol|excess\s*of\s*loss", input_lower):
        treaty_type = "WA_XOL"
    else:
        treaty_type = "TREATY"

    # 4. Buat Timestamp unik (YYYYMMDD_HHMMSS) untuk mencegah konflik file duplikat
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # 5. Susun format akhir
    return f"Extracted_{company_clean}_{treaty_type}_{year}_{timestamp}.xlsx"


def clean_text_spacing(text: str) -> str:
    """Helper pendukung: Merapikan spasi ganda."""
    if not text:
        return ""
    return re.sub(r"[ \t]+", " ", text).strip()


def normalize_operators(text: str) -> str:
    """Helper pendukung: Mengubah '=>', '=<', '<=' menjadi '≤' dan '≥'."""
    if not text:
        return ""
    replacements = {
        "=<": "≤",
        "=>": "≥",
        "<=": "≤",
        ">=": "≥",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text