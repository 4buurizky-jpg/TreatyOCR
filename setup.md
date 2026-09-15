# ==========================================
# 1. SETUP BACKEND (FastAPI)
# ==========================================

# Pindah ke direktori backend
cd backend

# Buat Virtual Environment Python
python -m venv venv

# Aktifkan Virtual Environment
# Untuk Windows:
venv\Scripts\activate
# Untuk Linux / macOS:
# source venv/bin/activate

# Install seluruh library backend
pip install fastapi uvicorn pdfplumber pandas openpyxl python-multipart pytesseract

# (Opsional) Jika sudah ada file requirements.txt, gunakan ini:
# pip install -r requirements.txt

# Jalankan server backend (Terminal 1)
uvicorn main:app --reload --port 8000


# ==========================================
# 2. SETUP FRONTEND (React + Vite)
# ==========================================
# Buka TERMINAL BARU di root project, lalu jalankan:

# Pindah ke direktori frontend
cd frontend

# Install library utama frontend
npm install react react-dom axios lucide-react

# Install dev dependencies (Vite & Tailwind CSS v4)
npm install -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite

# (Opsional) Jika sudah ada file package.json, cukup jalankan:
# npm install

# Jalankan server frontend (Terminal 2)
npm run dev