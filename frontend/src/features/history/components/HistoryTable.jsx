import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Download, Search, CheckCircle2, 
  Trash2, Eye, X, AlertTriangle 
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

export default function HistoryTable() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // State Modal Preview
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeSheet, setActiveSheet] = useState('sliding');

  // State Modal Hapus
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Load data dari localStorage
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('treaty_ocr_history') || '[]');
    setHistory(savedHistory);
  }, []);

  // Set active sheet otomatis saat modal dibuka
  useEffect(() => {
    if (selectedDoc?.extractedData) {
      const data = selectedDoc.extractedData;
      if (Array.isArray(data) && data.length > 0) {
        setActiveSheet('sliding');
      } else if (data.sliding_scale?.length > 0) {
        setActiveSheet('sliding');
      } else if (data.profit_commission?.length > 0) {
        setActiveSheet('profit');
      }
    }
  }, [selectedDoc]);

  // Handler Hapus Item
  const confirmDelete = () => {
    if (!deleteTarget) return;
    const updatedHistory = history.filter((item) => item.id !== deleteTarget.id);
    setHistory(updatedHistory);
    localStorage.setItem('treaty_ocr_history', JSON.stringify(updatedHistory));
    setDeleteTarget(null);
  };

  // Filter Search & Status
  const filteredData = history.filter((item) => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.parsedType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownload = (downloadId) => {
    window.open(`${API_BASE_URL}/download/${downloadId}`, '_blank');
  };

  // Helper Ambil Data Sheet
  const getSlidingData = () => {
    if (!selectedDoc?.extractedData) return [];
    if (Array.isArray(selectedDoc.extractedData)) return selectedDoc.extractedData;
    return selectedDoc.extractedData.sliding_scale || [];
  };

  const getProfitData = () => {
    if (!selectedDoc?.extractedData || Array.isArray(selectedDoc.extractedData)) return [];
    return selectedDoc.extractedData.profit_commission || [];
  };

  const slidingData = getSlidingData();
  const profitData = getProfitData();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
      
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari riwayat dokumen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-medium">
          {['Semua', 'Selesai', 'Gagal'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="text-[11px] text-slate-700 uppercase bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5">Nama Berkas</th>
              <th className="px-4 py-3.5">Tipe Parser</th>
              <th className="px-4 py-3.5">Hasil Baris</th>
              <th className="px-4 py-3.5">Waktu Proses</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 border border-emerald-100">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div className="max-w-xs truncate">
                        <p className="font-semibold text-slate-800 truncate" title={item.fileName}>
                          {item.fileName}
                        </p>
                        <p className="text-[10px] text-slate-400">{item.fileSize}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">{item.parsedType}</td>
                  <td className="px-4 py-3.5"><span className="font-semibold text-slate-800">{item.rowsCount}</span> Baris</td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{item.processedAt}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedDoc(item)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] transition flex items-center gap-1 cursor-pointer"
                        title="Lihat Tabel Data"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Tabel
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(item.downloadId)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] shadow-xs transition flex items-center gap-1 cursor-pointer"
                        title="Unduh Hasil Excel"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Excel
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Hapus dari Riwayat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                  Belum ada riwayat dokumen yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL PREVIEW TABEL DATA (MULTI-SHEET REUSE) */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedDoc.fileName}</h3>
                  <p className="text-[11px] text-slate-500">{selectedDoc.parsedType} • {selectedDoc.rowsCount} Baris Data</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB SELECTION PER SHEET */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              {slidingData.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveSheet('sliding')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    activeSheet === 'sliding'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  Sliding Scale ({slidingData.length})
                </button>
              )}

              {profitData.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveSheet('profit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    activeSheet === 'profit'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  Profit Commission ({profitData.length})
                </button>
              )}
            </div>

            {/* AREA TABEL DYNAMIC */}
            <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-xl">
              {activeSheet === 'sliding' && slidingData.length > 0 && (
                <table className="w-full text-xs text-left text-slate-600">
                  <thead className="text-[11px] text-slate-700 uppercase bg-slate-50 sticky top-0 border-b border-slate-200">
                    <tr>
                      {Object.keys(slidingData[0]).map((col, idx) => (
                        <th key={idx} className="px-4 py-3">{col.replace(/_/g, ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {slidingData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        {Object.values(row).map((val, colIdx) => (
                          <td key={colIdx} className="px-4 py-3">
                            {val != null ? String(val) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeSheet === 'profit' && profitData.length > 0 && (
                <table className="w-full text-xs text-left text-slate-600">
                  <thead className="text-[11px] text-slate-700 uppercase bg-slate-50 sticky top-0 border-b border-slate-200">
                    <tr>
                      {Object.keys(profitData[0]).map((col, idx) => (
                        <th key={idx} className="px-4 py-3">{col.replace(/_/g, ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {profitData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        {Object.values(row).map((val, colIdx) => (
                          <td key={colIdx} className="px-4 py-3">
                            {val != null ? String(val) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {slidingData.length === 0 && profitData.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  Data rinci tidak tersedia untuk dokumen riwayat ini.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleDownload(selectedDoc.downloadId)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Unduh Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Hapus Riwayat Dokumen?</h3>
              <p className="text-xs text-slate-500">
                Apakah Anda yakin ingin menghapus <span className="font-semibold text-slate-700">{deleteTarget.fileName}</span>?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs shadow-xs transition cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}