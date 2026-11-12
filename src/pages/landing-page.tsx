import { Link } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowRight,
	BookOpen,
	Check,
	CheckCircle2,
	ChevronDown,
	Eraser,
	Eye,
	GraduationCap,
	Hand,
	Keyboard,
	Mic,
	PenTool,
	Play,
	ShieldCheck,
	Sparkles,
	Sun,
	Type,
	Volume2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogoHitungin } from "@/components/layout/app-shell";
import { MenuAksesibilitas } from "@/components/menu-aksesibilitas";
import { LEVEL } from "@/datas/consts/level";
import { useAksesibilitasStore } from "@/datas/stores/aksesibilitas-store";
import { useAuthStore } from "@/datas/stores/auth-store";
import { ucapkan } from "@/lib/ucapkan";

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
		judul: "Jalur Suara",
		subjudul: "Ucapkan jawaban dengan suara alami berbahasa Indonesia.",
		deskripsi:
			"Didesain khusus untuk siswa tunanetra dan low vision agar dapat berlatih matematika mandiri tanpa perlu menatap atau menyentuh layar perangkat.",
		target: "Siswa Tunanetra & Low Vision",
		contohAksi: "Ucapkan: 'Dua Puluh'",
		keunggulan: [
			"Deteksi angka berbahasa Indonesia alami via Web Speech API",
			"Diproses langsung di browser lokal tanpa dikirim ke server",
			"Tanpa hitungan mundur yang memicu kecemasan berhitung",
		],
	},
	isyarat: {
		judul: "Jalur Isyarat Tangan",
		subjudul: "Tunjukkan simbol jari angka di depan kamera.",
		deskripsi:
			"Mendukung bahasa isyarat angka standar BISINDO & SIBI (0–9) serta penjumlahan dua tangan. Gambar diproses instan via kecerdasan buatan MediaPipe langsung di peramban.",
		target: "Siswa Tuli & Teman Belajar Isyarat",
		contohAksi: "Tunjukkan jari di kamera",
		keunggulan: [
			"Mendukung isyarat angka BISINDO & SIBI satu tangan",
			"Mendukung hitungan jari dua tangan (misal: 5 kiri + 2 kanan = 7)",
			"Privasi terjamin: feed kamera tidak pernah disimpan atau diunggah",
		],
	},
	tulisan: {
		judul: "Jalur Tulisan Kanvas",
		subjudul: "Goreskan angka menggunakan jari, mouse, atau stylus.",
		deskripsi:
			"Melatih memori motorik halus dan pengenalan lambang bilangan. Kanvas responsif mengenali bentuk goresan angka siswa dengan umpan balik visual ramah anak.",
		target: "Siswa Kinestetik & Motorik Halus",
		contohAksi: "Goreskan angka 20 di kanvas",
		keunggulan: [
			"Sensitivitas sentuh halus untuk tablet dan ponsel",
			"Tombol hapus dan ulang satu kali sentuh",
			"Membantu transisi dari konsep konkret ke simbol angka",
		],
	},
	keyboard: {
		judul: "Jalur Papan Ketik",
		subjudul: "Ketik angka secara presisi menggunakan tombol keyboard.",
		deskripsi:
			"Jalur universal yang selalu siap digunakan di segala kondisi tanpa bergantung pada kamera atau mikrofon. Sepenuhnya ramah pembaca layar (screen reader).",
		target: "Akses Universal Semua Perangkat",
		contohAksi: "Ketik 20 lalu tekan Enter",
		keunggulan: [
			"Navigasi penuh dengan tombol Tab dan Enter",
			"Fokus visual jelas dan kontras tinggi sesuai standar WCAG",
			"Kompatibel dengan semua jenis perangkat laptop, tablet, dan ponsel",
		],
	},
};

const FAQ_LIST = [
	{
		tanya: "Apakah platform HITUNGIN benar-benar gratis?",
		jawab:
			"Ya, HITUNGIN 100% gratis digunakan oleh siswa, orang tua, guru, serta SLB dan sekolah inklusif di seluruh Indonesia. Tidak ada biaya langganan, iklan komersial, maupun pembatasan fitur.",
	},
	{
		tanya: "Berapa banyak level materi yang disediakan?",
		jawab:
			"Terdapat 9 level pembelajaran terstruktur yang terbagi dalam dua jenjang: Level 1 s/d 6 untuk tingkat Sekolah Dasar (mengenal angka, penjumlahan, simpan-pinjam, perkalian-pembagian), serta Level 7 s/d 9 untuk tingkat SMP (bilangan bulat negatif, pecahan desimal persentase, serta geometri dan Pythagoras).",
	},
	{
		tanya: "Apakah rekaman suara atau video siswa disimpan di server?",
		jawab:
			"Sama sekali tidak. Sesuai prinsip Privasi Lokal Aman, pemrosesan suara (Web Speech API) dan pengenalan isyarat tangan (MediaPipe) berlangsung 100% lokal di browser perangkat Anda. Tidak ada video, foto, atau file audio yang dikirim ke internet.",
	},
	{
		tanya: "Bagaimana cara siswa tunanetra belajar secara mandiri?",
		jawab:
			"Siswa tunanetra didukung tombol audio narasi otomatis yang membacakan soal dan petunjuk bertingkat dengan intonasi jelas. Mereka dapat menjawab menggunakan perintah suara atau tombol angka pada papan ketik yang ramah pembaca layar.",
	},
	{
		tanya: "Bagaimana cara kerja pengenalan isyarat tangan untuk siswa tuli?",
		jawab:
			"Kamera mendeteksi sendi jari secara real-time. Siswa dapat menggunakan isyarat angka satu tangan standar BISINDO/SIBI (0–9) atau berhitung dengan menjumlahkan jari tangan kiri dan kanan. Terdapat kartu panduan visual untuk setiap angka.",
	},
	{
		tanya: "Bagaimana guru atau orang tua dapat memantau perkembangan siswa?",
		jawab:
			"Melalui Portal Guru, pengajar dapat membuat kelas, membagikan kode kelas sederhana (misalnya KLS-3B), dan melihat rekapitulasi pola kesulitan siswa (seperti kendala pada teknik menyimpan atau pecahan) tanpa beban koreksi manual.",
	},
	{
		tanya: "Apakah ada batasan waktu saat anak mengerjakan soal?",
		jawab:
			"Tidak ada timer atau batas waktu mundur yang menegangkan. HITUNGIN dirancang khusus untuk mengurangi kecemasan matematika (math anxiety) dan memberikan ruang belajar yang aman serta sabar.",
	},
];

export default function HalamanLanding() {
	const siswa = useAuthStore((state) => state.siswa);
	const ukuranTeks = useAksesibilitasStore((state) => state.ukuranTeks);
	const kontrasTinggi = useAksesibilitasStore((state) => state.kontrasTinggi);
	const setUkuranTeks = useAksesibilitasStore((state) => state.setUkuranTeks);
	const setKontrasTinggi = useAksesibilitasStore(
		(state) => state.setKontrasTinggi,
	);

	const [siap, setSiap] = useState(false);
	const [activeTab, setActiveTab] = useState<TabJalur>("suara");
	const [activeLevelId, setActiveLevelId] = useState<number>(3);
	const [faqTerbuka, setFaqTerbuka] = useState<number | null>(0);
	const [simulasiJawaban, setSimulasiJawaban] = useState<string>("");
	const [statusSimulasi, setStatusSimulasi] = useState<
		"belum" | "benar" | "salah"
	>("belum");
	const [sedangBicara, setSedangBicara] = useState(false);

	// Canvas ref untuk simulasi tulisan
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const isDrawingRef = useRef(false);

	useEffect(() => {
		setSiap(true);
	}, []);

	// Sinkronisasi kelas aksesibilitas ke root document
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

	const resetKanvas = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.lineWidth = 10;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.strokeStyle = "#4338ca";
	}, []);

	// Inisialisasi kanvas saat beralih ke tab tulisan
	useEffect(() => {
		if (activeTab === "tulisan" && canvasRef.current) {
			resetKanvas();
		}
	}, [activeTab, resetKanvas]);

	function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		isDrawingRef.current = true;
		const rect = canvas.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
		const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
		ctx.beginPath();
		ctx.moveTo(x, y);
	}

	function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
		if (!isDrawingRef.current) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const rect = canvas.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
		const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
		ctx.lineTo(x, y);
		ctx.stroke();
	}

	function handlePointerUp() {
		if (!isDrawingRef.current) return;
		isDrawingRef.current = false;
		// Setelah pengguna mencoret, otomatis berikan tebakan 20 untuk simulasi
		if (!simulasiJawaban) {
			periksaJawaban("20");
		}
	}

	function periksaJawaban(nilai: string) {
		setSimulasiJawaban(nilai);
		if (nilai.trim() === "20") {
			setStatusSimulasi("benar");
		} else {
			setStatusSimulasi("salah");
		}
	}

	function dengarkanSoal() {
		setSedangBicara(true);
		ucapkan("Berapa hasil dari dua belas ditambah delapan?", () => {
			setSedangBicara(false);
		});
	}

	const levelDipilih =
		LEVEL.find((l) => l.id === activeLevelId) ?? LEVEL[2] ?? LEVEL[0];

	return (
		<div className="min-h-screen bg-[#f8f9fb] text-slate-800 antialiased selection:bg-purple-600 selection:text-white">
			{/* Top Announcement Bar */}
			<div className="border-b border-purple-200/50 bg-purple-50/70 px-4 py-2 text-center text-xs font-semibold text-purple-900">
				<div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
					<Sparkles className="h-3.5 w-3.5 text-purple-600 shrink-0" />
					<span>
						Platform Pembelajaran Matematika Inklusif untuk SLB & Sekolah
						Inklusif se-Indonesia
					</span>
					<span className="hidden sm:inline-block rounded-full bg-purple-200/60 px-2 py-0.5 text-[10px] font-bold text-purple-800">
						100% Bebas Biaya
					</span>
				</div>
			</div>

			{/* Sticky Navigation Bar */}
			<header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
					{/* Logo */}
					<Link to="/" className="flex items-center gap-2.5 group">
						<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 transition group-hover:scale-105 border border-purple-100">
							<LogoHitungin className="h-6 w-6" />
						</span>
						<span>
							<span className="block text-[11px] font-extrabold tracking-wider text-purple-600 uppercase">
								HITUNGIN
							</span>
							<span className="block text-sm sm:text-base font-extrabold tracking-tight text-slate-900">
								Matematika Inklusif
							</span>
						</span>
					</Link>

					{/* Navigation Links */}
					<nav
						aria-label="Navigasi Halaman Utama"
						className="hidden md:flex items-center space-x-1 lg:space-x-2 text-[13px] font-semibold text-slate-600"
					>
						<a
							href="#keunggulan"
							className="rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-purple-700 transition"
						>
							Keunggulan
						</a>
						<a
							href="#jalur-respon"
							className="rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-purple-700 transition"
						>
							4 Jalur Respon
						</a>
						<a
							href="#kurikulum"
							className="rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-purple-700 transition"
						>
							9 Level Materi
						</a>
						<a
							href="#guru"
							className="rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-purple-700 transition"
						>
							Portal Guru
						</a>
						<a
							href="#aksesibilitas"
							className="rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-purple-700 transition"
						>
							Aksesibilitas
						</a>
						<a
							href="#faq"
							className="rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-purple-700 transition"
						>
							FAQ
						</a>
					</nav>

					{/* Action Controls */}
					<div className="flex items-center gap-2">
						<MenuAksesibilitas />

						{siap && siswa ? (
							<Link
								to="/beranda"
								className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition"
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
									className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition"
								>
									<span>Masuk Siswa</span>
									<ArrowRight className="h-3.5 w-3.5" />
								</Link>
							</>
						)}
					</div>
				</div>
			</header>

			{/* HERO SECTION */}
			<section className="relative pt-10 pb-16 sm:pt-14 sm:pb-24 border-b border-slate-200/80 bg-white">
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<div className="mx-auto max-w-3xl text-center">
						<div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1 text-xs font-bold text-purple-700 mb-5">
							<span className="h-2 w-2 rounded-full bg-purple-600" />
							<span>Aksesibilitas Matematika Ramah Disabilitas</span>
						</div>

						<h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
							Latihan Matematika Mandiri,{" "}
							<span className="text-purple-700">dengan Caramu Sendiri.</span>
						</h1>

						<p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 font-normal">
							Platform belajar inklusif untuk siswa tunanetra, tuli, dan teman
							belajar mandiri. Jawab soal lewat{" "}
							<strong className="text-slate-900">
								suara, isyarat tangan BISINDO, tulisan tangan, atau papan ketik
							</strong>
							—diproses secara lokal di perangkat tanpa kecemasan batas waktu.
						</p>

						<div className="mt-7 flex flex-wrap items-center justify-center gap-3">
							<Link
								to="/masuk"
								className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-purple-700 transition"
							>
								<span>Mulai Belajar</span>
								<ArrowRight className="h-4 w-4" />
							</Link>

							<Link
								to="/tamu"
								className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
							>
								<Play className="h-4 w-4 text-purple-600 fill-purple-600" />
								<span>Coba 1 Soal (Mode Tamu)</span>
							</Link>

							<Link
								to="/guru"
								className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50/70 px-5 py-3 text-sm font-bold text-purple-800 hover:bg-purple-100 transition"
							>
								<GraduationCap className="h-4 w-4 text-purple-700" />
								<span>Portal Guru</span>
							</Link>
						</div>
					</div>

					{/* 4 Keunggulan Nyata (Replaces AI buzzwords) */}
					<div
						id="keunggulan"
						className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
					>
						<div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
							<div className="flex items-center gap-2.5 mb-1.5">
								<ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
								<h3 className="text-xs font-bold text-slate-800">
									Privasi 100% di Perangkat
								</h3>
							</div>
							<p className="text-xs text-slate-500 leading-relaxed">
								Kamera dan mikrofon diproses langsung di browser siswa. Tidak
								ada video, gambar, atau audio yang diunggah ke internet.
							</p>
						</div>

						<div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
							<div className="flex items-center gap-2.5 mb-1.5">
								<CheckCircle2 className="h-5 w-5 text-purple-600 shrink-0" />
								<h3 className="text-xs font-bold text-slate-800">
									Penilaian Matematika Baku
								</h3>
							</div>
							<p className="text-xs text-slate-500 leading-relaxed">
								Nilai diverifikasi dengan rumus matematika pasti, bukan tebakan
								model AI generatif yang berisiko salah hitung.
							</p>
						</div>

						<div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
							<div className="flex items-center gap-2.5 mb-1.5">
								<BookOpen className="h-5 w-5 text-indigo-600 shrink-0" />
								<h3 className="text-xs font-bold text-slate-800">
									9 Level SD & SMP
								</h3>
							</div>
							<p className="text-xs text-slate-500 leading-relaxed">
								Kurikulum terstruktur mulai dari mengenal lambang bilangan 0–10
								hingga pecahan desimal dan teorema Pythagoras.
							</p>
						</div>

						<div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
							<div className="flex items-center gap-2.5 mb-1.5">
								<Eye className="h-5 w-5 text-amber-600 shrink-0" />
								<h3 className="text-xs font-bold text-slate-800">
									Bebas Kecemasan Waktu
								</h3>
							</div>
							<p className="text-xs text-slate-500 leading-relaxed">
								Tanpa timer hitung mundur. Siswa dapat berpikir tenang dan
								mendengarkan petunjuk bertahap kapan saja dibutuhkan.
							</p>
						</div>
					</div>

					{/* INTERACTIVE PRODUCT SIMULATOR */}
					<div className="mt-12 mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
							<div>
								<span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
									Simulasi Langsung
								</span>
								<h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
									Coba 4 Jalur Respon Matematika
								</h2>
							</div>

							{/* Jalur Tabs */}
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

						{/* Simulator Content */}
						<div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
							{/* Left: Problem Card */}
							<div className="md:col-span-6 rounded-xl bg-slate-50 border border-slate-200/80 p-5 flex flex-col justify-between">
								<div>
									<div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
										<span>Contoh Soal Level 3 (SD)</span>
										<button
											type="button"
											onClick={dengarkanSoal}
											className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-800 hover:bg-purple-200 transition"
											title="Dengarkan pembacaan soal"
										>
											<Volume2
												className={`h-3 w-3 ${sedangBicara ? "animate-pulse text-purple-600" : ""}`}
											/>
											<span>{sedangBicara ? "Membaca..." : "Dengar Soal"}</span>
										</button>
									</div>

									<p className="text-xs text-slate-600 mb-3 font-medium">
										Berapa hasil dari 12 ditambah 8?
									</p>

									{/* Formula Box */}
									<div className="flex items-center justify-center gap-3 py-2 text-2xl sm:text-3xl font-extrabold text-slate-800">
										<span className="rounded-lg bg-white px-3 py-1 border border-slate-200 shadow-2xs">
											12
										</span>
										<span className="text-purple-600">+</span>
										<span className="rounded-lg bg-white px-3 py-1 border border-slate-200 shadow-2xs">
											8
										</span>
										<span className="text-slate-400">=</span>
										<span
											className={`rounded-lg px-3.5 py-1 border transition-all ${
												simulasiJawaban === "20"
													? "bg-emerald-50 border-emerald-400 text-emerald-700"
													: simulasiJawaban
														? "bg-rose-50 border-rose-300 text-rose-700"
														: "bg-purple-100/70 border-purple-300 text-purple-700"
											}`}
										>
											{simulasiJawaban || "?"}
										</span>
									</div>

									{/* Visual Dot Representation */}
									<div className="text-center pt-3 mt-3 border-t border-slate-200/70">
										<p className="text-[11px] text-slate-500 font-medium mb-1.5">
											Bantuan visual titik bilangan:
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
													className="h-2 w-2 rounded-full bg-purple-600 inline-block"
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
													className="h-2 w-2 rounded-full bg-pink-500 inline-block"
												/>
											))}
										</div>
									</div>
								</div>

								{/* Status Feedback */}
								<div className="mt-4 pt-3 border-t border-slate-200/70">
									{statusSimulasi === "benar" && (
										<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center gap-2 font-medium">
											<CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
											<span>
												Benar! 12 + 8 = 20. Terverifikasi oleh aturan matematika
												pasti.
											</span>
										</div>
									)}

									{statusSimulasi === "salah" && (
										<div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 flex items-center gap-2 font-medium">
											<AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
											<span>
												Kurang tepat ({simulasiJawaban}). Coba hitung gabungan
												12 titik ungu dan 8 titik pink.
											</span>
										</div>
									)}

									{statusSimulasi === "belum" && (
										<p className="text-[11px] text-slate-500 text-center">
											Pilih atau masukkan respon pada panel di sebelah kanan.
										</p>
									)}
								</div>
							</div>

							{/* Right: Interactive Simulator by Tab */}
							<div className="md:col-span-6 rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
								<div>
									<div className="flex items-center justify-between mb-2">
										<h3 className="text-sm font-bold text-slate-900">
											{JALUR_INFO[activeTab].judul}
										</h3>
										<span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
											{JALUR_INFO[activeTab].target}
										</span>
									</div>
									<p className="text-xs text-slate-600 leading-relaxed mb-4">
										{JALUR_INFO[activeTab].deskripsi}
									</p>

									{/* SPECIFIC INTERACTION BY TAB */}
									{activeTab === "suara" && (
										<div className="space-y-3 rounded-xl bg-purple-50/50 border border-purple-100 p-4">
											<p className="text-xs font-semibold text-slate-700">
												Simulasi input suara:
											</p>
											<div className="flex flex-col gap-2">
												<button
													type="button"
													onClick={() => {
														ucapkan("Dua Puluh");
														periksaJawaban("20");
													}}
													className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition"
												>
													<Mic className="h-4 w-4" />
													<span>Ucapkan "Dua Puluh" (Benar)</span>
												</button>

												<button
													type="button"
													onClick={() => {
														ucapkan("Delapan Belas");
														periksaJawaban("18");
													}}
													className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
												>
													<span>Ucapkan "Delapan Belas" (Contoh Salah)</span>
												</button>
											</div>
										</div>
									)}

									{activeTab === "isyarat" && (
										<div className="space-y-3 rounded-xl bg-purple-50/50 border border-purple-100 p-4">
											<div className="flex items-center justify-between">
												<p className="text-xs font-semibold text-slate-700">
													Simulasi deteksi isyarat tangan:
												</p>
												<span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded-full">
													MediaPipe Sensor
												</span>
											</div>
											<div className="flex flex-col gap-2">
												<button
													type="button"
													onClick={() => periksaJawaban("20")}
													className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition"
												>
													<Hand className="h-4 w-4" />
													<span>Peragakan Isyarat "20" (10 + 10 Jari)</span>
												</button>

												<button
													type="button"
													onClick={() => periksaJawaban("18")}
													className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
												>
													<span>Peragakan Isyarat "18" (9 + 9 Jari)</span>
												</button>
											</div>
										</div>
									)}

									{activeTab === "tulisan" && (
										<div className="space-y-2 rounded-xl bg-slate-50 border border-slate-200 p-3">
											<div className="flex items-center justify-between text-xs">
												<span className="font-semibold text-slate-700">
													Kanvas coret angka:
												</span>
												<button
													type="button"
													onClick={resetKanvas}
													className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-purple-600"
												>
													<Eraser className="h-3 w-3" />
													<span>Hapus</span>
												</button>
											</div>

											{/* Interactive Mini Drawing Canvas */}
											<div className="relative h-28 w-full overflow-hidden rounded-lg border border-slate-300 bg-white shadow-inner">
												<canvas
													ref={canvasRef}
													width={320}
													height={112}
													className="h-full w-full cursor-crosshair touch-none"
													onPointerDown={handlePointerDown}
													onPointerMove={handlePointerMove}
													onPointerUp={handlePointerUp}
												/>
												<div className="pointer-events-none absolute bottom-1 right-2 text-[9px] text-slate-400">
													Coret angka di area ini
												</div>
											</div>

											<div className="flex items-center gap-2 pt-1">
												<button
													type="button"
													onClick={() => periksaJawaban("20")}
													className="flex-1 rounded-lg bg-purple-600 text-white text-xs font-bold py-1.5 px-3 hover:bg-purple-700 transition text-center"
												>
													Kirimkan Angka 20
												</button>
											</div>
										</div>
									)}

									{activeTab === "keyboard" && (
										<div className="space-y-3 rounded-xl bg-purple-50/50 border border-purple-100 p-4">
											<p className="text-xs font-semibold text-slate-700">
												Ketik angka langsung:
											</p>
											<div className="flex items-center gap-2">
												<input
													type="text"
													inputMode="numeric"
													pattern="[0-9]*"
													placeholder="Ketik 20..."
													value={simulasiJawaban}
													onChange={(e) =>
														setSimulasiJawaban(
															e.target.value.replace(/[^0-9]/g, ""),
														)
													}
													onKeyDown={(e) => {
														if (e.key === "Enter")
															periksaJawaban(simulasiJawaban);
													}}
													className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 focus:border-purple-600 focus:outline-none"
												/>
												<button
													type="button"
													onClick={() =>
														periksaJawaban(simulasiJawaban || "20")
													}
													className="rounded-lg bg-purple-600 text-white text-xs font-bold px-4 py-2 hover:bg-purple-700 transition"
												>
													Kirim
												</button>
											</div>

											{/* Numpad Shortcut */}
											<div className="grid grid-cols-4 gap-1.5 pt-1">
												{["10", "15", "18", "20"].map((n) => (
													<button
														key={n}
														type="button"
														onClick={() => periksaJawaban(n)}
														className="rounded-md border border-slate-200 bg-white py-1 text-xs font-semibold text-slate-700 hover:border-purple-300"
													>
														{n}
													</button>
												))}
											</div>
										</div>
									)}
								</div>

								{/* Keunggulan List */}
								<div className="mt-4 pt-3 border-t border-slate-100">
									<ul className="space-y-1">
										{JALUR_INFO[activeTab].keunggulan.map((item) => (
											<li
												key={item}
												className="flex items-center gap-1.5 text-[11px] text-slate-600"
											>
												<Check className="h-3 w-3 text-emerald-600 shrink-0" />
												<span>{item}</span>
											</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* SECTION 2: 4 JALUR AKSES (DEEP DIVE) */}
			<section
				id="jalur-respon"
				className="border-b border-slate-200/80 bg-slate-50/50 py-16 sm:py-20"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<div className="mx-auto max-w-2xl text-center">
						<span className="text-xs font-extrabold tracking-wider text-purple-700 uppercase">
							Respons Multimodal Adaptif
						</span>
						<h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
							4 Cara Berbeda untuk Menjawab Soal yang Sama
						</h2>
						<p className="mt-2 text-sm text-slate-600">
							Setiap siswa memiliki cara terbaik untuk mengekspresikan pemahaman
							matematika. HITUNGIN tidak memaksakan satu jalur interaksi
							tunggal.
						</p>
					</div>

					<div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
						<div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-2xs hover:border-purple-300 transition">
							<div>
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 mb-3 border border-purple-100">
									<Mic className="h-5 w-5" />
								</div>
								<h3 className="text-sm font-bold text-slate-900">
									Jalur Suara
								</h3>
								<p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
									Sebutkan angka jawaban ke mikrofon. Sangat ideal untuk siswa
									tunanetra atau low vision yang tidak dapat melihat layar
									perangkat secara jelas.
								</p>
							</div>
							<div className="mt-4 pt-3 border-t border-slate-100">
								<span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700">
									<Check className="h-3.5 w-3.5 text-purple-600" /> Web Speech
									API Bahasa Indonesia
								</span>
							</div>
						</div>

						<div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-2xs hover:border-purple-300 transition">
							<div>
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-3 border border-emerald-100">
									<Hand className="h-5 w-5" />
								</div>
								<h3 className="text-sm font-bold text-slate-900">
									Isyarat Tangan (Kamera)
								</h3>
								<p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
									Tunjukkan simbol jari angka di depan kamera. Mendukung bahasa
									isyarat BISINDO & SIBI satu tangan serta penjumlahan jari
									tangan kiri dan kanan.
								</p>
							</div>
							<div className="mt-4 pt-3 border-t border-slate-100">
								<span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
									<Check className="h-3.5 w-3.5 text-emerald-600" /> Standar
									BISINDO & SIBI
								</span>
							</div>
						</div>

						<div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-2xs hover:border-purple-300 transition">
							<div>
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-700 mb-3 border border-pink-100">
									<PenTool className="h-5 w-5" />
								</div>
								<h3 className="text-sm font-bold text-slate-900">
									Tulisan Kanvas
								</h3>
								<p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
									Tuliskan angka dengan jari atau stylus di kanvas layar sentuh.
									Melatih koordinasi motorik halus dan pengingatan bentuk
									lambang bilangan.
								</p>
							</div>
							<div className="mt-4 pt-3 border-t border-slate-100">
								<span className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-700">
									<Check className="h-3.5 w-3.5 text-pink-600" /> Pengenalan
									Goresan Kanvas
								</span>
							</div>
						</div>

						<div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-2xs hover:border-purple-300 transition">
							<div>
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 mb-3 border border-amber-100">
									<Keyboard className="h-5 w-5" />
								</div>
								<h3 className="text-sm font-bold text-slate-900">
									Papan Ketik
								</h3>
								<p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
									Gunakan keyboard fisik atau virtual. Selalu siap digunakan
									pada laptop maupun ponsel, tanpa memerlukan izin kamera atau
									mikrofon.
								</p>
							</div>
							<div className="mt-4 pt-3 border-t border-slate-100">
								<span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
									<Check className="h-3.5 w-3.5 text-amber-600" /> Akses
									Keyboard Penuh (WCAG)
								</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* SECTION 3: 9 LEVEL KURIKULUM MATEMATIKA SD & SMP */}
			<section
				id="kurikulum"
				className="border-b border-slate-200/80 bg-white py-16 sm:py-20"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<div className="mx-auto max-w-2xl text-center">
						<span className="text-xs font-extrabold tracking-wider text-purple-700 uppercase">
							Kurikulum Adaptif Bertingkat
						</span>
						<h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
							9 Level Materi Belajar Terstruktur
						</h2>
						<p className="mt-2 text-sm text-slate-600">
							Disusun runtut dari konsep konkret benda hingga abstraksi simbolik
							untuk jenjang SD dan SMP inklusif.
						</p>
					</div>

					{/* Jenjang Indicator */}
					<div className="mt-8 flex items-center justify-center gap-3 text-xs font-semibold text-slate-500">
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
							<span className="h-2 w-2 rounded-full bg-purple-600" />
							Tingkat SD: Level 1 – 6
						</span>
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
							<span className="h-2 w-2 rounded-full bg-indigo-600" />
							Tingkat SMP: Level 7 – 9
						</span>
					</div>

					{/* Level Buttons Selector */}
					<div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
						{LEVEL.map((lvl) => {
							const isSD = lvl.id <= 6;
							const isSelected = activeLevelId === lvl.id;
							return (
								<button
									key={lvl.id}
									type="button"
									onClick={() => setActiveLevelId(lvl.id)}
									className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 border ${
										isSelected
											? "bg-purple-600 text-white border-purple-600 shadow-sm"
											: "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
									}`}
								>
									<span
										className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
											isSelected
												? "bg-white text-purple-700"
												: isSD
													? "bg-purple-100 text-purple-700"
													: "bg-indigo-100 text-indigo-700"
										}`}
									>
										{lvl.id}
									</span>
									<span>Level {lvl.id}</span>
								</button>
							);
						})}
					</div>

					{/* Active Level Detail Showcase */}
					<div className="mt-8 mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-7 shadow-2xs">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
							<div>
								<div className="flex items-center gap-2">
									<span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-800">
										Level {levelDipilih.id} dari 9
									</span>
									<span className="text-xs text-slate-500 font-medium">
										{levelDipilih.id <= 6 ? "Tingkat SD" : "Tingkat SMP"}
									</span>
								</div>
								<h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
									{levelDipilih.judul}
								</h3>
							</div>
							<span className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200 self-start sm:self-auto shadow-2xs">
								{levelDipilih.topik}
							</span>
						</div>

						<div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
							<div>
								<h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
									Konsep yang Dipelajari:
								</h4>
								<div className="space-y-2 text-xs text-slate-600 leading-relaxed">
									{levelDipilih.penjelasan.map((p) => (
										<p
											key={p}
											className="flex items-start gap-2 bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs"
										>
											<span className="h-1.5 w-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
											<span>{p}</span>
										</p>
									))}
								</div>
							</div>

							<div className="rounded-xl bg-white border border-slate-200 p-4 flex flex-col justify-between shadow-2xs">
								<div className="space-y-3">
									<h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
										Bantuan Visual & Narasi Teks:
									</h4>
									<div className="text-xs text-slate-700 leading-relaxed italic bg-purple-50/60 p-3 rounded-lg border border-purple-100">
										"{levelDipilih.alternatifVisual}"
									</div>
									<div className="text-xs text-slate-600">
										<span className="font-semibold text-slate-700">
											Contoh persoalan:
										</span>{" "}
										<span className="font-bold text-purple-700">
											{levelDipilih.contoh}
										</span>
									</div>
								</div>

								<div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
									<span className="text-[11px] text-slate-500 font-medium">
										Rumus MathML ramah pembaca layar
									</span>
									<Link
										to="/materi"
										className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline"
									>
										<span>Buka Modul Belajar</span>
										<ArrowRight className="h-3.5 w-3.5" />
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* SECTION 4: PORTAL GURU & PENGAJAR */}
			<section
				id="guru"
				className="border-b border-slate-200/80 bg-slate-50/50 py-16 sm:py-20"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
						<div className="lg:col-span-6 space-y-4">
							<span className="text-xs font-extrabold tracking-wider text-purple-700 uppercase">
								Pendampingan Guru & Sekolah
							</span>
							<h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
								Portal Guru: Pantau Kemajuan Tanpa Menghakimi
							</h2>
							<p className="text-sm text-slate-600 leading-relaxed">
								Pengajar dapat membuat kelas, membagikan kode kelas sederhana
								tanpa kerumitan email, dan memantau pola kesulitan berhitung
								siswa untuk merancang bimbingan individual yang tepat sasaran.
							</p>

							<div className="space-y-3 pt-2">
								<div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
									<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">
										1
									</div>
									<div>
										<h4 className="text-xs font-bold text-slate-800">
											Kode Kelas Sederhana (Contoh: KLS-3B)
										</h4>
										<p className="text-xs text-slate-500 mt-0.5">
											Siswa cukup memasukkan nama dan kode kelas saat masuk.
											Tidak membutuhkan alamat email atau verifikasi rumit.
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
									<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">
										2
									</div>
									<div>
										<h4 className="text-xs font-bold text-slate-800">
											Diagnostik Pola Kesalahan Siswa
										</h4>
										<p className="text-xs text-slate-500 mt-0.5">
											Sistem memetakan apakah siswa mengalami kesulitan pada
											teknik menyimpan, meminjam, atau konsep pecahan.
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
									<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">
										3
									</div>
									<div>
										<h4 className="text-xs font-bold text-slate-800">
											Tinjauan Jawaban Kualitatif
										</h4>
										<p className="text-xs text-slate-500 mt-0.5">
											Guru dapat meninjau rekaman goresan kanvas dan transkrip
											jawaban siswa untuk memberikan bimbingan yang tepat.
										</p>
									</div>
								</div>
							</div>

							<div className="pt-2">
								<Link
									to="/guru"
									className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition shadow-sm"
								>
									<GraduationCap className="h-4 w-4" />
									<span>Buka Portal Pengajar</span>
								</Link>
							</div>
						</div>

						{/* Real Teacher Dashboard Preview (Anti-slop) */}
						<div className="lg:col-span-6 rounded-2xl border border-slate-300 bg-white p-6 shadow-sm space-y-4">
							<div className="flex items-center justify-between border-b border-slate-100 pb-3">
								<div className="flex items-center gap-2">
									<div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
									<span className="text-xs font-bold text-slate-800">
										Pratinjau Kelas Aktif
									</span>
								</div>
								<span className="rounded-md bg-purple-50 px-2 py-0.5 font-mono text-[11px] font-bold text-purple-700 border border-purple-200">
									Kode: KLS-3B
								</span>
							</div>

							<div className="grid grid-cols-2 gap-3 text-center">
								<div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
									<p className="text-[11px] text-slate-500 font-medium">
										Siswa Terdaftar
									</p>
									<p className="text-xl font-bold text-slate-900 mt-0.5">
										18 Siswa
									</p>
								</div>
								<div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
									<p className="text-[11px] text-slate-500 font-medium">
										Tingkat Ketuntasan
									</p>
									<p className="text-xl font-bold text-emerald-600 mt-0.5">
										88%
									</p>
								</div>
							</div>

							<div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-1">
								<div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
									<AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
									<span>Temuan Pola Kesulitan:</span>
								</div>
								<p className="text-xs text-amber-800 leading-relaxed">
									Sebagian siswa mengalami kendala pada teknik menyimpan di
									penjumlahan bilangan s/d 100 (Level 5). Disarankan menggunakan
									bantuan visual titik atau jalur kanvas.
								</p>
							</div>

							<div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 flex items-center justify-between">
								<span>Ekspor Laporan Belajar (.CSV)</span>
								<span className="font-semibold text-purple-700">Tersedia</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* SECTION 5: FITUR AKSESIBILITAS LANGSUNG */}
			<section
				id="aksesibilitas"
				className="border-b border-slate-200/80 bg-white py-16 sm:py-20"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<div className="mx-auto max-w-2xl text-center">
						<span className="text-xs font-extrabold tracking-wider text-purple-700 uppercase">
							Aksesibilitas Universal
						</span>
						<h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
							Didesain Langsung Bersama Fitur Disabilitas
						</h2>
						<p className="mt-2 text-sm text-slate-600">
							Fitur aksesibilitas bukan sekadar hiasan sampingan, melainkan
							pondasi utama sistem HITUNGIN. Anda dapat mengujinya langsung di
							bawah ini:
						</p>
					</div>

					{/* Live Interactive Accessibility Controls */}
					<div className="mt-10 mx-auto max-w-3xl rounded-2xl border border-purple-200 bg-purple-50/40 p-6 shadow-2xs space-y-6">
						<div className="flex items-center justify-between border-b border-purple-100 pb-3">
							<span className="text-xs font-bold text-purple-900">
								Uji Coba Pengaturan Tampilan Langsung:
							</span>
							<span className="text-[11px] text-purple-700 font-medium">
								Berlaku seketika di seluruh halaman
							</span>
						</div>

						{/* Control 1: Ukuran Teks */}
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div className="flex items-center gap-2">
								<Type className="h-4 w-4 text-purple-700" />
								<div>
									<p className="text-xs font-bold text-slate-800">
										Ukuran Teks
									</p>
									<p className="text-[11px] text-slate-500">
										Membantu keterbacaan siswa low vision
									</p>
								</div>
							</div>

							<div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs font-bold">
								{(
									[
										{ id: "normal", label: "Normal (100%)" },
										{ id: "besar", label: "Besar (125%)" },
										{ id: "sangat-besar", label: "Ekstra (150%)" },
									] as const
								).map((opt) => (
									<button
										key={opt.id}
										type="button"
										onClick={() => setUkuranTeks(opt.id)}
										className={`rounded-md px-3 py-1.5 transition ${
											ukuranTeks === opt.id
												? "bg-purple-600 text-white"
												: "text-slate-600 hover:text-purple-600"
										}`}
									>
										{opt.label}
									</button>
								))}
							</div>
						</div>

						{/* Control 2: Kontras Tinggi */}
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-purple-100">
							<div className="flex items-center gap-2">
								<Sun className="h-4 w-4 text-purple-700" />
								<div>
									<p className="text-xs font-bold text-slate-800">
										Mode Kontras Tinggi
									</p>
									<p className="text-[11px] text-slate-500">
										Mempertegas garis tepi dan teks tanpa membuat suasana gelap
									</p>
								</div>
							</div>

							<button
								type="button"
								onClick={() => setKontrasTinggi(!kontrasTinggi)}
								className={`rounded-lg px-4 py-2 text-xs font-bold transition border ${
									kontrasTinggi
										? "bg-slate-900 text-white border-slate-900"
										: "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
								}`}
							>
								{kontrasTinggi
									? "✓ Kontras Tinggi Aktif"
									: "Aktifkan Kontras Tinggi"}
							</button>
						</div>

						{/* Control 3: Pembaca Layar Narasi */}
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-purple-100">
							<div className="flex items-center gap-2">
								<Volume2 className="h-4 w-4 text-purple-700" />
								<div>
									<p className="text-xs font-bold text-slate-800">
										Uji Suara Narasi Otomatis
									</p>
									<p className="text-[11px] text-slate-500">
										Membacakan soal dengan suara Indonesia yang jelas
									</p>
								</div>
							</div>

							<button
								type="button"
								onClick={() =>
									ucapkan(
										"Selamat datang di HITUNGIN. Platform belajar matematika inklusif dengan caramu sendiri.",
									)
								}
								className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition"
							>
								Putar Contoh Suara Narasi
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* SECTION 6: FAQ ACCORDION */}
			<section
				id="faq"
				className="border-b border-slate-200/80 bg-slate-50/50 py-16 sm:py-20"
			>
				<div className="mx-auto max-w-3xl px-4 sm:px-6">
					<div className="text-center mb-8">
						<span className="text-xs font-extrabold tracking-wider text-purple-700 uppercase">
							Pusat Bantuan
						</span>
						<h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
							Pertanyaan yang Sering Diajukan
						</h2>
					</div>

					<div className="space-y-3">
						{FAQ_LIST.map((faq, index) => {
							const isOpen = faqTerbuka === index;
							return (
								<div
									key={faq.tanya}
									className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
								>
									<button
										type="button"
										onClick={() => setFaqTerbuka(isOpen ? null : index)}
										className="flex w-full items-center justify-between p-4 text-left font-bold text-slate-800 text-xs sm:text-sm hover:text-purple-700"
									>
										<span>{faq.tanya}</span>
										<ChevronDown
											className={`h-4 w-4 shrink-0 transition-transform ${
												isOpen ? "rotate-180 text-purple-600" : "text-slate-400"
											}`}
										/>
									</button>
									{isOpen && (
										<div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
											{faq.jawab}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* FINAL CTA BANNER */}
			<section className="bg-purple-700 py-14 sm:py-16 text-white text-center">
				<div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-4">
					<h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
						Beri Setiap Siswa Ruang untuk Memahami Matematika.
					</h2>
					<p className="mx-auto max-w-xl text-xs sm:text-sm text-purple-100 leading-relaxed">
						Mulai sesi latihan mandiri tanpa rasa takut. Didesain untuk
						pendidikan matematika yang setara, adaptif, dan memerdekakan.
					</p>

					<div className="pt-2 flex flex-wrap items-center justify-center gap-3">
						<Link
							to="/masuk"
							className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-purple-800 shadow-sm hover:bg-purple-50 transition"
						>
							<span>Daftar / Masuk Siswa</span>
							<ArrowRight className="h-4 w-4" />
						</Link>

						<Link
							to="/tamu"
							className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-purple-800/40 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-purple-800/60 transition"
						>
							<Play className="h-4 w-4" />
							<span>Coba Mode Tamu (1 Soal)</span>
						</Link>
					</div>
				</div>
			</section>

			{/* FOOTER */}
			<footer className="border-t border-slate-200 bg-white text-slate-500 py-12 text-xs">
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
						<div className="space-y-2.5">
							<div className="flex items-center gap-2">
								<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 border border-purple-100">
									<LogoHitungin className="h-4 w-4" />
								</span>
								<span className="text-sm font-bold text-slate-900 tracking-tight">
									HITUNGIN
								</span>
							</div>
							<p className="text-slate-500 text-xs leading-relaxed">
								Platform latihan matematika adaptif multimodal untuk siswa
								tunanetra, tuli, dan sekolah inklusif di Indonesia.
							</p>
						</div>

						<div>
							<h4 className="text-slate-900 font-bold text-xs mb-3">
								Navigasi Belajar
							</h4>
							<ul className="space-y-2">
								<li>
									<Link
										to="/masuk"
										className="hover:text-purple-600 transition"
									>
										Masuk Siswa
									</Link>
								</li>
								<li>
									<Link
										to="/materi"
										className="hover:text-purple-600 transition"
									>
										Materi 9 Level
									</Link>
								</li>
								<li>
									<Link
										to="/latihan"
										className="hover:text-purple-600 transition"
									>
										Latihan Mandiri
									</Link>
								</li>
								<li>
									<Link
										to="/tugas"
										className="hover:text-purple-600 transition"
									>
										Tugas dari Guru
									</Link>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="text-slate-900 font-bold text-xs mb-3">
								Akses Khusus
							</h4>
							<ul className="space-y-2">
								<li>
									<Link to="/tamu" className="hover:text-purple-600 transition">
										Mode Tamu (Satu Soal)
									</Link>
								</li>
								<li>
									<Link to="/guru" className="hover:text-purple-600 transition">
										Portal Pengajar & Kelas
									</Link>
								</li>
								<li>
									<a
										href="#jalur-respon"
										className="hover:text-purple-600 transition"
									>
										Panduan Isyarat BISINDO
									</a>
								</li>
								<li>
									<a
										href="#keunggulan"
										className="hover:text-purple-600 transition"
									>
										Privasi Lokal Aman
									</a>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="text-slate-900 font-bold text-xs mb-3">
								Standar & Privasi
							</h4>
							<p className="text-slate-500 leading-relaxed">
								Dirancang sesuai pedoman aksesibilitas WCAG 2.2, MathML untuk
								pembaca layar, serta pemrosesan suara dan kamera 100% di
								perangkat lokal.
							</p>
						</div>
					</div>

					<div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
						<p>© 2026 HITUNGIN. Aksesibilitas Pendidikan Inklusif Indonesia.</p>
						<p>Bebas biaya tanpa langganan untuk seluruh pelajar Indonesia.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
