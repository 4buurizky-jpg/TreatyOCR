# Backend Architecture & Structure Documentation

**Project Name:** Indore Treaty RU - OCR Scanner  
**Tech Stack:** Python 3.10+, FastAPI, Uvicorn, pdfplumber, pandas, openpyxl, pytesseract  

---

## Directory Structure

```text
backend/
├── endpoints/
│   └── ocr.py                 # Primary APIRouter handling scan, process & download
├── parser/
│   ├── __init__.py
│   ├── base_parser.py         # Abstract base class for parser implementations
│   ├── tripakarta.py          # Tri Pakarta PDF table extraction logic
│   └── aca.py                 # ACA Insurance PDF table extraction logic
├── schemas/
│   ├── __init__.py
│   └── commission.py          # Pydantic schemas for data validation
├── utils/
│   ├── excel_writer.py        # Utility for writing dataframes to styled Excel files
│   ├── helper.py              # Data cleaning & string manipulation helpers
│   ├── ocr.py                 # Tesseract OCR processing utilities
│   └── pdf_reader.py          # pdfplumber wrapper for reading PDF text & tables
├── build.py                   # Build script or standalone execution entry
├── main.py                    # FastAPI initialization, CORS middleware & router setup
└── requirements.txt           # Python dependencies