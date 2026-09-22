<div align="center">

# Indore Treaty RU - Treaty OCR Extractor & Analytics Portal

### Enterprise-Grade Reinsurance Treaty Document Parser, Table Extraction Engine & Analytics Portal

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-2.0+-150458?style=for-the-badge&logo=pandas&logoColor=white)
![pdfplumber](https://img.shields.io/badge/pdfplumber-0.10+-FF6F61?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)
![OpenPyXL](https://img.shields.io/badge/OpenPyXL-3.1+-217346?style=for-the-badge&logo=microsoftexcel&logoColor=white)

</div>

---

## Overview

**Indore Treaty RU - Treaty OCR Extractor** adalah platform otomasi ekstraksi dokumen *reinsurance treaty* skala enterprise. Platform ini dirancang khusus untuk memindai, mengenali, dan mengonversi tabel-tabel kompleks seperti **Sliding Scale** dan **Profit Commission** dari dokumen PDF Treaty perasuransian (*cedants*) menjadi berkas Microsoft Excel (`.xlsx`) yang terstruktur dan siap olah.

Platform ini mengintegrasikan antarmuka web modern berbasis **React 19, Vite, Tailwind CSS v4, dan Lucide Icons** dengan backend komputasi tinggi berbasis **FastAPI, pdfplumber, Pandas, & OpenPyXL**. Dilengkapi arsitektur *2-step pipeline* (Scanning & Parsing), platform ini menjamin waktu eksekusi sub-detik untuk pemindaian awal serta akurasi tinggi dalam konversi data.

---

## Fitur Utama (Key Features)

* **Dual-Step OCR & Scanning Workflow:**
  * **Fast Table Scan (`/api/scan-pdf`):** Pemindaian cepat struktur tabel pada 5 halaman pertama dokumen PDF menggunakan teknik *early exit* untuk menghemat sumber daya komputasi.
  * **Full Table Extraction (`/api/process-pdf`):** Ekstraksi rinci tabel PDF Treaty menjadi data JSON dan berkas spreadsheet Excel siap unduh.
* **Interactive Multi-Sheet Preview & Tab Navigation:**
  * Dukungan visualisasi multi-sheet secara *real-time* untuk tabel **Sliding Scale** dan **Profit Commission**.
  * Pengguna dapat memeriksa kelengkapan kolom dan baris data hasil parsing langsung di antarmuka web sebelum mengunduh berkas.
* **Persistent History & Audit Trail Portal:**
  * Pencatatan riwayat pemrosesan dokumen secara otomatis menggunakan *Client-Side LocalStorage Persistence* (`treaty_ocr_history`).
  * **Modal Table Preview:** Menampilkan kembali data tabel asli multi-sheet dari riwayat tanpa perlu mengekstraksi ulang PDF.
  * **Modal Delete Protection:** Konfirmasi keamanan sebelum menghapus rekaman riwayat dari antarmuka.
* **Optimasi Performa & Sanitasi Data:**
  * **Sub-Second PDF Scanning:** Optimasi *looping* pemindaian PDF yang membatasi pembacaan halaman awal dengan responsivitas tinggi.
  * **Null/NaN Sanitization:** Sanitasi otomatis nilai *missing data* dari Pandas DataFrame ke JSON `null` yang aman diserialisasi.
  * **Clean Excel Formatting:** Generasi berkas `.xlsx` sementara dengan penghapusan garis *border/font* default agar bersih saat dibuka di Excel.

---

## Arsitektur Sistem

```text
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend (Web Portal)                 │
│  - Tailwind CSS v4 Modern Workspace & Emerald Theme UI     │
│  - Cedant Selector & 2-Step Drag-and-Drop PDF Uploader      │
│  - Interactive Multi-Sheet Table Preview (Sliding & Profit) │
│  - Persistent History Portal with Search & Delete Confirm   │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON / Multipart Form)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 FastAPI Backend Engine                      │
│  - Fast PDF Scanner Endpoint (/api/scan-pdf with Early Exit)│
│  - Dynamic Parser Factory (TripakartaParser / ACAParser)   │
│  - Data Sanitizer & OpenPyXL Excel Formatting Engine        │
│  - File Download Stream (/api/download/{file_id})           │
└──────────────────────────────┬──────────────────────────────┘
                               │ In-Memory Stream / Temp File Store
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Engine Komputasi & File Temp                │
│  - pdfplumber PDF Table & Vector Reader                     │
│  - Pandas Data Matrix & Dataframe Cleaner                   │
│  - OS Temp File Store (Extracted XLSX Output Storage)       │
└─────────────────────────────────────────────────────────────┘
