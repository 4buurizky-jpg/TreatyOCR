import React, { useState } from 'react';
import axios from 'axios';
import {
  Eye, EyeOff, ArrowLeft, ArrowRight,
  AlertCircle, Loader2, ShieldCheck, KeyRound
} from 'lucide-react';
import logoPng from '../assets/logo.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const SLIDES = [
  {
    quote: 'Ekstraksi dokumen Treaty Slip & Bordero ke Excel dalam hitungan detik.',
    subtitle: 'Otomasi OCR & validasi tabel reasuransi secara akurat.',
  },
  {
    quote: 'Kelola Sliding Scale dan Profit Commission tanpa input manual.',
    subtitle: 'Mendukung format tabel bergaris maupun tanpa garis tepi.',
  },
  {
    quote: 'Terintegrasi dengan standar keamanan data perusahaan.',
    subtitle: 'Indore Treaty RU — Treaty OCR Extractor System.',
  },
];

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { username, password },
        { withCredentials: true }
      );

      const userData = response.data.user || {
        full_name: 'Abu Rizki',
        username,
        role: 'Admin',
      };
      localStorage.setItem('ocr_user', JSON.stringify(userData));
      onLoginSuccess(userData);
    } catch (err) {
      // Fallback login lokal jika backend belum dijalankan saat demo
      if (
        (username === 'admin' && password === 'admin123') ||
        (username === 'aburizki' && password === 'abu123')
      ) {
        const demoUser = {
          full_name: username === 'admin' ? 'Administrator IndonesiaRe' : 'Abu Rizki',
          username,
          role: username === 'admin' ? 'Admin' : 'OCR Operator',
        };
        localStorage.setItem('ocr_user', JSON.stringify(demoUser));
        onLoginSuccess(demoUser);
        return;
      }

      setError(
        err.response?.data?.detail || 'Username atau password salah. Silakan periksa kembali.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = (roleType) => {
    setError('');
    if (roleType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
      setInfoMsg('Kredensial Admin diisi otomatis. Klik Sign In untuk masuk.');
    } else {
      setUsername('aburizki');
      setPassword('abu123');
      setInfoMsg('Kredensial Operator diisi otomatis. Klik Sign In untuk masuk.');
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-200 via-emerald-950/15 to-slate-300 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      
      {/* MAIN ROUNDED CARD CONTAINER */}
      <div className="max-w-5xl w-full bg-[#F7F8FA] rounded-[32px] shadow-[0_24px_60px_-15px_rgba(15,23,42,0.18)] border border-white/80 p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        
        {/* KOLOM KIRI: FORM LOGIN */}
        <div className="lg:col-span-6 flex flex-col justify-center px-6 sm:px-12 py-10">
          
          {/* Brand Badge Kecil */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src={logoPng} alt="Logo" className="w-6 h-6 object-contain" />
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-700">
              Indore Treaty RU
            </span>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Hello Again!
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-2">
              Masuk untuk mengelola ekstraksi dokumen Treaty OCR
            </p>
          </div>

          {/* Alert Error / Info */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {infoMsg && !error && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2.5 text-emerald-700 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username atau Email"
                className="w-full px-4 py-3.5 bg-white text-sm text-slate-800 placeholder-slate-400 rounded-2xl border border-slate-200/70 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 transition"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-4 pr-11 py-3.5 bg-white text-sm text-slate-800 placeholder-slate-400 rounded-2xl border border-slate-200/70 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setInfoMsg('Hubungi Administrator IT Starcore / IndonesiaRe untuk reset password.')}
                className="text-[11px] font-medium text-slate-400 hover:text-emerald-600 transition cursor-pointer"
              >
                Recovery Password
              </button>
            </div>

            {/* Tombol Sign In dengan efek elevasi */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm rounded-2xl shadow-[0_10px_25px_-5px_rgba(5,150,105,0.45)] hover:shadow-[0_14px_28px_-5px_rgba(5,150,105,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider "Or continue with" */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="px-3 bg-[#F7F8FA] text-slate-400 font-medium">
                Or quick access with
              </span>
            </div>
          </div>

          {/* 3 Tombol Ikon Bawah (Google SSO, Microsoft SSO, Demo Akun) */}
          <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto w-full">
            {/* Google SSO */}
            <button
              type="button"
              onClick={() => setInfoMsg('Google SSO aktif setelah CLIENT_ID dikonfigurasi di .env')}
              title="Login dengan Google"
              className="h-12 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-center shadow-2xs hover:shadow-sm transition cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"/>
                <path fill="#FBBC05" d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"/>
                <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 21.1 7.4 24 12 24z"/>
              </svg>
            </button>

            {/* Microsoft Entra ID SSO (Elevated Card seperti ikon tengah di referensi) */}
            <button
              type="button"
              onClick={() => setInfoMsg('Microsoft SSO aktif setelah TENANT_ID dikonfigurasi di .env')}
              title="Login dengan Microsoft"
              className="h-12 bg-white hover:bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-center shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
            </button>

            {/* Quick Fill Demo Account */}
            <button
              type="button"
              onClick={() => handleQuickDemoFill('admin')}
              title="Isi Otomatis Akun Admin Demo"
              className="h-12 bg-white hover:bg-emerald-50 border border-slate-200/80 rounded-2xl flex items-center justify-center text-emerald-600 shadow-2xs hover:shadow-sm transition cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KOLOM KANAN: PANEL ILUSTRASI ARTISTIC (SCENIC EMERALD & SUNSET) */}
        <div className="hidden lg:flex lg:col-span-6 relative rounded-[24px] overflow-hidden min-h-[540px] flex-col justify-end p-8 select-none">
          
          {/* Ilustrasi Lanskap Vektor SVG Senada Referensi */}
          <svg
            className="absolute inset-0 w-full h-full object-cover"
            viewBox="0 0 600 720"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#134e4a" />
                <stop offset="40%" stopColor="#0f766e" />
                <stop offset="75%" stopColor="#fcd34d" />
                <stop offset="100%" stopColor="#fef3c7" />
              </linearGradient>
              <radialGradient id="sunGlow" cx="30%" cy="32%" r="35%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#fef08a" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="cliffGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#065f46" />
              </linearGradient>
            </defs>

            {/* Langit */}
            <rect width="600" height="720" fill="url(#skyGrad)" />
            {/* Cahaya Matahari */}
            <circle cx="170" cy="230" r="180" fill="url(#sunGlow)" />
            <circle cx="170" cy="230" r="52" fill="#fffbeb" opacity="0.92" />

            {/* Gunung Latar Belakang */}
            <path d="M0,430 Q160,340 340,410 T600,380 L600,720 L0,720 Z" fill="#064e3b" opacity="0.45" />
            <path d="M0,480 Q240,440 460,490 T600,460 L600,720 L0,720 Z" fill="#047857" opacity="0.6" />

            {/* Tebing Geometris Modern (Gaya Referensi) */}
            <path
              d="M220,380 L600,370 L600,720 L480,720 C470,580 390,510 290,460 C230,430 200,400 220,380 Z"
              fill="url(#cliffGrad)"
            />
            <path
              d="M360,430 L600,425 L600,720 L510,720 C490,610 430,520 360,430 Z"
              fill="#022c22"
              opacity="0.85"
            />

            {/* Siluet Lapisan Bawah */}
            <path d="M0,650 Q220,610 450,660 T600,640 L600,720 L0,720 Z" fill="#022c22" />
          </svg>

          {/* Overlay Gradient Gelap Halus di Bawah Agar Teks Putih Terbaca Jelas */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/15 to-transparent" />

          {/* Konten Teks & Tombol Panah Slide (Persis Kiri Bawah Panel Kanan) */}
          <div className="relative z-10 text-white space-y-5 max-w-sm">
            <div className="space-y-1.5">
              <p className="text-lg font-semibold leading-snug tracking-tight drop-shadow-xs">
                {SLIDES[currentSlide].quote}
              </p>
              <p className="text-xs text-emerald-100/80">
                {SLIDES[currentSlide].subtitle}
              </p>
            </div>

            {/* Tombol Bulat Panah Kiri & Kanan */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prevSlide}
                className="w-9 h-9 rounded-full border border-white/50 hover:border-white hover:bg-white/15 flex items-center justify-center transition cursor-pointer"
                aria-label="Slide sebelumnya"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="w-9 h-9 rounded-full border border-white/50 hover:border-white hover:bg-white/15 flex items-center justify-center transition cursor-pointer"
                aria-label="Slide berikutnya"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}