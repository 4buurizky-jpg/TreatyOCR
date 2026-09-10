import React, { useState } from 'react';
import { MoreVertical, FileText, Download, CheckCircle2 } from 'lucide-react';

export default function FormCardList() {
  const [filter, setFilter] = useState('Semua');

  const forms = [
    {
      title: 'Tri Pakarta 2024 Whole Account',
      desc: 'Ekstraksi PDF Slip Treaty QSSPL',
      time: '5 menit lalu',
      status: 'Aktif',
      rowsCount: '12 Baris Data',
      parsedStatus: 'Selesai',
    },
    {
      title: 'ACA Insurance Fire Treaty Q1',
      desc: 'Ekstraksi PDF Slip Treaty Fire',
      time: '12 menit lalu',
      status: 'Aktif',
      rowsCount: '8 Baris Data',
      parsedStatus: 'Selesai',
    },
  ];

  return (
    <section className="space-y-4">
      {/* Filter Tabs Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Dokumen Terproses</h2>
        
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-medium">
          {['Semua', 'Aktif', 'Dihentikan'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg transition ${
                filter === tab
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forms.map((item, idx) => (
          <div 
            key={idx} 
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all space-y-4"
          >
            {/* Top Info */}
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl h-fit border border-emerald-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc} • {item.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {item.status}
                </span>
                <button 
                  type="button" 
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Details Box */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Hasil Ekstraksi</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{item.rowsCount}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status OCR</span>
                <p className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {item.parsedStatus}
                </p>
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-1 flex items-center justify-end">
              <button 
                type="button" 
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Excel
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}