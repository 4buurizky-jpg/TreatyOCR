import React from 'react';
import Header from '../components/Header';
import PDFUploader from '../features/forms/components/PDFUploader';

export default function OCRPage() {
  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto">
      <Header 
        title="Upload & Ekstraksi PDF" 
        subtitle="Unggah dokumen PDF Treaty untuk diekstrak menjadi berkas Excel" 
      />
      <PDFUploader />
    </div>
  );
}