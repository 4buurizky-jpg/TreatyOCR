import React from 'react';
import { Search, Bell, Sparkles, FileUp } from 'lucide-react';

export default function Header({ title = "Treaty OCR Extractor", subtitle = "Ekstraksi data PDF Treaty ke format Excel otomatis" }) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari dokumen..." 
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-56 shadow-xs transition"
          />
        </div>

        {/* Notification Bell */}
        <button 
          type="button" 
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs cursor-pointer"
          title="Notifikasi"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* AI Insight Button */}
        <button 
          type="button" 
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Get AI Insight</span>
        </button>

        {/* Upload PDF Button */}
        <button 
          type="button" 
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-emerald-700 transition cursor-pointer"
        >
          <FileUp className="w-4 h-4" />
          <span>Upload PDF Baru</span>
        </button>
      </div>
    </header>
  );
}