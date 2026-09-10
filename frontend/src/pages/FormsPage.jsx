import React from 'react';
import Header from '../components/Header';
import StatsOverview from '../features/forms/components/StatsOverview';
import FormCardList from '../features/forms/components/FormCardList';

export default function FormsPage() {
  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto">
      <Header 
        title="Treaty OCR Dashboard" 
        subtitle="Ringkasan dan daftar riwayat dokumen PDF yang terproses" 
      />
      <StatsOverview />
      <FormCardList />
    </div>
  );
}