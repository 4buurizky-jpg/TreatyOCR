import pytesseract
from pdf2image import convert_from_path
import logging

def extract_text_with_ocr(file_path):
    text = ""
    try:
        logging.info(f"Memulai proses OCR untuk {file_path}...")
        
        # Konversi PDF menjadi list gambar (PIL Images)
        # dpi=300 sangat direkomendasikan untuk akurasi tabel
        images = convert_from_path(file_path, dpi=300)

        for i, image in enumerate(images):
            logging.info(f"Memproses halaman {i+1} dengan OCR...")
            # psm 6 membantu menjaga struktur baris yang menyerupai tabel
            page_text = pytesseract.image_to_string(image, config='--psm 6')
            text += page_text + "\n"

        logging.info(f"OCR selesai untuk {file_path}.")
        return text
    
    except Exception as e:
        logging.error(f"Gagal melakukan OCR pada {file_path}: {e}")
        return ""