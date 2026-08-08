import pdfplumber
import logging
from utils.ocr import extract_text_with_ocr

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def read_pdf_text(file_path):
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        
        if len(text.strip()) < 50:
            logging.warning(f"Teks minim terdeteksi di {file_path}. Beralih ke mode OCR...")
            text = extract_text_with_ocr(file_path)
            
        return text
    
    except Exception as e:
        logging.error(f"Gagal membaca PDF {file_path}: {e}")
        return ""