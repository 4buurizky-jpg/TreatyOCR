import React, { useState } from 'react';
import axios from 'axios';
import { 
  UploadCloud, FileText, Download, CheckCircle2, 
  AlertCircle, Loader2, Trash2, FileSpreadsheet, RefreshCw 
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

export default function PDFUploader({ onProcessSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Handle Pilih File
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

  // Drag & Drop Handlers
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

  // Kirim PDF ke FastAPI Backend
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
      if (onProcessSuccess) onProcessSuccess(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Gagal memproses dokumen PDF. Pastikan backend FastAPI berjalan.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Unduh Hasil Excel
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
    <section className="space-y-6">
      {/* Upload Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Unggah Berkas PDF Treaty</h2>
            <p className="text-xs text-slate-500">Pilih atau seret dokumen PDF untuk diekstrak otomatis ke Excel</p>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                : 'border-slate-200 hover:border-emerald-400 bg-slate-50/50'
            }`}
          >
            <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-200 mb-3 text-emerald-600">
              <UploadCloud className="w-8 h-8" />
            </div>
            
            <p className="text-sm font-semibold text-slate-700 mb-1">
              Tarik & lepas berkas PDF di sini
            </p>
            <p className="text-xs text-slate-400 mb-4">Mendukung berkas PDF hingga 15MB</p>

            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition inline-flex items-center gap-2"
            >
              Pilih Berkas Manual
            </label>
          </div>

          {/* Card File Terpilih */}
          {file && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 text-emerald-900">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-semibold truncate">{file.name}</p>
                  <p className="text-[10px] text-emerald-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 text-emerald-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Hapus File"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2.5 text-xs text-rose-700 bg-rose-50 p-3.5 rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Tombol Ekstraksi */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengekstrak Data Tabel PDF...
              </>
            ) : (
              'Proses Ekstraksi PDF'
            )}
          </button>
        </div>
      </div>

      {/* Result Preview Section */}
      {result && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Ekstraksi Berhasil</h3>
                <p className="text-xs text-slate-500">{result.file_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Unduh File Excel
              </button>
            </div>
          </div>

          {/* Tabel Sliding Scale Preview */}
          {result.data?.sliding_scale?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pratinjau Tabel: Sliding Scale</h4>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {result.data.sliding_scale.length} Baris Data
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead className="text-[11px] text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
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
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {result.data.sliding_scale.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">{row.Reinsured}</td>
                        <td className="px-4 py-3">{row.Type_COB}</td>
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
          )}
        </div>
      )}
    </section>
  );
}