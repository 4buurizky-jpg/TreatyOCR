# Backend Architecture & Structure Documentation

**Project Name:** Indore Treaty RU - OCR Scanner  
**Tech Stack:** Python 3.10+, FastAPI, Uvicorn, pdfplumber, pandas, openpyxl, pytesseract  

---

## Directory Structure

```text
backend/
├── endpoints/
│   └── ocr.py                 # Router API utama untuk pemindaian (scan), pemrosesan, dan unduhan
├── exporter/
│   ├── __init__.py
│   └── loader.py              # File Manager & Exporter Loader untuk pengelolaan & penyimpanan Excel
├── parser/
│   ├── __init__.py
│   ├── base_parser.py         # Abstract Base Class utama untuk alur parser
│   └── generic_parser.py      # Parser utama berbasis regex fleksibel & ekstraksi dinamis multi-cedant
├── schemas/
│   ├── __init__.py
│   └── commission.py          # Skema Pydantic untuk validasi struktur Commission & Profit Record
├── utils/
│   ├── excel_exporter.py      # Utilitas pemformatan visual Excel (header emerald, border, auto-fit width)
│   ├── helpers.py             # Helper pembersihan string, penamaan file dinamis & normalisasi operator
│   └── pdf_reader.py          # Utilitas pembacaan teks PDF (pdfplumber) & fallback OCR Tesseract
├── exports/                   # Folder penyimpanan sementara berkas Excel hasil ekstraksi
├── build.py                   # Skrip eksekusi / bundling aplikasi
├── main.py                    # Inisialisasi FastAPI, middleware CORS, & pendaftaran router API
└── requirements.txt           # Daftar dependensi/pustaka Python