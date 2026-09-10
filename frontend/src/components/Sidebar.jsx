import React from 'react';
import { 
  LayoutDashboard, FileUp, History, Settings, FileSpreadsheet 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Upload PDF', icon: FileUp, isHighlight: true },
    { name: 'History', icon: History },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 p-5 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-xs">
      <div className="space-y-6">
        {/* Logo App */}
        <div className="flex items-center gap-3 px-2">
          <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">Treaty OCR</span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-200/80' 
                    : item.isHighlight
                    ? 'text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/60'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${
                  isActive || item.isHighlight ? 'text-emerald-600' : 'text-slate-400'
                }`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            AR
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">Abu Rizky</p>
            <p className="text-[10px] font-medium text-slate-400">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}