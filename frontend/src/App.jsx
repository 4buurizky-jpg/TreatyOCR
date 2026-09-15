import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import OCRPage from './pages/OCRPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('Upload PDF');

  const renderPage = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardPage />;
      case 'Upload PDF':
        return <OCRPage />;
      case 'History':
        return <HistoryPage />;
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