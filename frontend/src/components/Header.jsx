import React from 'react';

export default function Header({ 
  title = "Treaty OCR Extractor", 
  subtitle = "Ekstraksi data PDF Treaty ke format Excel otomatis" 
}) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>
    </header>
  );
}