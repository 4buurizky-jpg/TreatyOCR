# Backend Architecture & Structure Documentation

**Project Name:** Indore Treaty RU - OCR Scanner  
**Tech Stack:** Python 3.10+, FastAPI, Uvicorn, pdfplumber, pandas, openpyxl, pytesseract  

---

## Directory Structure

```text
backend/
├── endpoints/
│   └── ocr.py                 # Router API utama untuk pemindaian (scan), pemrosesan, dan unduhan
├── parser/
│   ├── __init__.py
│   ├── base_parser.py         # Class abstrak utama (base class) untuk modul parser
│   ├── tripakarta.py          # Logika ekstraksi tabel PDF khusus Tri Pakarta
│   └── aca.py                 # Logika ekstraksi tabel PDF khusus ACA Insurance
├── schemas/
│   ├── __init__.py
│   └── commission.py          # Skema Pydantic untuk validasi struktur data
├── utils/
│   ├── excel_writer.py        # Utilitas penulisan DataFrame ke berkas Excel berformat
│   ├── helper.py              # Helper pembersihan data & manipulasi teks/string
│   ├── ocr.py                 # Utilitas pemrosesan OCR Tesseract
│   └── pdf_reader.py          # Modul pdfplumber untuk pembacaan teks & tabel PDF
├── build.py                   # Skrip build atau titik eksekusi aplikasi berdiri sendiri
├── main.py                    # Inisialisasi FastAPI, middleware CORS & konfigurasi router
└── requirements.txt           # Daftar dependensi/pustaka Python