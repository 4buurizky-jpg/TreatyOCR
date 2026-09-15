import React, { useState } from 'react';
import axios from 'axios';
import { 
  UploadCloud, FileText, Download, CheckCircle2, 
  AlertCircle, Loader2, Trash2, RefreshCw, Scan, Building2, TableProperties, FileSpreadsheet
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

export default function PDFUploader({ onProcessSuccess }) {
  const [file, setFile] = useState(null);
  const [cedant, setCedant] = useState('auto');
  
  // States Alur Pemrosesan
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // Active Sheet Tab State ('sliding' atau 'profit')
  const [activeSheet, setActiveSheet] = useState('sliding');

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
      setScanResult(null);
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
      setScanResult(null);
    }
  };

  // Step 1: Scan Dokumen Riil ke Backend FastAPI
  const handleScanDocument = async () => {
    if (!file) return;

    setIsScanning(true);
    setError('');
    setScanResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/scan-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setScanResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Gagal memindai berkas PDF. Pastikan backend FastAPI berjalan.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  // Step 2: Kirim PDF ke Backend untuk Ekstraksi
  const handleUpload = async () => {
    if (!file) {
      setError('Silakan pilih berkas PDF terlebih dahulu.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('cedant', cedant);

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/process-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const resData = response.data;
      setResult(resData);

      // Otomatis pilih tab sheet yang ada datanya
      if (resData.data?.sliding_scale?.length > 0) {
        setActiveSheet('sliding');
      } else if (resData.data?.profit_commission?.length > 0) {
        setActiveSheet('profit');
      }

      // Simpan Riwayat ke LocalStorage
      const now = new Date();
      const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);

      const totalRows = (resData.data?.sliding_scale?.length || 0) + (resData.data?.profit_commission?.length || 0);

      const newHistoryItem = {
        id: `doc-${Date.now()}`,
        fileName: file.name,
        downloadId: resData.download_id || `${file.name.replace('.pdf', '')}.xlsx`,
        parsedType: cedant === 'tripakarta' ? 'Tri Pakarta' : cedant === 'aca' ? 'ACA Insurance' : (resData.parsed_type || 'Auto Detect'),
        rowsCount: totalRows,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        processedAt: formattedDate,
        status: 'Selesai',
        extractedData: resData.data || {}
      };

      const existingHistory = JSON.parse(localStorage.getItem('treaty_ocr_history') || '[]');
      localStorage.setItem('treaty_ocr_history', JSON.stringify([newHistoryItem, ...existingHistory]));

      if (onProcessSuccess) onProcessSuccess(resData);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Gagal memproses dokumen PDF. Pastikan backend FastAPI berjalan.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset Form
  const handleReset = () => {
    setFile(null);
    setResult(null);
    setScanResult(null);
    setError('');
  };

  return (
    <section className="space-y-6">
      {/* Upload Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-5">
          
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Unggah Berkas PDF Treaty</h2>
            <p className="text-xs text-slate-500">Pilih Cedant dan pindai struktur tabel sebelum ekstraksi Excel</p>
          </div>

          {/* Selector Cedant */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Pilih Cedant / Asuransi Ceding:
            </label>
            <select
              value={cedant}
              onChange={(e) => setCedant(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition cursor-pointer"
            >
              <option value="auto">Deteksi Otomatis (Auto Detect)</option>
              <option value="tripakarta">PT Asuransi Tri Pakarta</option>
              <option value="aca">PT Asuransi Central Asia (ACA)</option>
            </select>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-7 text-center flex flex-col items-center justify-center transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                : 'border-slate-200 hover:border-emerald-400 bg-slate-50/50'
            }`}
          >
            <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-200 mb-3 text-emerald-600">
              <UploadCloud className="w-7 h-7" />
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

          {/* Action Bar Pemindaian */}
          {file && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-semibold truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!scanResult && (
                    <button
                      type="button"
                      onClick={handleScanDocument}
                      disabled={isScanning}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Scan className="w-3.5 h-3.5" />}
                      {isScanning ? 'Pindai...' : 'Pindai Tabel'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Hapus File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Hasil Pindai */}
              {scanResult && (
                <div className={`flex items-start gap-2.5 p-3.5 rounded-xl text-xs border ${
                  scanResult.table_detected 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  <TableProperties className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">{scanResult.message}</p>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      {scanResult.table_detected 
                        ? 'Tabel siap diekstrak. Silakan klik tombol di bawah untuk memulai OCR.' 
                        : 'Tidak ada tabel valid untuk diekstrak pada file ini.'}
                    </p>
                  </div>
                </div>
              )}
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
            disabled={loading || !file || !scanResult?.table_detected}
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

      {/* RESULT PREVIEW WITH MULTI-SHEET TABS */}
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
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                type="button"
                onClick={() => window.open(`${API_BASE_URL}/download/${result.download_id}`, '_blank')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Unduh File Excel
              </button>
            </div>
          </div>

          {/* TAB NAVIGATION FOR SHEETS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              {result.data?.sliding_scale?.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveSheet('sliding')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                    activeSheet === 'sliding'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Sliding Scale ({result.data.sliding_scale.length})
                </button>
              )}

              {result.data?.profit_commission?.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveSheet('profit')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                    activeSheet === 'profit'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Profit Commission ({result.data.profit_commission.length})
                </button>
              )}
            </div>

            {/* SHEET 1: SLIDING SCALE */}
            {activeSheet === 'sliding' && result.data?.sliding_scale?.length > 0 && (
              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead className="text-[11px] text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      {Object.keys(result.data.sliding_scale[0]).map((col, idx) => (
                        <th key={idx} className="px-4 py-3">{col.replace(/_/g, ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {result.data.sliding_scale.map((row, idx) => (
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
              </div>
            )}

            {/* SHEET 2: PROFIT COMMISSION */}
            {activeSheet === 'profit' && result.data?.profit_commission?.length > 0 && (
              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead className="text-[11px] text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      {Object.keys(result.data.profit_commission[0]).map((col, idx) => (
                        <th key={idx} className="px-4 py-3">{col.replace(/_/g, ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {result.data.profit_commission.map((row, idx) => (
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
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}