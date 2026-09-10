import React, { useState } from 'react';
import axios from 'axios';
import { 
  UploadCloud, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Handle pilih file manual
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Format berkas harus berupa PDF.');
        return;
      }
      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== 'application/pdf') {
        setError('Format berkas harus berupa PDF.');
        return;
      }
      setFile(droppedFile);
      setError('');
      setResult(null);
    }
  };

  // Process PDF to API
  const handleUpload = async () => {
    if (!file) {
      setError('Silakan pilih berkas PDF terlebih dahulu.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/process-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Gagal memproses dokumen PDF. Pastikan server backend FastAPI berjalan.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Download Excel
  const handleDownload = () => {
    if (result?.download_id) {
      window.open(`${API_BASE_URL}/download/${result.download_id}`, '_blank');
    }
  };

  // Reset Form
  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2 rounded-lg shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Treaty OCR Extractor</h1>
              <p className="text-xs text-slate-500">Konversi Otomatis Slip PDF Treaty ke Excel</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            FastAPI + React
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        
        {/* TAMPILAN 1: Form Upload */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 transition-all">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">Unggah Dokumen PDF</h2>
              <p className="text-sm text-slate-500">Pilih atau seret dokumen PDF Treaty yang ingin diekstrak</p>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <div className="bg-white p-3 rounded-full shadow-sm border border-slate-200 mb-3">
                <UploadCloud className="w-8 h-8 text-emerald-600" />
              </div>
              
              <p className="text-sm font-medium text-slate-700 mb-1">
                Tarik & lepas berkas PDF di sini
              </p>
              <p className="text-xs text-slate-400 mb-4">Mendukung file .pdf hingga 15MB</p>

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm shadow-sm transition inline-flex items-center gap-2"
              >
                Pilih Berkas Manual
              </label>
            </div>

            {/* Selected File Card */}
            {file && (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-900">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-emerald-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="p-1.5 text-emerald-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Hapus File"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Alert Error */}
            {error && (
              <div className="flex items-center gap-2.5 text-sm text-rose-700 bg-rose-50 p-3.5 rounded-xl border border-rose-200">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Process Button */}
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengekstrak Data PDF...
                </>
              ) : (
                'Proses Dokumen PDF'
              )}
            </button>
          </div>
        </section>

        {/* TAMPILAN 2: Loading State Overlay Card */}
        {loading && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-3 animate-pulse">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">Sedang Memproses Dokumen...</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Sistem Python sedang mengekstrak tabel Sliding Scale dari berkas PDF kamu.
            </p>
          </section>
        )}

        {/* TAMPILAN 3: Result & Table Preview */}
        {result && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            
            {/* Header Result */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Ekstraksi Berhasil</h3>
                  <p className="text-xs text-slate-500">{result.file_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl transition inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Unduh Berkas Excel
                </button>
              </div>
            </div>

            {/* Table Preview: Sliding Scale */}
            {result.data?.sliding_scale?.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">Pratinjau Tabel: Sliding Scale</h4>
                  <span className="text-xs text-slate-400">
                    {result.data.sliding_scale.length} baris terdeteksi
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                  <table className="w-full text-xs text-left text-slate-600">
                    <thead className="text-[11px] text-slate-700 uppercase bg-slate-100 border-b border-slate-200 tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Reinsured</th>
                        <th className="px-4 py-3">Type COB</th>
                        <th className="px-4 py-3">Section</th>
                        <th className="px-4 py-3">Provision Commission</th>
                        <th className="px-4 py-3">Bottom LR</th>
                        <th className="px-4 py-3">Upper LR</th>
                        <th className="px-4 py-3">RI Commission</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {result.data.sliding_scale.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900">{row.Reinsured}</td>
                          <td className="px-4 py-3 max-w-[200px] truncate">{row.Type_COB}</td>
                          <td className="px-4 py-3">{row.Section}</td>
                          <td className="px-4 py-3">{row.Provision_Commission}%</td>
                          <td className="px-4 py-3">{row.Bottom_LR ?? '-'}</td>
                          <td className="px-4 py-3">{row.Upper_LR ?? '-'}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-600">{row.RI_Commission}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-xs">
                Tidak ada data tabel Sliding Scale yang dapat ditampilkan dalam pratinjau.
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}