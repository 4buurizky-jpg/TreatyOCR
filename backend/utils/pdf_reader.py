import logging
import pdfplumber
import pytesseract
from pdf2image import convert_from_path

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def extract_text_with_ocr(file_path: str) -> str:
    """Mengekstrak teks dari PDF bergambar/scanned menggunakan pytesseract."""
    ocr_text = ""
    try:
        images = convert_from_path(file_path)
        for i, img in enumerate(images):
            text = pytesseract.image_to_string(img)
            if text:
                ocr_text += text + "\n"
        logging.info(f"Berhasil mengekstrak {len(images)} halaman via OCR.")
    except Exception as e:
        logging.error(f"Gagal melakukan OCR pada berkas {file_path}: {e}")
    return ocr_text


def read_pdf_text(file_path: str) -> str:
    """Membaca teks dari PDF. Berpindah ke mode OCR jika teks minim/scanned."""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        # Jika teks terlalu sedikit (kemungkinan PDF berbentuk gambar/scanned)
        if len(text.strip()) < 50:
            logging.warning(
                f"Teks minim terdeteksi di {file_path}. Beralih ke mode OCR..."
            )
            text = extract_text_with_ocr(file_path)

        return text

    except Exception as e:
        logging.error(f"Gagal membaca PDF {file_path}: {e}")
        return ""