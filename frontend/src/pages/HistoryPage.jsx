import React from 'react';
import Header from '../components/Header';
import HistoryTable from '../features/history/components/HistoryTable';

export default function HistoryPage() {
  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto">
      <Header 
        title="Riwayat Ekstraksi OCR" 
        subtitle="Daftar seluruh berkas PDF Treaty yang telah berhasil diproses ke format Excel" 
      />
      <HistoryTable />
    </div>
  );
}