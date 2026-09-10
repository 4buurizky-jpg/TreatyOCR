import React from 'react';
import { FileCheck, FileSpreadsheet, Percent, Clock } from 'lucide-react';

export default function StatsOverview() {
  const stats = [
    { 
      label: 'Total Dokumen PDF', 
      value: '12', 
      badge: '+2 bulan ini', 
      icon: FileCheck 
    },
    { 
      label: 'Baris Data Diekstrak', 
      value: '3,273', 
      badge: '+14%', 
      icon: FileSpreadsheet 
    },
    { 
      label: 'Akurasi Ekstraksi', 
      value: '99.2%', 
      badge: '+0.5%', 
      icon: Percent 
    },
    { 
      label: 'Rata-rata Waktu Proses', 
      value: '2.4s', 
      badge: 'Sangat Cepat', 
      isNeutral: true, 
      icon: Clock 
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div 
            key={idx} 
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-3"
          >
            {/* Top Row: Label & Icon */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">{item.label}</span>
              <div className="p-2 bg-slate-50 rounded-xl text-slate-600 border border-slate-100">
                <Icon className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            {/* Bottom Row: Value & Badge */}
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{item.value}</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                item.isNeutral 
                  ? 'text-slate-600 bg-slate-100 border-slate-200' 
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200/80'
              }`}>
                {item.badge}
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
}