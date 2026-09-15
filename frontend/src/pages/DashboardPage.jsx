import React from 'react';
import Header from '../components/Header';
import { Clock, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto">
      <Header 
        title="Dashboard" 
        subtitle="Ringkasan dan analitik pemrosesan dokumen Treaty OCR" 
      />

      {/* Card Coming Soon */}
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xs my-auto">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-xs">
          <Clock className="w-7 h-7" />
        </div>

        <div className="space-y-1.5 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold border border-emerald-200/80 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Fitur Dalam Pengembangan
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Dashboard Segera Hadir
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Halaman analitik statistik ekstraksi, grafik volume berkas, dan indikator performa model OCR sedang dalam proses penyiapan.
          </p>
        </div>
      </div>
    </div>
  );
}