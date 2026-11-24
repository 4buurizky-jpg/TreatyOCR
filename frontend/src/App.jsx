import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import OCRPage from './pages/OCRPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import UserManagementPage from './pages/UserManagementPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('Upload PDF');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ocr_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setActiveTab('Upload PDF');
  };

  const handleLogout = () => {
    localStorage.removeItem('ocr_user');
    setCurrentUser(null);
  };

  // Jika belum login, tampilkan halaman Form Login
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardPage />;
      case 'Upload PDF':
        return <OCRPage />;
      case 'History':
        return <HistoryPage />;
      case 'User Management':
        return (
          <main className="flex-1 p-8 overflow-y-auto">
            <UserManagementPage />
          </main>
        );
      default:
        return (
          <div className="flex-1 p-8 flex items-center justify-center text-slate-400 text-sm">
            Halaman <span className="font-semibold text-slate-600 mx-1">{activeTab}</span> sedang dalam pengembangan.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-dot-pattern text-slate-800 font-sans flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      {renderPage()}
    </div>
  );
}