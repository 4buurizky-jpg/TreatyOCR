import re

def generate_output_filename(input_filename, company_name):
    """
    Mengekstrak Tahun dan Tipe Treaty dari nama file asli
    untuk menghasilkan format: Final_[Company]_[Tahun]_[Tipe].xlsx
    """
    # 1. Ekstrak Tahun (Mencari 4 digit angka yang diawali 20)
    year_match = re.search(r'(20\d{2})', input_filename)
    year = year_match.group(1) if year_match else "UNKNOWN_YEAR"

    # 2. Ekstrak Tipe Treaty (QSSPL atau XOL)
    treaty_type = "UNKNOWN_TYPE"
    input_lower = input_filename.lower()
    
    if 'qsspl' in input_lower:
        treaty_type = "WA_QSSPL"
    elif 'xol' in input_lower:
        treaty_type = "WA_XOL"

    # 3. Susun format akhir yang dinamis
    return f"Final_{company_name}_{year}_{treaty_type}.xlsx"