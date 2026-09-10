import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import FormsPage from './pages/FormsPage';
import OCRPage from './pages/OCRPage';

export default function App() {
  // Set default tab ke 'Upload PDF' atau 'Forms'
  const [activeTab, setActiveTab] = useState('Upload PDF');

  const renderPage = () => {
    switch (activeTab) {
      case 'Upload PDF':
        return <OCRPage />;
      case 'Forms':
        return <FormsPage />;
      default:
        return (
          <div className="flex-1 p-8 flex items-center justify-center text-slate-400 text-sm">
            Halaman <span className="font-semibold text-slate-600 mx-1">{activeTab}</span> sedang dalam pengembangan.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderPage()}
    </div>
  );
}