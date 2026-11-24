import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileUp, History, Settings, LogOut, 
  ChevronDown, ChevronRight, FileText, FileSpreadsheet,
  HardDrive, Cpu, Users, BookOpen
} from 'lucide-react';

// Import logo IndonesiaRe
import logoPng from '../assets/logo.png'; 

export default function Sidebar({ activeTab, setActiveTab, selectedDocType, setSelectedDocType }) {
  const [isBorderoOpen, setIsBorderoOpen] = useState(true);
  const [storedDocsCount, setStoredDocsCount] = useState(0);

  // Hitung jumlah dokumen di LocalStorage untuk widget
  useEffect(() => {
    const updateStats = () => {
      const saved = JSON.parse(localStorage.getItem('treaty_ocr_history') || '[]');
      setStoredDocsCount(saved.length);
    };
    updateStats();
    window.addEventListener('ocr_history_updated', updateStats);
    return () => window.removeEventListener('ocr_history_updated', updateStats);
  }, []);

  const handleSelectSubMenu = (docType) => {
    setActiveTab('Hasil OCR');
    if (setSelectedDocType) {
      setSelectedDocType(docType);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-xs">
      
      {/* BAGIAN ATAS & TENGAH (NAVIGASI & WIDGETS) */}
      <div className="space-y-6 overflow-y-auto pr-1">
        
        {/* LOGO & BRANDING */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1 shrink-0 shadow-2xs">
            <img 
              src={logoPng} 
              alt="IndonesiaRe Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-slate-900 tracking-tight leading-snug truncate">
              Indore Treaty RU
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 tracking-wide">
              OCR Scanner
            </span>
          </div>
        </div>

        {/* MENU NAVIGASI UTAMA */}
        <nav className="space-y-1.5">
          
          {/* DASHBOARD */}
          <button
            type="button"
            onClick={() => setActiveTab('Dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'Dashboard' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${activeTab === 'Dashboard' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Dashboard</span>
          </button>

          {/* UPLOAD PDF */}
          <button
            type="button"
            onClick={() => setActiveTab('Upload PDF')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'Upload PDF' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileUp className={`w-4 h-4 ${activeTab === 'Upload PDF' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Upload PDF</span>
          </button>

          {/* DROPDOWN MENU: BORDERO / FINAL SLIP */}
          <div className="pt-2 space-y-1">
            <button
              type="button"
              onClick={() => setIsBorderoOpen(!isBorderoOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="uppercase tracking-wider text-[10px]">Bordero / Final Slip</span>
              </div>
              {isBorderoOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {isBorderoOpen && (
              <div className="ml-3 pl-2.5 border-l border-slate-200/80 space-y-1">
                
                {/* SUB-MENU: FINAL SLIP */}
                <button
                  type="button"
                  onClick={() => handleSelectSubMenu('Final Slip')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'Hasil OCR' && selectedDocType === 'Final Slip'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className={`w-3.5 h-3.5 ${
                      activeTab === 'Hasil OCR' && selectedDocType === 'Final Slip' ? 'text-emerald-600' : 'text-slate-400'
                    }`} />
                    <span>Final Slip</span>
                  </div>
                </button>

                {/* SUB-MENU: TREATY SLIP */}
                <button
                  type="button"
                  onClick={() => handleSelectSubMenu('Treaty Slip')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'Hasil OCR' && selectedDocType === 'Treaty Slip'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className={`w-3.5 h-3.5 ${
                      activeTab === 'Hasil OCR' && selectedDocType === 'Treaty Slip' ? 'text-emerald-600' : 'text-slate-400'
                    }`} />
                    <span>Treaty Slip</span>
                  </div>
                </button>

              </div>
            )}
          </div>

          <hr className="border-slate-100 my-2" />

          {/* RIWAYAT PEMROSESAN */}
          <button
            type="button"
            onClick={() => setActiveTab('History')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'History' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <History className={`w-4 h-4 ${activeTab === 'History' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Riwayat Pemrosesan</span>
            </div>
            {storedDocsCount > 0 && (
              <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded-full text-slate-600">
                {storedDocsCount}
              </span>
            )}
          </button>

          {/* USER MANAGEMENT */}
          <button
            type="button"
            onClick={() => setActiveTab('User Management')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'User Management' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'User Management' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Manajemen Pengguna</span>
          </button>

          {/* USER GUIDE */}
          <button
            type="button"
            onClick={() => setActiveTab('User Guide')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'User Guide' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'User Guide' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Panduan Pengguna</span>
          </button>

          {/* SETTINGS */}
          <button
            type="button"
            onClick={() => setActiveTab('Settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'Settings' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className={`w-4 h-4 ${activeTab === 'Settings' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Pengaturan</span>
          </button>

        </nav>

        {/* WIDGET STATUS SISTEM & STORAGE */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              OCR Engine
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active
            </span>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-slate-400" />
                Local Storage
              </span>
              <span className="font-semibold text-slate-700">{storedDocsCount} Berkas</span>
            </div>
            
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300" 
                style={{ width: `${Math.min((storedDocsCount / 20) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER USER PROFILE */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between px-1 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
            AR
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-slate-800 truncate" title="Abu Rizki">
              Abu Rizki
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              OCR Operator
            </span>
          </div>
        </div>

        <button
          type="button"
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}