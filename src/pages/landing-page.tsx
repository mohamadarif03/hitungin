import { Link } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowRight,
	BookOpen,
	Brain,
	Check,
	CheckCircle2,
	ChevronDown,
	GraduationCap,
	Hand,
	Heart,
	Keyboard,
	Mic,
	MousePointerClick,
	PenTool,
	Play,
	ShieldCheck,
	Sparkles,
	Sun,
	Type,
	Volume2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { LogoHitungin } from "@/components/layout/app-shell";
import { MenuAksesibilitas } from "@/components/menu-aksesibilitas";
import { LEVEL } from "@/datas/consts/level";
import { useAksesibilitasStore } from "@/datas/stores/aksesibilitas-store";
import { useAuthStore } from "@/datas/stores/auth-store";

type TabJalur = "suara" | "isyarat" | "tulisan" | "keyboard";

const JALUR_INFO: Record<
	TabJalur,
	{
		judul: string;
		subjudul: string;
		deskripsi: string;
		target: string;
		contohAksi: string;
		keunggulan: string[];
	}
> = {
	suara: {
		judul: "Jalur Suara (Audio)",
		subjudul: "Ucapkan jawabanmu dengan lantang dan santai.",
		deskripsi:
			"Sangat ideal bagi siswa tunanetra, low vision, atau yang lebih nyaman merespons dengan berbicara langsung tanpa perlu menyentuh layar perangkat.",
		target: "Siswa Tunanetra & Low Vision",
		contohAksi: "Katakan: 'Dua Puluh'",
		keunggulan: [
			"Deteksi angka berbahasa Indonesia alami",
			"Diproses langsung di browser secara lokal",
			"Tanpa batas waktu & tanpa intimidasi hitungan mundur",
		],
	},
	isyarat: {
		judul: "Jalur Isyarat Tangan (Kamera)",
		subjudul: "Tunjukkan angka 0–9 dengan jari di depan kamera.",
		deskripsi:
			"Didesain khusus untuk siswa tuli, tunarungu, atau yang sedang mempelajari bahasa isyarat standar BISINDO & SIBI di sekolah inklusif / SLB.",
		target: "Siswa Tuli & Teman Tuli",
		contohAksi: "Bentuk gestur jari angka di kamera",
		keunggulan: [
			"Mendukung standar BISINDO & SIBI",
			"Dilengkapi kartu panduan bentuk jari 0-9",
			"Privasi aman: gambar kamera tidak pernah diunggah ke internet",
		],
	},
	tulisan: {
		judul: "Jalur Tulisan Kanvas",
		subjudul: "Tuliskan goresan angka dengan jari atau stylus.",
		deskripsi:
			"Melatih memori motorik halus siswa dengan kanvas digital interaktif. Siswa dapat mencoret angka di layar sentuh tablet, HP, atau laptop.",
		target: "Siswa Kinestetik & Motorik Halus",
		contohAksi: "Goreskan angka 2 dan 0 di kotak kanvas",
		keunggulan: [
			"Sensitivitas sentuhan responsif",
			"Tombol hapus dan ulang sekali sentuh",
			"Umpan balik bentuk goresan yang ramah anak",
		],
	},
	keyboard: {
		judul: "Jalur Papan Ketik (Keyboard)",
		subjudul: "Ketik angkanya secara presisi dengan tombol keyboard.",
		deskripsi:
			"Jalur cadangan universal yang selalu tersedia 100% tanpa bergantung pada kamera atau mikrofon. Sepenuhnya ramah pembaca layar (screen reader).",
		target: "Akses Universal Semua Perangkat",
		contohAksi: "Ketik '20' lalu tekan Enter",
		keunggulan: [
			"Navigasi penuh dengan tombol Tab & Enter",
			"Fokus visual jelas dan kontras tinggi",
			"Kompatibel dengan semua jenis perangkat & browser",
		],
	},
};

const FAQ_LIST = [
	{
		tanya: "Apakah platform HITUNGIN benar-benar gratis?",
		jawab:
			"Ya, HITUNGIN 100% gratis digunakan oleh siswa, orang tua, guru, dan sekolah inklusif/SLB di seluruh Indonesia tanpa langganan, iklan, atau biaya tersembunyi.",
	},
	{
		tanya: "Apakah rekaman suara atau video anak saya disimpan ke server?",
		jawab:
			"Sama sekali tidak. Sesuai prinsip Privasi Lokal Aman, pemrosesan audio dan umpan kamera dilakukan langsung di peramban (browser) perangkat siswa. Tidak ada file video, foto, atau rekaman suara yang diunggah atau disimpan ke server.",
	},
	{
		tanya: "Bagaimana cara siswa tunanetra menggunakan aplikasi ini?",
		jawab:
			"Siswa tunanetra didukung oleh pembaca layar otomatis terintegrasi yang membacakan setiap soal matematika, petunjuk bertingkat, dan konfirmasi jawaban. Mereka dapat menjawab menggunakan perintah suara atau tombol angka pada papan ketik.",
	},
	{
		tanya: "Bagaimana cara siswa tuli belajar isyarat matematika?",
		jawab:
			"Pada menu Materi terdapat modul animasi dan panduan gerakan isyarat angka 0–9 standar BISINDO & SIBI. Siswa dapat mempraktikkan bentuk jari langsung di depan kamera untuk menjawab soal latihan mandiri.",
	},
	{
		tanya: "Apakah guru bisa memantau dan memberikan tugas kelas?",
		jawab:
			"Bisa! Guru dapat membuat Kode Kelas (misal: KLS-3B) di Portal Guru. Siswa cukup memasukkan kode kelas saat mendaftar, dan guru dapat memantau progres harian serta ringkasan pola kesalahan siswa secara terpusat.",
	},
	{
		tanya: "Apakah ada batas waktu saat mengerjakan latihan?",
		jawab:
			"Tidak ada timer atau batas waktu mundur yang menegangkan. HITUNGIN dirancang untuk mengurangi kecemasan matematika (math anxiety), memberi ruang belajar mandiri yang sabar dan menyenangkan.",
	},
];

export default function HalamanLanding() {
	const siswa = useAuthStore((state) => state.siswa);
	const ukuranTeks = useAksesibilitasStore((state) => state.ukuranTeks);
	const kontrasTinggi = useAksesibilitasStore((state) => state.kontrasTinggi);

	const [siap, setSiap] = useState(false);
	const [activeTab, setActiveTab] = useState<TabJalur>("suara");
	const [activeLevelId, setActiveLevelId] = useState<number>(3);
	const [faqTerbuka, setFaqTerbuka] = useState<number | null>(0);
	const [simulasiJawaban, setSimulasiJawaban] = useState<string>("");
	const [statusSimulasi, setStatusSimulasi] = useState<
		"belum" | "benar" | "salah"
	>("belum");

	useEffect(() => {
		setSiap(true);
	}, []);

	// Sinkronisasi kelas aksesibilitas ke root
	useEffect(() => {
		if (typeof document === "undefined") return;
		const root = document.documentElement;
		root.classList.remove("teks-besar", "teks-sangat-besar");
		if (ukuranTeks === "besar") root.classList.add("teks-besar");
		if (ukuranTeks === "sangat-besar") root.classList.add("teks-sangat-besar");

		if (kontrasTinggi) {
			root.classList.add("kontras-tinggi");
		} else {
			root.classList.remove("kontras-tinggi");
		}
	}, [ukuranTeks, kontrasTinggi]);

	const levelDipilih =
		LEVEL.find((l) => l.id === activeLevelId) ?? LEVEL[2] ?? LEVEL[0];

	function periksaSimulasi(nilai: string) {
		setSimulasiJawaban(nilai);
		if (nilai.trim() === "20") {
			setStatusSimulasi("benar");
		} else {
			setStatusSimulasi("salah");
		}
	}

	return (
		<div className="min-h-screen bg-[#f8f9fb] text-slate-800 antialiased selection:bg-purple-500 selection:text-white">
			{/* Top Announcement Bar */}
			<div className="bg-gradient-to-r from-violet-700 via-[#8b5cf6] to-pink-600 px-4 py-2 text-center text-xs font-semibold text-white shadow-2xs">
				<div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
					<Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
					<span>
						Platform Pembelajaran Matematika Inklusif untuk SLB & Sekolah
						Inklusif Indonesia
					</span>
					<span className="hidden rounded-full bg-white/20 px-2 py-0.5 text-[10px] sm:inline-block">
						100% Aksesibel & Terbuka
					</span>
				</div>
			</div>

			{/* Sticky Navigation Bar */}
			<header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
					{/* Logo */}
					<Link to="/" className="flex items-center gap-2.5 group">
						<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 transition group-hover:scale-105 shadow-2xs">
							<LogoHitungin className="h-6 w-6" />
						</span>
						<span>
							<span className="block text-[11px] font-extrabold tracking-wider text-purple-600 uppercase">
								HITUNGIN
							</span>
							<span className="block text-[15px] font-extrabold tracking-tight text-slate-900">
								Matematika Inklusif
							</span>
						</span>
					</Link>

					{/* Desktop Navigation Links */}
					<nav
						aria-label="Navigasi Utama Landing Page"
						className="hidden md:flex items-center space-x-1 lg:space-x-2 text-[13px] font-semibold text-slate-600"
					>
						<a
							href="#keunggulan"
							className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-purple-600 transition"
						>
							Keunggulan
						</a>
						<a
							href="#4-jalur"
							className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-purple-600 transition"
						>
							4 Jalur Akses
						</a>
						<a
							href="#kurikulum"
							className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-purple-600 transition"
						>
							6 Level Materi
						</a>
						<a
							href="#guru"
							className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-purple-600 transition"
						>
							Portal Guru
						</a>
						<a
							href="#faq"
							className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-purple-600 transition"
						>
							FAQ
						</a>
					</nav>

					{/* Action Buttons & Accessibility */}
					<div className="flex items-center gap-2">
						<MenuAksesibilitas />

						{siap && siswa ? (
							<Link
								to="/beranda"
								className="inline-flex items-center gap-1.5 rounded-xl bg-[#8b5cf6] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition"
							>
								<span>Dashboard Siswa</span>
								<ArrowRight className="h-3.5 w-3.5" />
							</Link>
						) : (
							<>
								<Link
									to="/tamu"
									className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
								>
									<Play className="h-3.5 w-3.5 text-purple-600 fill-purple-600" />
									<span>Coba 1 Soal</span>
								</Link>
								<Link
									to="/masuk"
									className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition transform active:scale-95"
								>
									<span>Masuk / Daftar</span>
									<ArrowRight className="h-3.5 w-3.5" />
								</Link>
							</>
						)}
					</div>
				</div>
			</header>

			{/* HERO SECTION */}
			<section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
				{/* Background Glow Orbs */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute left-1/2 -top-24 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-tr from-purple-200/40 via-pink-100/30 to-amber-100/30 blur-3xl"
				/>

				<div className="relative mx-auto max-w-7xl px-4 sm:px-6">
					<div className="mx-auto max-w-3xl text-center">
						{/* Badge */}
						<div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/80 px-3.5 py-1.5 text-xs font-bold text-purple-700 shadow-2xs backdrop-blur-xs mb-6">
							<span className="flex h-2 w-2 rounded-full bg-[#8b5cf6] animate-ping" />
							<span>Aksesibilitas Matematika Adaptif Multimodal</span>
						</div>

						{/* Main Headline */}
						<h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.12] text-slate-900">
							Matematika Ramah Anak,{" "}
							<span className="bg-gradient-to-r from-[#7c3aed] via-[#8b5cf6] to-pink-500 bg-clip-text text-transparent">
								dengan Caramu Sendiri.
							</span>
						</h1>

						{/* Subtitle */}
						<p className="mt-5 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600 font-medium">
							Platform belajar matematika mandiri yang membuka pintu bagi{" "}
							<strong className="text-slate-900 font-bold">
								siswa tunanetra, tuli, dan berkebutuhan khusus
							</strong>
							. Jawab soal dengan suara, isyarat angka BISINDO/SIBI, tulisan
							tangan, atau papan ketik—dinilai berdasarkan aturan matematika
							pasti tanpa intimidasi.
						</p>

						{/* Action Buttons */}
						<div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
							<Link
								to="/masuk"
								className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] via-purple-600 to-pink-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/35 transition transform active:scale-95"
							>
								<span>Mulai Belajar Sekarang</span>
								<ArrowRight className="h-4 w-4" />
							</Link>

							<Link
								to="/tamu"
								className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
							>
								<Play className="h-4 w-4 text-[#8b5cf6] fill-[#8b5cf6]" />
								<span>Coba 1 Soal Tanpa Akun</span>
							</Link>

							<Link
								to="/guru"
								className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50/70 px-5 py-3.5 text-sm font-bold text-purple-700 hover:bg-purple-100 transition shadow-2xs"
							>
								<GraduationCap className="h-4 w-4" />
								<span>Portal Guru</span>
							</Link>
						</div>

						{/* Trust Features Bar */}
						<div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
							<div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white/80 p-3 shadow-2xs">
								<ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
								<div>
									<p className="text-[11px] font-bold text-slate-800">
										Privasi Lokal
									</p>
									<p className="text-[10px] text-slate-400">
										Video/suara tak disimpan
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white/80 p-3 shadow-2xs">
								<Brain className="h-5 w-5 text-purple-500 shrink-0" />
								<div>
									<p className="text-[11px] font-bold text-slate-800">
										Penilaian Pasti
									</p>
									<p className="text-[10px] text-slate-400">Bukan tebakan AI</p>
								</div>
							</div>

							<div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white/80 p-3 shadow-2xs">
								<BookOpen className="h-5 w-5 text-pink-500 shrink-0" />
								<div>
									<p className="text-[11px] font-bold text-slate-800">
										6 Level Materi
									</p>
									<p className="text-[10px] text-slate-400">
										Standar kurikulum SDLB
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white/80 p-3 shadow-2xs">
								<Heart className="h-5 w-5 text-rose-500 shrink-0" />
								<div>
									<p className="text-[11px] font-bold text-slate-800">
										100% Inklusif
									</p>
									<p className="text-[10px] text-slate-400">
										Bebas biaya selamanya
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* INTERACTIVE PRODUCT SIMULATOR SHOWCASE */}
					<div className="mt-14 mx-auto max-w-4xl">
						<div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xl shadow-slate-200/50">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
								<div>
									<span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 uppercase tracking-wider">
										<MousePointerClick className="h-3.5 w-3.5" />
										Simulasi Interaktif Langsung
									</span>
									<h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
										Rasakan Kemudahan 4 Jalur Menjawab
									</h2>
								</div>

								{/* Interactive Tabs */}
								<div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
									{(
										[
											{ id: "suara", label: "🎙️ Suara" },
											{ id: "isyarat", label: "🖐️ Isyarat" },
											{ id: "tulisan", label: "✍️ Tulisan" },
											{ id: "keyboard", label: "⌨️ Keyboard" },
										] as const
									).map((t) => (
										<button
											key={t.id}
											type="button"
											onClick={() => {
												setActiveTab(t.id);
												setStatusSimulasi("belum");
												setSimulasiJawaban("");
											}}
											className={`rounded-lg px-3 py-1.5 transition ${
												activeTab === t.id
													? "bg-white text-purple-700 shadow-2xs font-extrabold"
													: "text-slate-600 hover:text-purple-600"
											}`}
										>
											{t.label}
										</button>
									))}
								</div>
							</div>

							{/* Simulated Problem Canvas */}
							<div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
								{/* Left: Problem & Visual Dots */}
								<div className="md:col-span-6 rounded-xl bg-slate-50 border border-slate-100 p-5 space-y-3">
									<div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
										<span>Contoh Soal Level 3</span>
										<span className="text-purple-600 font-bold">
											Penjumlahan s.d 20
										</span>
									</div>

									{/* Big Formula */}
									<div className="flex items-center justify-center gap-3 py-2 text-3xl font-extrabold text-slate-800">
										<span className="rounded-lg bg-white px-3 py-1 shadow-2xs border border-slate-200/60">
											12
										</span>
										<span className="text-purple-600">+</span>
										<span className="rounded-lg bg-white px-3 py-1 shadow-2xs border border-slate-200/60">
											8
										</span>
										<span className="text-slate-400">=</span>
										<span className="rounded-lg bg-purple-100/70 border border-purple-300 text-purple-700 px-3.5 py-1">
											{simulasiJawaban || "?"}
										</span>
									</div>

									{/* Visual Dots */}
									<div className="text-center pt-2 border-t border-slate-200/60">
										<p className="text-[11px] text-slate-500 font-medium mb-1.5">
											Bantuan visual titik hitung:
										</p>
										<div className="flex flex-wrap items-center justify-center gap-1 max-w-xs mx-auto">
											{[
												"dot-a1",
												"dot-a2",
												"dot-a3",
												"dot-a4",
												"dot-a5",
												"dot-a6",
												"dot-a7",
												"dot-a8",
												"dot-a9",
												"dot-a10",
												"dot-a11",
												"dot-a12",
											].map((id) => (
												<span
													key={id}
													className="h-2.5 w-2.5 rounded-full bg-purple-500 inline-block"
												/>
											))}
											<span className="text-xs font-bold text-slate-400 px-1">
												+
											</span>
											{[
												"dot-b1",
												"dot-b2",
												"dot-b3",
												"dot-b4",
												"dot-b5",
												"dot-b6",
												"dot-b7",
												"dot-b8",
											].map((id) => (
												<span
													key={id}
													className="h-2.5 w-2.5 rounded-full bg-pink-500 inline-block"
												/>
											))}
										</div>
									</div>
								</div>

								{/* Right: Simulated Mode Action */}
								<div className="md:col-span-6 rounded-xl border border-purple-100 bg-purple-50/50 p-5 space-y-3">
									<div className="flex items-center justify-between">
										<h3 className="text-sm font-bold text-slate-900">
											{JALUR_INFO[activeTab].judul}
										</h3>
										<span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
											{JALUR_INFO[activeTab].target}
										</span>
									</div>

									<p className="text-xs text-slate-600 leading-relaxed">
										{JALUR_INFO[activeTab].deskripsi}
									</p>

									{/* Action Simulation Trigger */}
									<div className="rounded-lg bg-white p-3 border border-slate-200/80 shadow-2xs space-y-2">
										<p className="text-[11px] font-semibold text-slate-500">
											Simulasikan input jawaban:
										</p>
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={() => periksaSimulasi("20")}
												className="flex-1 rounded-lg bg-purple-600 text-white text-xs font-bold py-2 px-3 hover:bg-purple-700 transition"
											>
												Pilih Jawaban "20"
											</button>
											<button
												type="button"
												onClick={() => periksaSimulasi("18")}
												className="rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold py-2 px-3 hover:bg-slate-200 transition"
											>
												Pilih "18"
											</button>
										</div>
									</div>

									{/* Feedback Box */}
									{statusSimulasi === "benar" && (
										<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center gap-2 animate-fade-in font-medium">
											<CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
											<span>
												Hebat! 12 + 8 = 20. Jawaban diverifikasi benar oleh
												aturan matematika baku.
											</span>
										</div>
									)}

									{statusSimulasi === "salah" && (
										<div className="rounded-lg bg-pink-50 border border-pink-200 p-2.5 text-xs text-pink-800 flex items-center gap-2 animate-fade-in font-medium">
											<AlertCircle className="h-4 w-4 text-pink-600 shrink-0" />
											<span>
												Belum pas. Coba hitung gabungan 12 titik ungu dan 8
												titik pink.
											</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* SECTION 2: 4 JALUR AKSES (DEEP DIVE) */}
			<section
				id="4-jalur"
				className="border-t border-slate-200/80 bg-white py-16 sm:py-24"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<div className="mx-auto max-w-2xl text-center">
						<span className="text-xs font-extrabold tracking-wider text-purple-600 uppercase">
							Respons Multimodal Adaptif
						</span>
						<h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
							4 Cara Berbeda untuk Satu Jawaban Pasti
						</h2>
						<p className="mt-3 text-sm text-slate-500">
							Setiap anak memiliki modalitas fisik yang unik. HITUNGIN tidak
							memaksakan satu metode interaksi tunggal.
						</p>
					</div>

					<div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{/* Card 1: Suara */}
						<div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition">
							<div>
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 mb-4">
									<Mic className="h-6 w-6" />
								</div>
								<h3 className="text-base font-bold text-slate-900">
									Jalur Suara
								</h3>
								<p className="mt-2 text-xs text-slate-500 leading-relaxed">
									Cukup ucapkan angka jawaban ke mikrofon perangkat. Didesain
									agar siswa tunanetra dapat belajar tanpa menyentuh layar.
								</p>
							</div>
							<div className="mt-5 border-t border-slate-200/60 pt-4">
								<span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-600">
									<Check className="h-3.5 w-3.5" /> Web Speech Recognition
								</span>
							</div>
						</div>

						{/* Card 2: Isyarat Kamera */}
						<div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition">
							<div>
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-4">
									<Hand className="h-6 w-6" />
								</div>
								<h3 className="text-base font-bold text-slate-900">
									Isyarat Angka
								</h3>
								<p className="mt-2 text-xs text-slate-500 leading-relaxed">
									Tunjukkan simbol jari angka 0 sampai 9 di depan kamera.
									Mendukung standar BISINDO dan SIBI untuk siswa tuli.
								</p>
							</div>
							<div className="mt-5 border-t border-slate-200/60 pt-4">
								<span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
									<Check className="h-3.5 w-3.5" /> Standar BISINDO / SIBI
								</span>
							</div>
						</div>

						{/* Card 3: Tulisan Kanvas */}
						<div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition">
							<div>
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-pink-600 mb-4">
									<PenTool className="h-6 w-6" />
								</div>
								<h3 className="text-base font-bold text-slate-900">
									Tulisan Kanvas
								</h3>
								<p className="mt-2 text-xs text-slate-500 leading-relaxed">
									Goreskan angka menggunakan jari atau stylus pada area kanvas
									digital. Melatih motorik halus dan ingatan bentuk lambang
									bilangan.
								</p>
							</div>
							<div className="mt-5 border-t border-slate-200/60 pt-4">
								<span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-pink-600">
									<Check className="h-3.5 w-3.5" /> Pengenalan Goresan Kanvas
								</span>
							</div>
						</div>

						{/* Card 4: Papan Ketik */}
						<div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition">
							<div>
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 mb-4">
									<Keyboard className="h-6 w-6" />
								</div>
								<h3 className="text-base font-bold text-slate-900">
									Papan Ketik
								</h3>
								<p className="mt-2 text-xs text-slate-500 leading-relaxed">
									Ketik angka dengan keyboard fisik atau virtual. Selalu siap
									digunakan dan dapat dioperasikan 100% tanpa mouse.
								</p>
							</div>
							<div className="mt-5 border-t border-slate-200/60 pt-4">
								<span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
									<Check className="h-3.5 w-3.5" /> Akses Keyboard Penuh
								</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* SECTION 3: 6 LEVEL KURIKULUM MATEMATIKA */}
			<section
				id="kurikulum"
				className="border-t border-slate-200/80 bg-[#f8f9fb] py-16 sm:py-24"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<div className="mx-auto max-w-2xl text-center">
						<span className="text-xs font-extrabold tracking-wider text-purple-600 uppercase">
							Kurikulum Adaptif Bertahap
						</span>
						<h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
							6 Level Pembelajaran Terstruktur
						</h2>
						<p className="mt-3 text-sm text-slate-500">
							Materi disusun berjenjang sesuai karakteristik kognitif anak SDLB
							& SMPLB.
						</p>
					</div>

					{/* Level Pills Carousel */}
					<div className="mt-10 flex flex-wrap items-center justify-center gap-2">
						{LEVEL.map((lvl) => (
							<button
								key={lvl.id}
								type="button"
								onClick={() => setActiveLevelId(lvl.id)}
								className={`rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 ${
									activeLevelId === lvl.id
										? "bg-[#8b5cf6] text-white shadow-md shadow-purple-500/20"
										: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
								}`}
							>
								<span
									className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
										activeLevelId === lvl.id
											? "bg-white text-purple-700"
											: "bg-purple-100 text-purple-700"
									}`}
								>
									{lvl.id}
								</span>
								<span>Level {lvl.id}</span>
							</button>
						))}
					</div>

					{/* Active Level Detail Showcase */}
					<div className="mt-8 mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
							<div>
								<span className="text-xs font-bold text-purple-600">
									Level {levelDipilih.id} dari 6
								</span>
								<h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
									{levelDipilih.judul}
								</h3>
							</div>
							<span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-200/50 self-start sm:self-auto">
								{levelDipilih.topik}
							</span>
						</div>

						<div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
									Penjelasan Konsep Materi:
								</h4>
								<div className="space-y-2 text-xs text-slate-600 leading-relaxed">
									{levelDipilih.penjelasan.map((p) => (
										<p
											key={p}
											className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100"
										>
											<span className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
											<span>{p}</span>
										</p>
									))}
								</div>
							</div>

							<div className="rounded-xl bg-purple-50/50 border border-purple-100 p-5 flex flex-col justify-between">
								<div>
									<h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
										Bantuan Visual & Padanan Teks:
									</h4>
									<p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-lg border border-purple-200/60 shadow-2xs">
										"{levelDipilih.alternatifVisual}"
									</p>
									<p className="text-xs text-slate-500 mt-3 font-medium">
										Contoh latihan:{" "}
										<strong className="text-slate-800 font-bold">
											{levelDipilih.contoh}
										</strong>
									</p>
								</div>

								<div className="pt-4 mt-4 border-t border-purple-200/60 flex items-center justify-between">
									<span className="text-[11px] text-purple-700 font-medium">
										Tersedia rumus MathML ramah pembaca layar
									</span>
									<Link
										to="/materi"
										className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 underline"
									>
										Lihat Materi &rarr;
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* SECTION 4: PORTAL GURU & SEKOLAH */}
			<section
				id="guru"
				className="border-t border-slate-200/80 bg-white py-16 sm:py-24"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
						<div className="lg:col-span-6 space-y-4">
							<span className="text-xs font-extrabold tracking-wider text-purple-600 uppercase">
								Dukungan Pengajar & SLB
							</span>
							<h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
								Portal Guru: Pantau Kemajuan Tanpa Beban Menilai Manual
							</h2>
							<p className="text-sm text-slate-600 leading-relaxed">
								Guru dapat membuat kelas, membagikan kode kelas sederhana, dan
								melihat pola kesalahan siswa. Sistem menyediakan umpan balik
								berkala sehingga guru tahu materi mana yang memerlukan penguatan
								lebih mendalam.
							</p>

							<div className="space-y-3 pt-2">
								<div className="flex items-start gap-3">
									<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">
										1
									</div>
									<div>
										<h4 className="text-xs font-bold text-slate-800">
											Kode Kelas Tanpa Email yang Rumit
										</h4>
										<p className="text-xs text-slate-500">
											Siswa SDLB cukup memasukkan nama dan kode kelas (misal:
											KLS-3B).
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">
										2
									</div>
									<div>
										<h4 className="text-xs font-bold text-slate-800">
											Analisis Pola Kesalahan
										</h4>
										<p className="text-xs text-slate-500">
											Ketahui secara spesifik jika siswa kesulitan pada konsep
											simpan atau pinjam.
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">
										3
									</div>
									<div>
										<h4 className="text-xs font-bold text-slate-800">
											Umpan Balik Penguatan Pembelajaran
										</h4>
										<p className="text-xs text-slate-500">
											Hasil latihan berfungsi sebagai refleksi belajar mandiri,
											bukan nilai rapor yang menghakimi.
										</p>
									</div>
								</div>
							</div>

							<div className="pt-4">
								<Link
									to="/guru"
									className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
								>
									<GraduationCap className="h-4 w-4" />
									<span>Masuk ke Portal Guru & Kelas</span>
								</Link>
							</div>
						</div>

						{/* Portal Guru Preview Box */}
						<div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-purple-950 p-6 sm:p-8 text-white shadow-xl">
							<div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
								<div className="flex items-center gap-2.5">
									<div className="h-3 w-3 rounded-full bg-rose-500" />
									<div className="h-3 w-3 rounded-full bg-amber-500" />
									<div className="h-3 w-3 rounded-full bg-emerald-500" />
									<span className="text-xs font-mono text-purple-200 ml-2">
										portal-guru.hitungin.id
									</span>
								</div>
								<span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
									Kelas Aktif
								</span>
							</div>

							<div className="space-y-3.5">
								<div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border border-white/10">
									<div className="flex items-center justify-between text-xs">
										<span className="text-purple-200">
											Kelas 3B SDLB Inklusi
										</span>
										<span className="font-mono font-bold text-amber-300">
											Kode: KLS-3B
										</span>
									</div>
									<div className="mt-2 flex items-center justify-between">
										<span className="text-sm font-bold text-white">
											18 Siswa Terdaftar
										</span>
										<span className="text-xs text-emerald-300 font-semibold">
											88% Target Tuntas
										</span>
									</div>
								</div>

								<div className="rounded-xl bg-white/5 p-4 border border-white/10">
									<h4 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
										<AlertCircle className="h-3.5 w-3.5 text-pink-400" />
										Topik Perlu Penguatan:
									</h4>
									<p className="text-xs text-purple-200 leading-relaxed">
										Menyimpan pada penjumlahan puluhan (misal: 38 + 27). Sistem
										merekomendasikan latihan blok hitung visual.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* SECTION 5: FITUR AKSESIBILITAS TINGGI (WCAG AAA) */}
			<section className="border-t border-slate-200/80 bg-[#f8f9fb] py-16 sm:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<div className="mx-auto max-w-2xl text-center">
						<span className="text-xs font-extrabold tracking-wider text-purple-600 uppercase">
							Aksesibilitas Tanpa Kompromi
						</span>
						<h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
							Dirancang untuk Semua Kebutuhan Sensorik
						</h2>
						<p className="mt-3 text-sm text-slate-500">
							Fitur aksesibilitas langsung tertanam di dalam aplikasi dan dapat
							diatur setiap saat.
						</p>
					</div>

					<div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
						<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-3">
								<Type className="h-5 w-5" />
							</div>
							<h3 className="text-sm font-bold text-slate-800">
								Pengatur Ukuran Teks Fleksibel
							</h3>
							<p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
								Pilihan ukuran normal (100%), besar (125%), hingga ekstra (150%)
								untuk siswa dengan daya penglihatan terbatas (low vision).
							</p>
						</div>

						<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-3">
								<Sun className="h-5 w-5" />
							</div>
							<h3 className="text-sm font-bold text-slate-800">
								Kontras Tinggi Tema Terang
							</h3>
							<p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
								Mempertegas batas border hitam pekat dan teks kontras 21:1 tanpa
								membuat suasana layar gelap dan menakutkan bagi anak.
							</p>
						</div>

						<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3">
								<Volume2 className="h-5 w-5" />
							</div>
							<h3 className="text-sm font-bold text-slate-800">
								Pembaca Layar Narasi Otomatis
							</h3>
							<p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
								Membacakan pertanyaan, opsi respon, dan pesan umpan balik secara
								suara bahasa Indonesia yang jernih dan ramah.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* SECTION 6: FAQ ACCORDION */}
			<section
				id="faq"
				className="border-t border-slate-200/80 bg-white py-16 sm:py-24"
			>
				<div className="mx-auto max-w-4xl px-4 sm:px-6">
					<div className="text-center">
						<span className="text-xs font-extrabold tracking-wider text-purple-600 uppercase">
							Pusat Informasi
						</span>
						<h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
							Pertanyaan yang Sering Diajukan
						</h2>
					</div>

					<div className="mt-10 space-y-3">
						{FAQ_LIST.map((faq, index) => {
							const isOpen = faqTerbuka === index;
							return (
								<div
									key={faq.tanya}
									className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden transition"
								>
									<button
										type="button"
										onClick={() => setFaqTerbuka(isOpen ? null : index)}
										className="flex w-full items-center justify-between p-4 text-left font-bold text-slate-800 text-xs sm:text-sm hover:text-purple-600"
									>
										<span>{faq.tanya}</span>
										<ChevronDown
											className={`h-4 w-4 shrink-0 transition-transform ${
												isOpen ? "rotate-180 text-purple-600" : "text-slate-400"
											}`}
										/>
									</button>
									{isOpen && (
										<div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200/50 pt-3 bg-white">
											{faq.jawab}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* FINAL HEROIC CTA BANNER */}
			<section className="relative overflow-hidden bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 py-16 sm:py-20 text-white">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute right-0 top-0 h-full w-96 rounded-full bg-pink-500/20 blur-3xl"
				/>

				<div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-5">
					<h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
						Beri Setiap Anak Ruang untuk Mencintai Matematika.
					</h2>
					<p className="mx-auto max-w-2xl text-xs sm:text-sm text-purple-100 leading-relaxed">
						Mulai petualangan belajar mandiri tanpa rasa takut. Buka akses
						pendidikan matematika yang setara, menyenangkan, dan memerdekakan
						potensi anak.
					</p>

					<div className="pt-3 flex flex-wrap items-center justify-center gap-3">
						<Link
							to="/masuk"
							className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs sm:text-sm font-extrabold text-purple-700 shadow-lg hover:bg-purple-50 transition transform active:scale-95"
						>
							<span>Daftar / Masuk Siswa</span>
							<ArrowRight className="h-4 w-4" />
						</Link>

						<Link
							to="/tamu"
							className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition backdrop-blur-xs"
						>
							<Play className="h-4 w-4" />
							<span>Coba Mode Tamu</span>
						</Link>
					</div>
				</div>
			</section>

			{/* FOOTER */}
			<footer className="border-t border-slate-200 bg-slate-900 text-slate-400 py-12 text-xs">
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
									<LogoHitungin className="h-5 w-5" />
								</span>
								<span className="text-sm font-bold text-white tracking-tight">
									HITUNGIN
								</span>
							</div>
							<p className="text-slate-400 text-xs leading-relaxed">
								Platform belajar matematika adaptif multimodal untuk siswa
								tunanetra, tuli, dan berkebutuhan khusus di Indonesia.
							</p>
						</div>

						<div>
							<h4 className="text-white font-bold text-xs mb-3">
								Navigasi Belajar
							</h4>
							<ul className="space-y-2">
								<li>
									<Link to="/masuk" className="hover:text-white transition">
										Masuk Siswa
									</Link>
								</li>
								<li>
									<Link to="/materi" className="hover:text-white transition">
										Materi 6 Level
									</Link>
								</li>
								<li>
									<Link to="/latihan" className="hover:text-white transition">
										Latihan Mandiri
									</Link>
								</li>
								<li>
									<Link to="/tugas" className="hover:text-white transition">
										Tugas dari Guru
									</Link>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="text-white font-bold text-xs mb-3">
								Akses Khusus
							</h4>
							<ul className="space-y-2">
								<li>
									<Link to="/tamu" className="hover:text-white transition">
										Mode Tamu (Satu Soal)
									</Link>
								</li>
								<li>
									<Link to="/guru" className="hover:text-white transition">
										Portal Pengajar & Kelas
									</Link>
								</li>
								<li>
									<a href="#4-jalur" className="hover:text-white transition">
										Panduan Isyarat BISINDO
									</a>
								</li>
								<li>
									<a href="#keunggulan" className="hover:text-white transition">
										Privasi Lokal Aman
									</a>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="text-white font-bold text-xs mb-3">
								Kepatuhan Standar
							</h4>
							<p className="text-slate-400 leading-relaxed">
								Mendukung pedoman WCAG 2.2, MathML, Web Speech API, dan Media
								Capture browser modern.
							</p>
						</div>
					</div>

					<div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
						<p>© 2026 HITUNGIN. Hak Cipta Dilindungi.</p>
						<p>Dibuat untuk Aksesibilitas Pendidikan Inklusif Indonesia.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
