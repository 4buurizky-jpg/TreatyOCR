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
│   │   └── logo.png                # Custom PNG Branding Logo
│   ├── components/                 # Global / Layout Components
│   │   ├── Header.jsx              # Clean header component (title & subtitle)
│   │   └── Sidebar.jsx             # Minimalist navigation sidebar with logo branding
│   ├── features/                   # Feature-based Modular Components
│   │   ├── forms/
│   │   │   └── components/
│   │   │       └── PDFUploader.jsx  # 2-Step PDF scan & extract with multi-sheet preview
│   │   └── history/
│   │       └── components/
│   │           └── HistoryTable.jsx # History management with localStorage & preview modal
│   ├── pages/                      # Page Views / Routes
│   │   ├── DashboardPage.jsx       # Coming Soon dashboard view
│   │   ├── HistoryPage.jsx         # Processed extraction history page
│   │   └── OCRPage.jsx             # Main PDF Upload & Processing workspace
│   ├── App.jsx                     # Root application layout & tab switcher
│   ├── main.jsx                    # Application entry point
│   └── index.css                   # Tailwind CSS global styles
├── .gitignore
├── package.json
├── tailwind.config.js
└── vite.config.js