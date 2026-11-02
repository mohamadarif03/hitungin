import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import {
  Home,
  BookOpen,
  Calculator,
  Target,
  TrendingUp,
  HelpCircle,
  User,
  LogOut,
  AlignLeft,
  Search,
  Volume2,
  Maximize,
  RotateCw,
  SlidersHorizontal,
  ArrowRight,
  Mic,
  Hand,
  PenTool,
  Keyboard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Table,
  Eye,
  Info
} from 'lucide-react';

export default function SalesDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePeriod, setActivePeriod] = useState<'Minggu Ini' | 'Bulan Ini' | 'Level 1-6'>('Minggu Ini');
  const [showDataTable, setShowDataTable] = useState(false);
  const [voiceAssistance, setVoiceAssistance] = useState(false);

  const performanceChartRef = useRef<HTMLCanvasElement | null>(null);
  const radarChartRef = useRef<HTMLCanvasElement | null>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    let performanceChartInstance: Chart | null = null;
    let radarChartInstance: Chart | null = null;

    // 1. GRAFIK PERFORMA LATIHAN MATEMATIKA (Combo Line + Bar)
    if (performanceChartRef.current) {
      const perfCtx = performanceChartRef.current.getContext('2d');
      if (perfCtx) {
        // Label level materi sesuai PRD HITUNGIN
        const topics = ['L1 Bil.0-10', 'L2 Bil.11-100', 'L3 Tambah s.d 20', 'L4 Kurang s.d 20', 'L5 Tmb/Krg s.d 100', 'L6 Simpan/Pinjam'];
        performanceChartInstance = new Chart(perfCtx, {
          type: 'bar',
          data: {
            labels: topics,
            datasets: [
              // Garis Akurasi (%) - Hijau Teal
              {
                type: 'line',
                label: 'Akurasi Jawaban (%)',
                data: [96, 92, 88, 85, 76, 70],
                borderColor: '#10b981',
                backgroundColor: '#10b981',
                borderWidth: 2.2,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#10b981',
                order: 1
              },
              // Bar Ungu: Soal Benar Langsung (Mandiri)
              {
                type: 'bar',
                label: 'Soal Benar Mandiri',
                data: [30, 28, 25, 22, 18, 15],
                backgroundColor: '#8b5cf6',
                borderRadius: 4,
                barPercentage: 0.55,
                categoryPercentage: 0.65,
                order: 2
              },
              // Bar Pink: Soal Butuh Petunjuk / Ulang
              {
                type: 'bar',
                label: 'Perlu Petunjuk / Ulang',
                data: [2, 3, 5, 6, 9, 11],
                backgroundColor: '#ec4899',
                borderRadius: 4,
                barPercentage: 0.55,
                categoryPercentage: 0.65,
                order: 3
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: '#1e293b',
                padding: 10,
                cornerRadius: 8,
                titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
                bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
              }
            },
            scales: {
              x: {
                grid: {
                  display: true,
                  color: '#f8fafc'
                },
                ticks: {
                  color: '#64748b',
                  font: {
                    family: "'Plus Jakarta Sans', sans-serif",
                    size: 10
                  }
                },
                border: {
                  display: false
                }
              },
              y: {
                min: 0,
                max: 100,
                grid: {
                  color: '#f1f5f9',
                  borderDash: [3, 3]
                },
                ticks: {
                  color: '#94a3b8',
                  stepSize: 20,
                  font: {
                    size: 10
                  }
                },
                border: {
                  display: false
                }
              }
            }
          } as any
        });
      }
    }

    // 2. RADAR CHART: DISTRIBUSI & FREKUENSI 4 JALUR AKSES SISWA (PRD S-22 - S-26)
    if (radarChartRef.current) {
      const radarCtx = radarChartRef.current.getContext('2d');
      if (radarCtx) {
        radarChartInstance = new Chart(radarCtx, {
          type: 'radar',
          data: {
            labels: ['Mengenal Angka', 'Hitung Cepat', 'Konfirmasi', 'Latihan Mandiri', 'Ulangi Soal', 'Soal Cerita', 'Evaluasi'],
            datasets: [
              // Jalur Suara (Tunanetra & Nyaman Suara)
              {
                label: 'Jalur Suara (Mic)',
                data: [85, 75, 90, 80, 70, 85, 80],
                backgroundColor: 'rgba(139, 92, 246, 0.4)',
                borderColor: '#8b5cf6',
                borderWidth: 1.8,
                pointRadius: 2
              },
              // Jalur Isyarat Tangan (Tuli & Belajar Isyarat)
              {
                label: 'Jalur Isyarat (Kamera)',
                data: [70, 60, 65, 85, 75, 80, 70],
                backgroundColor: 'rgba(16, 185, 129, 0.3)',
                borderColor: '#10b981',
                borderWidth: 1.5,
                pointRadius: 2
              },
              // Jalur Tulisan Tangan & Keyboard
              {
                label: 'Tulisan Kanvas & Keyboard',
                data: [60, 80, 50, 70, 65, 60, 75],
                backgroundColor: 'rgba(245, 158, 11, 0.3)',
                borderColor: '#f59e0b',
                borderWidth: 1.5,
                pointRadius: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              r: {
                min: 0,
                max: 100,
                beginAtZero: true,
                angleLines: {
                  color: '#e2e8f0'
                },
                grid: {
                  color: '#f1f5f9'
                },
                pointLabels: {
                  color: '#64748b',
                  font: {
                    family: "'Plus Jakarta Sans', sans-serif",
                    size: 9,
                    weight: 600
                  }
                },
                ticks: {
                  stepSize: 25,
                  color: '#94a3b8',
                  backdropColor: 'transparent',
                  font: {
                    size: 8,
                    weight: 600
                  }
                }
              }
            }
          } as any
        });
      }
    }

    return () => {
      if (performanceChartInstance) {
        performanceChartInstance.destroy();
      }
      if (radarChartInstance) {
        radarChartInstance.destroy();
      }
    };
  }, []);

  return (
    <div className="bg-[#f8f9fb] text-slate-700 font-sans antialiased overflow-x-hidden min-h-screen">
      {/* Tautan aksesibilitas untuk pembaca layar (WCAG 2.2 N-01) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#8b5cf6] focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
      >
        Lompat ke konten utama latihan
      </a>

      <div className="flex h-screen overflow-hidden">
        {/* ================= FAR-LEFT ICON SIDEBAR (NAVIGASI INKLUSIF) ================= */}
        <aside
          aria-label="Navigasi Ikon Cepat"
          className="w-16 bg-white border-r border-slate-100 flex flex-col justify-between items-center py-4 z-20 shrink-0 select-none"
        >
          {/* Brand Logo HITUNGIN */}
          <div className="flex flex-col items-center space-y-6 w-full">
            <a
              href="/beranda"
              title="HITUNGIN - Beranda"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-50 hover:bg-purple-100 transition shadow-xs"
            >
              {/* Logo Hitungin dengan gradasi ungu & pink */}
              <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Logo Hitungin">
                <path
                  d="M8 24C8 15 15 6 25 6C22 13 18 17 12 18C16 19 20 18 23 15C19 22 14 25 8 24Z"
                  fill="url(#logoGrad)"
                />
                <circle cx="11" cy="11" r="3" fill="#8b5cf6" />
                <defs>
                  <linearGradient id="logoGrad" x1="8" y1="6" x2="25" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8b5cf6" />
                    <stop offset="1" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
            </a>

            {/* Main Nav Icons Berdasarkan PRD Bab 6 */}
            <nav className="flex flex-col items-center space-y-2 w-full px-2" aria-label="Menu Utama">
              {/* Beranda (Aktif) */}
              <button
                type="button"
                title="Beranda"
                aria-current="page"
                className="w-10 h-10 rounded-xl bg-purple-100/80 text-[#8b5cf6] flex items-center justify-center transition focus:ring-2 focus:ring-purple-400 focus:outline-none"
              >
                <Home className="w-[18px] h-[18px]" />
              </button>
              {/* Materi */}
              <button
                type="button"
                title="Materi Belajar (Level 1-6)"
                className="w-10 h-10 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 flex items-center justify-center transition focus:ring-2 focus:ring-purple-400 focus:outline-none"
              >
                <BookOpen className="w-[18px] h-[18px]" />
              </button>
              {/* Latihan */}
              <button
                type="button"
                title="Latihan Mandiri (4 Jalur Input)"
                className="w-10 h-10 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 flex items-center justify-center transition focus:ring-2 focus:ring-purple-400 focus:outline-none"
              >
                <Calculator className="w-[18px] h-[18px]" />
              </button>
              {/* Target */}
              <button
                type="button"
                title="Target Latihan Mandiri"
                className="w-10 h-10 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 flex items-center justify-center transition focus:ring-2 focus:ring-purple-400 focus:outline-none"
              >
                <Target className="w-[18px] h-[18px]" />
              </button>
              {/* Progres */}
              <button
                type="button"
                title="Progres & Pola Kesalahan"
                className="w-10 h-10 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 flex items-center justify-center transition focus:ring-2 focus:ring-purple-400 focus:outline-none"
              >
                <TrendingUp className="w-[18px] h-[18px]" />
              </button>
              {/* Bantuan Aksesibilitas */}
              <button
                type="button"
                title="Pusat Bantuan Aksesibilitas"
                className="w-10 h-10 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 flex items-center justify-center transition focus:ring-2 focus:ring-purple-400 focus:outline-none"
              >
                <HelpCircle className="w-[18px] h-[18px]" />
              </button>
            </nav>
          </div>

          {/* Bottom Action Icons: Pembaca Suara, Profil, Keluar */}
          <div className="flex flex-col items-center space-y-3">
            {/* Mode Bantuan Audio / Screen Reader Voice */}
            <button
              type="button"
              onClick={() => setVoiceAssistance(!voiceAssistance)}
              title={voiceAssistance ? "Bantuan Suara Aktif" : "Nyalakan Panduan Suara"}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition focus:ring-2 focus:ring-purple-400 focus:outline-none ${
                voiceAssistance ? 'bg-emerald-100 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Volume2 className="w-[18px] h-[18px]" />
            </button>
            {/* Profil Siswa */}
            <button
              type="button"
              title="Profil Siswa & Pengaturan PIN"
              className="w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-50 flex items-center justify-center focus:ring-2 focus:ring-purple-400 focus:outline-none"
            >
              <User className="w-[18px] h-[18px]" />
            </button>
            {/* Keluar */}
            <button
              type="button"
              title="Keluar dari Akun Siswa"
              className="w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-50 flex items-center justify-center focus:ring-2 focus:ring-purple-400 focus:outline-none"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
            {/* Avatar Siswa */}
            <div className="pt-1" title="Siswa: Budi Pratama (Kelas 4 SD Inklusif)">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold flex items-center justify-center text-xs ring-2 ring-purple-100 shadow-xs">
                BP
              </div>
            </div>
          </div>
        </aside>

        {/* ================= SECONDARY MENU SIDEBAR (PRD 6.1: BERANDA, MATERI, LATIHAN, TARGET, PROGRES, BANTUAN) ================= */}
        <aside
          aria-label="Submenu Pembelajaran"
          className={`w-60 bg-white border-r border-slate-100 flex-col justify-between py-4 px-3 shrink-0 overflow-y-auto select-none transition-all duration-200 ${
            isSidebarOpen ? 'flex' : 'hidden'
          }`}
        >
          <div>
            {/* Header Platform */}
            <div className="px-3 mb-4 pt-0.5">
              <span className="text-[11px] font-bold tracking-wider text-purple-600 uppercase">HITUNGIN</span>
              <h2 className="text-[15px] font-bold text-slate-800 tracking-tight">Menu Belajar</h2>
            </div>

            {/* Navigation List Sesuai PRD Bab 6.1 */}
            <ul className="space-y-1.5 text-[13px] font-medium text-slate-600">
              {/* Beranda */}
              <li>
                <a
                  href="/beranda"
                  aria-current="page"
                  className="flex items-center space-x-2.5 px-3 py-2.5 rounded-lg bg-[#8b5cf6] text-white font-semibold shadow-sm shadow-purple-200 focus:outline-none"
                >
                  <Home className="w-4 h-4 stroke-[2.2]" />
                  <span>Beranda</span>
                </a>
              </li>
              {/* Materi (Peta Level 1 - 6) */}
              <li>
                <a
                  href="#materi"
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-600 transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>Materi Belajar</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded">
                    6 Level
                  </span>
                </a>
              </li>
              {/* Latihan Mandiri (4 Jalur Jawab) */}
              <li>
                <a
                  href="#latihan"
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-600 transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <Calculator className="w-4 h-4 text-slate-400" />
                    <span>Latihan Mandiri</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded">
                    4 Jalur
                  </span>
                </a>
              </li>
              {/* Target Latihan */}
              <li>
                <a
                  href="#target"
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-600 transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <Target className="w-4 h-4 text-slate-400" />
                    <span>Target Saya</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-500 text-[10px] font-bold rounded">
                    2 Aktif
                  </span>
                </a>
              </li>
              {/* Progres & Evaluasi */}
              <li>
                <a
                  href="#progres"
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-600 transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    <span>Progres & Pola</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-teal-50 text-teal-600 text-[10px] font-bold rounded">
                    88%
                  </span>
                </a>
              </li>
              {/* Pusat Bantuan Aksesibilitas */}
              <li>
                <a
                  href="#bantuan"
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-600 transition"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Pusat Bantuan Akses</span>
                </a>
              </li>
            </ul>

            {/* Sub-kategori 4 Jalur Jawaban Inklusif (PRD S-22 s.d S-26) */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                4 Jalur Jawaban Inklusif
              </p>
              <div className="space-y-1.5 text-xs text-slate-600 px-1">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80">
                  <span className="flex items-center gap-2">
                    <Mic className="w-3.5 h-3.5 text-purple-500" /> Suara (Audio)
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Siap</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80">
                  <span className="flex items-center gap-2">
                    <Hand className="w-3.5 h-3.5 text-emerald-500" /> Isyarat Angka (0-9)
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Siap</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80">
                  <span className="flex items-center gap-2">
                    <PenTool className="w-3.5 h-3.5 text-amber-500" /> Tulisan Kanvas
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Siap</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80">
                  <span className="flex items-center gap-2">
                    <Keyboard className="w-3.5 h-3.5 text-blue-500" /> Papan Ketik
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Siap</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ================= MAIN CONTENT AREA ================= */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* TOP NAVBAR */}
          <header className="h-14 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0 z-10">
            {/* Left: Menu toggle & Search Materi */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={toggleSidebar}
                title="Buka atau Tutup Menu Samping"
                className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
              >
                <AlignLeft className="w-5 h-5" />
              </button>
              <div className="relative w-64 sm:w-80">
                <input
                  type="text"
                  placeholder="Cari materi latihan (misal: penjumlahan, level 3)..."
                  className="w-full pl-3.5 pr-9 py-1.5 bg-slate-50/70 border border-slate-200/80 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white transition"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Right: Aksesibilitas & Profile Siswa */}
            <div className="flex items-center space-x-2.5">
              {/* Tombol Aksesibilitas Pembesar Teks / Kontras */}
              <button
                type="button"
                title="Status Aksesibilitas: WCAG 2.2 Memenuhi Syarat"
                className="px-2.5 py-1 rounded-full border border-purple-100 bg-purple-50 text-[#8b5cf6] text-[11px] font-semibold flex items-center gap-1 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Akses Inklusif</span>
              </button>

              {/* Mode Panduan Audio */}
              <button
                type="button"
                onClick={() => setVoiceAssistance(!voiceAssistance)}
                title={voiceAssistance ? "Panduan Audio Aktif" : "Nyalakan Panduan Audio Soal"}
                className={`w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center transition ${
                  voiceAssistance ? 'bg-purple-100 text-[#8b5cf6]' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {/* Tombol Fullscreen */}
              <button
                type="button"
                onClick={toggleFullscreen}
                title="Layar Penuh untuk Latihan Fokus"
                className="w-8 h-8 rounded-full border border-slate-100 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition"
              >
                <Maximize className="w-4 h-4" />
              </button>

              {/* User Profile Avatar Siswa */}
              <div className="flex items-center pl-1 space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-bold flex items-center justify-center text-xs border border-white shadow-xs">
                  BP
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none">Budi Pratama</p>
                  <span className="text-[10px] text-slate-400">Siswa • Level 3</span>
                </div>
              </div>
            </div>
          </header>

          {/* SCROLLABLE DASHBOARD BODY */}
          <main id="main-content" className="flex-1 overflow-y-auto px-6 py-5">
            {/* Dashboard Title & Filter Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span>Beranda Siswa</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/50">
                    Sesi Latihan Aktif
                  </span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pantau latihan matematika mandiri, target belajar, dan akurasi 4 jalur jawaban.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="bg-white border border-slate-200/80 rounded-lg px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-2xs flex items-center gap-1.5">
                  <span>Periode: <strong>Hari Ini & Minggu Ini</strong></span>
                </div>
                <button
                  type="button"
                  title="Perbarui Data Latihan"
                  className="w-8 h-8 rounded-lg bg-[#8b5cf6] hover:bg-purple-600 text-white flex items-center justify-center shadow-xs transition"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Filter Level Materi"
                  className="w-8 h-8 rounded-lg bg-[#8b5cf6] hover:bg-purple-600 text-white flex items-center justify-center shadow-xs transition"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* MAIN 12-COLUMN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* LEFT COLUMN: 4 METRIC CARDS SESUAI PRD (Span 3) */}
              <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
                {/* Card 1: Total Soal Selesai */}
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-2xs relative overflow-hidden flex items-center justify-between flex-1">
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#8b5cf6] rounded-r-full" />
                  <div className="pl-2">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Soal Selesai</p>
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-1.5">156 Soal</h3>
                    <div className="flex items-center text-[11px] font-medium">
                      <span className="text-emerald-500 flex items-center font-semibold mr-1">
                        <TrendingUp className="w-3 h-3 mr-0.5" /> +18 soal
                      </span>
                      <span className="text-slate-400">minggu ini</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#8b5cf6] flex items-center justify-center shrink-0">
                    <Calculator className="w-5 h-5" />
                  </div>
                </div>

                {/* Card 2: Akurasi Jawaban Berbasis Aturan (PRD S-28) */}
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-2xs relative overflow-hidden flex items-center justify-between flex-1">
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-pink-500 rounded-r-full" />
                  <div className="pl-2">
                    <p className="text-xs font-semibold text-slate-600 leading-snug mb-1">
                      Akurasi<br />Matematika
                    </p>
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-1.5">88.5%</h3>
                    <div className="flex items-center text-[11px] font-medium">
                      <span className="text-emerald-500 flex items-center font-semibold mr-1">
                        <TrendingUp className="w-3 h-3 mr-0.5" /> +4.2%
                      </span>
                      <span className="text-slate-400">
                        aturan<br />deterministik
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center shrink-0 self-start mt-2">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                {/* Card 3: Target Latihan Mandiri (PRD S-40) */}
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-2xs relative overflow-hidden flex items-center justify-between flex-1">
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-amber-400 rounded-r-full" />
                  <div className="pl-2">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Target Berjalan</p>
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-1.5">8 / 10 Soal</h3>
                    <div className="flex items-center text-[11px] font-medium">
                      <span className="text-emerald-500 flex items-center font-semibold mr-1">
                        <TrendingUp className="w-3 h-3 mr-0.5" /> 80%
                      </span>
                      <span className="text-slate-400">
                        tenggat<br />hari ini
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                </div>

                {/* Card 4: Penguasaan Level Materi (PRD 4 & S-10) */}
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-2xs relative overflow-hidden flex items-center justify-between flex-1">
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-r-full" />
                  <div className="pl-2">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Level Materi</p>
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-1.5">Level 3</h3>
                    <div className="flex items-center text-[11px] font-medium">
                      <span className="text-purple-600 flex items-center font-semibold mr-1">
                        3 dari 6
                      </span>
                      <span className="text-slate-400">level tuntas</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* CENTER COLUMN: GRAFIK RINGKASAN PROGRES PER LEVEL (Span 6) */}
              <div className="lg:col-span-6 bg-white rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between">
                {/* Top Card Header */}
                <div className="p-5 pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-800">Progres Latihan per Level Materi</h2>
                      <p className="text-[11px] text-slate-400">Akurasi aturan matematika & perbandingan petunjuk latihan (PRD S-42)</p>
                    </div>

                    {/* Filter Tab */}
                    <div className="inline-flex bg-purple-50/70 p-0.5 rounded-lg text-[11px] font-semibold">
                      {(['Minggu Ini', 'Bulan Ini', 'Level 1-6'] as const).map((period) => (
                        <button
                          key={period}
                          type="button"
                          onClick={() => setActivePeriod(period)}
                          className={`px-2.5 py-1 rounded-md transition ${
                            activePeriod === period
                              ? 'bg-[#8b5cf6] text-white shadow-2xs'
                              : 'text-[#8b5cf6] hover:bg-purple-100/50'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Legend & Tombol Aksesibilitas Tabel Data (WCAG 2.2 S-42) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-slate-600 mb-3 pl-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#8b5cf6] mr-1.5" />
                        <span>Benar Mandiri</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#ec4899] mr-1.5" />
                        <span>Perlu Petunjuk</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#10b981] mr-1.5" />
                        <span>Akurasi (%)</span>
                      </div>
                    </div>

                    {/* Tombol Tabel Teks untuk Pembaca Layar */}
                    <button
                      type="button"
                      onClick={() => setShowDataTable(!showDataTable)}
                      className="text-purple-600 hover:text-purple-800 text-[10px] font-medium flex items-center gap-1 underline"
                    >
                      <Table className="w-3 h-3" />
                      {showDataTable ? 'Sembunyikan Tabel' : 'Lihat Tabel Data (Aksesibel)'}
                    </button>
                  </div>

                  {/* Tabel Data Aksesibel (Alternatif Teks WCAG 2.2 S-42) */}
                  {showDataTable && (
                    <div className="mb-3 overflow-x-auto border border-slate-200 rounded-lg p-2 bg-slate-50 text-xs">
                      <table className="w-full text-left" aria-label="Tabel Riwayat Performa Level Materi">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500">
                            <th className="py-1">Topik Level</th>
                            <th className="py-1 text-center">Benar Mandiri</th>
                            <th className="py-1 text-center">Perlu Petunjuk</th>
                            <th className="py-1 text-right">Akurasi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="py-1">Level 1: Mengenal Bilangan 0-10</td>
                            <td className="text-center font-semibold text-purple-600">30</td>
                            <td className="text-center text-pink-500">2</td>
                            <td className="text-right font-bold text-emerald-600">96%</td>
                          </tr>
                          <tr>
                            <td className="py-1">Level 2: Bilangan 11-100</td>
                            <td className="text-center font-semibold text-purple-600">28</td>
                            <td className="text-center text-pink-500">3</td>
                            <td className="text-right font-bold text-emerald-600">92%</td>
                          </tr>
                          <tr>
                            <td className="py-1">Level 3: Penjumlahan sampai 20</td>
                            <td className="text-center font-semibold text-purple-600">25</td>
                            <td className="text-center text-pink-500">5</td>
                            <td className="text-right font-bold text-emerald-600">88%</td>
                          </tr>
                          <tr>
                            <td className="py-1">Level 4: Pengurangan sampai 20</td>
                            <td className="text-center font-semibold text-purple-600">22</td>
                            <td className="text-center text-pink-500">6</td>
                            <td className="text-right font-bold text-emerald-600">85%</td>
                          </tr>
                          <tr>
                            <td className="py-1">Level 5: Penjumlahan/Pengurangan 100</td>
                            <td className="text-center font-semibold text-purple-600">18</td>
                            <td className="text-center text-pink-500">9</td>
                            <td className="text-right font-bold text-amber-600">76%</td>
                          </tr>
                          <tr>
                            <td className="py-1">Level 6: Simpan atau Pinjam</td>
                            <td className="text-center font-semibold text-purple-600">15</td>
                            <td className="text-center text-pink-500">11</td>
                            <td className="text-right font-bold text-rose-500">70%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Chart Canvas Container */}
                  <div className="relative h-[270px] w-full pt-1">
                    <canvas ref={performanceChartRef} />
                  </div>
                </div>

                {/* Bottom Summary Stats Row Sesuai Ringkasan Sesi PRD S-34 */}
                <div className="grid grid-cols-3 border-t border-slate-100 divide-x divide-slate-100 text-center py-3.5 mt-2 bg-slate-50/50 rounded-b-xl">
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-0.5">Total Soal Dikerjakan</p>
                    <h4 className="text-sm font-bold text-slate-800">156 Soal</h4>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-0.5">Jawaban Benar Mandiri</p>
                    <h4 className="text-sm font-bold text-purple-600">138 Soal</h4>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-0.5">Status Penilaian</p>
                    <h4 className="text-sm font-bold text-emerald-600">Aturan Matematika</h4>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: LANJUTKAN BELAJAR BANNER & RADAR JALUR AKSES (Span 3) */}
              <div className="lg:col-span-3 flex flex-col justify-between space-y-5">
                {/* Top Greeting Banner: Lanjutkan Belajar (PRD 6.1) */}
                <div className="rounded-xl bg-gradient-to-br from-[#7c3aed] via-[#8b5cf6] to-[#9333ea] p-5 text-white relative overflow-hidden shadow-sm">
                  {/* Background Decorative Waves SVG */}
                  <svg
                    className="absolute right-0 top-0 h-full w-full opacity-20 pointer-events-none"
                    viewBox="0 0 200 150"
                    fill="none"
                  >
                    <path d="M120 -20 C150 40, 80 80, 140 160 L220 160 L220 -20 Z" fill="white" />
                    <circle
                      cx="170"
                      cy="30"
                      r="40"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                  </svg>

                  <div className="relative z-10 max-w-[70%]">
                    <h3 className="text-sm font-bold flex items-center gap-1.5 mb-1">
                      <span>Halo, Budi!</span>
                      <span className="text-base">👋</span>
                    </h3>
                    <p className="text-[11px] text-purple-100 leading-relaxed mb-3">
                      Lanjutkan latihan <strong>Level 3: Penjumlahan sampai 20</strong> (Soal 4 dari 10).
                    </p>
                    <a
                      href="#latihan"
                      className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-[11px] font-semibold px-3 py-2 rounded-lg shadow-sm transition"
                    >
                      <span>Lanjutkan Belajar</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Vector Illustration Siswa Belajar Inklusif */}
                  <div className="absolute right-1 bottom-0 w-24 h-24 pointer-events-none flex items-end justify-end">
                    <svg viewBox="0 0 120 120" className="w-full h-full">
                      <rect x="20" y="96" width="90" height="3" rx="1.5" fill="#c4b5fd" opacity="0.5" />
                      <rect x="35" y="99" width="3" height="15" fill="#c4b5fd" opacity="0.5" />
                      <rect x="95" y="99" width="3" height="15" fill="#c4b5fd" opacity="0.5" />
                      <path d="M62 88 L55 112 M72 88 L78 112" stroke="#1e1b4b" strokeWidth="5" strokeLinecap="round" />
                      <path d="M54 58 C54 53, 78 53, 78 58 L82 88 L50 88 Z" fill="#ffffff" />
                      <path d="M76 62 L92 48 L95 36" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      <rect x="92" y="28" width="6" height="10" rx="1" fill="#1e1b4b" />
                      <circle cx="66" cy="44" r="7" fill="#fcd34d" />
                      <path d="M59 42 C59 36, 73 36, 73 42 Z" fill="#1e1b4b" />
                      <rect x="48" y="74" width="24" height="14" rx="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
                      <circle cx="60" cy="81" r="2" fill="#94a3b8" />
                    </svg>
                  </div>
                </div>

                {/* Bottom Card: Distribusi 4 Jalur Jawaban Inklusif (PRD S-22 s.d S-26) */}
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-2xs flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Distribusi Jalur Akses</h3>
                      <p className="text-[10px] text-slate-400">Frekuensi pemakaian jalur input soal</p>
                    </div>
                    <a
                      href="#bantuan"
                      className="text-[11px] font-medium text-slate-500 hover:text-[#8b5cf6] underline flex items-center"
                    >
                      Panduan Jalur <ArrowRight className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>

                  {/* Radar Chart Container */}
                  <div className="relative my-auto flex items-center justify-center h-[200px]">
                    <canvas ref={radarChartRef} />
                  </div>

                  {/* Radar Legend Jalur Jawaban */}
                  <div className="flex items-center justify-center space-x-3 text-[10px] font-semibold text-slate-600 pt-1">
                    <div className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#8b5cf6] mr-1" />
                      <span>Suara</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#10b981] mr-1" />
                      <span>Isyarat Tangan</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#f59e0b] mr-1" />
                      <span>Kanvas / Papan Ketik</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION SESUAI PRD: TARGET TERDEKAT, POLA KESALAHAN, & STATUS JALUR AKSES */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
              {/* Box 1: Target Latihan Terdekat (PRD S-40) */}
              <div className="lg:col-span-4 bg-white rounded-xl p-4 border border-slate-100 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#8b5cf6] flex items-center justify-center">
                      <Target className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800">Target Belajar Terdekat</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    Hari Ini
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-slate-700">Latihan Penjumlahan s.d 20</span>
                    <span className="text-xs font-semibold text-purple-600">8 / 10 Soal</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                    <div className="bg-[#8b5cf6] h-full rounded-full transition-all duration-300" style={{ width: '80%' }} />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Sisa 2 soal untuk menuntaskan target harian tanpa batas waktu.
                  </p>
                </div>
              </div>

              {/* Box 2: Pola Kesalahan & Saran Latihan Ulang (PRD S-46) */}
              <div className="lg:col-span-5 bg-white rounded-xl p-4 border border-slate-100 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800">Pola Kesalahan & Rekomendasi</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                    S-46
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-pink-50/40 border border-pink-100 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-0.5">Menyimpan pada Penjumlahan Puluhan</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                      Sering keliru saat menjumlahkan angka satuan yang menghasilkan puluhan (misal: 38 + 27).
                    </p>
                    <button
                      type="button"
                      className="text-[11px] font-semibold text-[#8b5cf6] hover:text-purple-700 underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Latih 5 Soal Sejenis Sekarang
                    </button>
                  </div>
                </div>
              </div>

              {/* Box 3: Status Izin & Jalur Akses Perangkat (PRD S-07, S-32) */}
              <div className="lg:col-span-3 bg-white rounded-xl p-4 border border-slate-100 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800">Status Jalur Akses</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Privasi N-41
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-purple-500" /> Suara (Audio)
                    </span>
                    <span className="text-emerald-600 font-semibold">Aktif</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Hand className="w-3.5 h-3.5 text-emerald-500" /> Isyarat Kamera
                    </span>
                    <span className="text-emerald-600 font-semibold">Lokal (Aman)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Keyboard className="w-3.5 h-3.5 text-blue-500" /> Papan Ketik
                    </span>
                    <span className="text-emerald-600 font-semibold">100% WCAG</span>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center gap-1">
                    <Info className="w-3 h-3 shrink-0" /> Gambar kamera diproses di browser tanpa disimpan.
                  </p>
                </div>
              </div>
            </div>

            {/* Catatan Kaki Kebijakan Umpan Balik (PRD S-33) */}
            <div className="mt-4 text-center">
              <p className="text-[11px] text-slate-400">
                Catatan: Hasil yang ditampilkan adalah <strong>umpan balik latihan mandiri</strong>, bukan penilaian final atau pengganti rapor guru (PRD S-33).
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
