# Frontend Architecture & Structure Documentation

**Project Name:** Indore Treaty RU - OCR Scanner  
**Tech Stack:** React (Vite), Tailwind CSS, Lucide React, Axios  
**Color Palette:** Emerald-Slate Theme  

---

## Directory Structure

```text
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── logo.png                # Logo kustom untuk branding aplikasi
│   ├── components/                 # Komponen Global / Tata Letak (Layout)
│   │   ├── Header.jsx              # Komponen header bersih (judul & subjudul)
│   │   └── Sidebar.jsx             # Sidebar navigasi minimalis dengan logo branding
│   ├── features/                   # Komponen Modular Berbasis Fitur
│   │   ├── forms/
│   │   │   └── components/
│   │   │       └── PDFUploader.jsx  # Fitur 2-step pemindaian & ekstraksi PDF dengan pratinjau multi-sheet
│   │   └── history/
│   │       └── components/
│   │           └── HistoryTable.jsx # Manajemen riwayat dengan localStorage & modal pratinjau
│   ├── pages/                      # Tampilan Halaman / Rute (Routes)
│   │   ├── DashboardPage.jsx       # Tampilan dashboard status 'Coming Soon'
│   │   ├── HistoryPage.jsx         # Halaman riwayat hasil ekstraksi dokumen
│   │   └── OCRPage.jsx             # Halaman utama untuk pengunggahan & pemrosesan PDF
│   ├── App.jsx                     # Tata letak utama aplikasi & pengalih tab navigasi
│   ├── main.jsx                    # Titik masuk (entry point) aplikasi React
│   └── index.css                   # Gaya global Tailwind CSS
├── .gitignore
├── package.json
├── tailwind.config.js
└── vite.config.js