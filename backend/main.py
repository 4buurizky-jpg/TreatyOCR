from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from endpoints.ocr import router as ocr_router

app = FastAPI(
    title="Treaty OCR API",
    description="API untuk ekstraksi data PDF Treaty ke format Excel",
    version="1.0.0"
)

# Konfigurasi CORS agar React (Vite/CRA) dapat mengakses API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan router dari endpoints/ocr.py
app.include_router(ocr_router)