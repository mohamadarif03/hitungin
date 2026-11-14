import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	BookOpen,
	Calculator,
	ChevronDown,
	ChevronRight,
	ClipboardList,
	Hand,
	Lock,
	Search,
	Sparkles,
	Trophy,
} from "lucide-react";
import { useState } from "react";
import { MenuAksesibilitas } from "@/components/menu-aksesibilitas";
import { LEVEL } from "@/datas/consts/level";
import { useAuthStore } from "@/datas/stores/auth-store";
import {
	akurasiLevel,
	statusLevel,
	useLatihanStore,
} from "@/datas/stores/latihan-store";

export const Route = createFileRoute("/_app/materi/")({
	component: PetaMateri,
});

const WARNA_BADGE_LEVEL: Record<number, string> = {
	1: "bg-purple-100 text-[#7C4DFF]",
	2: "bg-slate-100 text-slate-500",
	3: "bg-amber-50 text-amber-600",
	4: "bg-rose-50 text-rose-500",
	5: "bg-emerald-50 text-emerald-600",
	6: "bg-orange-50 text-orange-500",
	7: "bg-purple-100 text-[#7C4DFF]",
	8: "bg-blue-50 text-blue-600",
	9: "bg-indigo-50 text-indigo-600",
};

function PetaMateri() {
	const riwayat = useLatihanStore((state) => state.riwayat);
	const siswa = useAuthStore((state) => state.siswa);
	const [cari, setCari] = useState("");

	const levelDisaring = LEVEL.filter((lvl) => {
		if (!cari.trim()) return true;
		const kata = cari.toLowerCase();
		return (
			lvl.topik.toLowerCase().includes(kata) ||
			lvl.judul.toLowerCase().includes(kata) ||
			lvl.contoh.toLowerCase().includes(kata)
		);
	});

	const levelUtama = LEVEL[0];

	return (
		<div>
			{/* =========================================================================
			    1. TAMPILAN MOBILE (< 768px) - PERSIS 100% SESUAI TEST.HTML
			    ========================================================================= */}
			<div className="flex min-h-screen flex-col bg-[#F5F5F9] pb-28 md:hidden">
				{/* HERO PURPLE SECTION */}
				<div className="mobile-hero-pattern relative overflow-hidden px-5 pt-6 pb-20 text-white">
					{/* Ornamen Background Samar */}
					<Calculator
						className="pointer-events-none absolute -bottom-6 left-4 h-36 w-36 text-white/5"
						aria-hidden="true"
					/>
					<BookOpen
						className="pointer-events-none absolute top-12 -right-8 h-40 w-40 text-white/5"
						aria-hidden="true"
					/>
					<Hand
						className="pointer-events-none absolute bottom-6 left-1/3 h-16 w-16 text-white/5"
						aria-hidden="true"
					/>

					{/* Baris Atas: Icon Piala, Search Bar Transparan, Fitur Disabilitas */}
					<div className="relative z-10 mb-7 flex items-center justify-between gap-3">
						<Link
							to="/"
							className="text-white transition hover:opacity-80"
							title="Pencapaian"
						>
							<Trophy className="h-6 w-6 fill-white/90" aria-hidden="true" />
						</Link>
						<div className="relative flex-1">
							<Search
								className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-white/80"
								aria-hidden="true"
							/>
							<input
								type="text"
								value={cari}
								onChange={(e) => setCari(e.target.value)}
								placeholder='Cari "Materi Belajar"'
								className="w-full rounded-full bg-white/25 py-2 pr-4 pl-10 text-xs text-white placeholder-white/80 backdrop-blur-sm focus:bg-white/30 focus:outline-none"
							/>
						</div>
						<MenuAksesibilitas varian="mobile-hero" />
					</div>

					{/* Info Status Tengah */}
					<div className="relative z-10 my-1 text-center">
						{/* Pill Kelas Siswa */}
						<div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/95 backdrop-blur-sm">
							<span>🎒</span>
							<span>
								{siswa?.nama ?? "Siswa"} • {siswa?.kelas ?? "Kelas 4 SD"}
							</span>
							<ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
						</div>

						{/* Level Aktif Utama */}
						<h1 className="mb-1 text-4xl font-extrabold tracking-tight">
							Level {levelUtama.id}
						</h1>
						<p className="mb-5 text-xs font-normal text-white/80">
							{levelUtama.topik} • Terbuka
						</p>

						{/* Tombol Aksi Utama */}
						<Link
							to="/materi/$levelId"
							params={{ levelId: String(levelUtama.id) }}
							className="inline-flex items-center gap-2 rounded-full border border-white/85 px-6 py-2.5 text-xs font-semibold text-white transition duration-200 hover:bg-white hover:text-[#7C4DFF]"
						>
							<BookOpen className="h-4 w-4" aria-hidden="true" />
							<span>Buka Pelajaran</span>
						</Link>
					</div>
				</div>

				{/* OVERLAPPING QUICK ACTIONS CARD (3 Kolom Aksi Cepat) */}
				<div className="relative z-20 -mt-12 px-5">
					<div className="grid grid-cols-3 divide-x divide-slate-200/70 rounded-2xl border border-slate-100 bg-white px-2 py-4 shadow-sm">
						{/* Aksi 1: Latihan (4 Jalur) */}
						<Link
							to="/latihan"
							className="group flex flex-col items-center justify-center gap-1.5 py-1"
						>
							<div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7C4DFF] text-white shadow-sm transition group-hover:scale-105">
								<Sparkles className="h-5 w-5" aria-hidden="true" />
							</div>
							<span className="text-xs font-medium text-slate-600">Latihan</span>
						</Link>

						{/* Aksi 2: Isyarat SIBI (0-9) */}
						<Link
							to="/materi/$levelId"
							params={{ levelId: "1" }}
							className="group flex flex-col items-center justify-center gap-1.5 py-1"
						>
							<div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition group-hover:scale-105">
								<Hand className="h-5 w-5" aria-hidden="true" />
							</div>
							<span className="text-xs font-medium text-slate-600">
								Isyarat SIBI
							</span>
						</Link>

						{/* Aksi 3: Tugas Guru */}
						<Link
							to="/tugas"
							className="group flex flex-col items-center justify-center gap-1.5 py-1"
						>
							<div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-500 transition group-hover:scale-105">
								<ClipboardList className="h-5 w-5" aria-hidden="true" />
							</div>
							<span className="text-xs font-medium text-slate-600">
								Tugas Guru
							</span>
						</Link>
					</div>
				</div>

				{/* DAFTAR PETA MATERI (List Card Putih) */}
				<div className="mt-6 px-5">
					{/* Header Section */}
					<div className="mb-3.5 flex items-center justify-between">
						<div>
							<h2 className="text-[17px] font-bold text-slate-800">
								Peta Materi
							</h2>
							<p className="text-[11px] text-slate-400">
								Min. akurasi 80% untuk buka level
							</p>
						</div>
						<Link
							to="/latihan"
							className="text-slate-600 transition hover:text-[#7C4DFF]"
						>
							<ArrowRight className="h-5 w-5" aria-hidden="true" />
						</Link>
					</div>

					{/* List Card Putih */}
					<div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white px-4 py-1.5 shadow-sm">
						{levelDisaring.map((lvl) => {
							const status = statusLevel(riwayat, lvl.id);
							const warnaBadge =
								WARNA_BADGE_LEVEL[lvl.id] ?? "bg-purple-100 text-[#7C4DFF]";

							return (
								<Link
									key={lvl.id}
									to="/materi/$levelId"
									params={{ levelId: String(lvl.id) }}
									className="flex items-center justify-between py-3.5 no-underline"
								>
									<div className="flex items-center gap-3.5 pr-2">
										<div
											className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold text-sm ${warnaBadge}`}
										>
											L{lvl.id}
										</div>
										<div>
											<span className="block text-xs font-semibold text-slate-800">
												{lvl.topik}
											</span>
											<span className="mt-0.5 block text-[11px] text-slate-400">
												Contoh: {lvl.contoh}
											</span>
										</div>
									</div>
									<div className="flex shrink-0 items-center gap-1.5">
										{status === "terkunci" ? (
											<>
												<Lock
													className="h-3.5 w-3.5 text-slate-400"
													aria-hidden="true"
												/>
												<span className="text-xs font-semibold text-slate-400">
													Terkunci
												</span>
											</>
										) : (
											<span className="text-xs font-bold text-[#7C4DFF]">
												{status === "selesai" ? "Selesai" : "Terbuka"}
											</span>
										)}
										<ChevronRight
											className="h-4 w-4 text-slate-400"
											aria-hidden="true"
										/>
									</div>
								</Link>
							);
						})}
					</div>
				</div>
			</div>

			{/* =========================================================================
			    2. TAMPILAN DESKTOP (>= 768px) - LAYOUT BERSIH DENGAN GRID & BANNER
			    ========================================================================= */}
			<div className="hidden space-y-6 md:block">
				{/* Judul Section Peta Materi */}
				<div>
					<h1 className="text-[19px] font-bold text-slate-900">Peta Materi</h1>
					<p className="mt-0.5 text-[13px] text-slate-500">
						Materi matematika interaktif dari konsep dasar SD hingga rumus aljabar
						dan geometri SMP. Level terbuka setelah level sebelumnya mencapai
						akurasi minimal 80 persen.
					</p>
				</div>

				{/* Grid Kartu Level (3 Kolom) */}
				<div className="grid grid-cols-3 gap-4">
					{LEVEL.map((lvl) => {
						const status = statusLevel(riwayat, lvl.id);
						const akurasi = akurasiLevel(riwayat, lvl.id);

						if (status === "terkunci") {
							return (
								<div
									key={lvl.id}
									className="flex min-h-[168px] flex-col justify-start rounded-2xl border border-slate-200/75 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]"
								>
									<div className="mb-2.5 flex items-center justify-between">
										<span className="text-xs font-semibold text-slate-400">
											Level {lvl.id}
										</span>
										<span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
											<Lock className="h-3 w-3 text-slate-400" aria-hidden="true" />
											Terkunci
										</span>
									</div>
									<h2 className="mb-1.5 text-[15px] font-bold text-slate-800">
										{lvl.topik}
									</h2>
									<p className="text-xs leading-relaxed text-slate-400">
										Terbuka setelah Level {lvl.id - 1} mencapai akurasi minimal 80 persen.
									</p>
								</div>
							);
						}

						return (
							<div
								key={lvl.id}
								className="flex min-h-[168px] flex-col justify-between rounded-2xl border border-slate-200/75 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]"
							>
								<div>
									<div className="mb-2.5 flex items-center justify-between">
										<span className="text-xs font-bold text-[#7C4DFF]">
											Level {lvl.id}
										</span>
										<span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#7C4DFF]">
											{status === "selesai" ? "Selesai" : "Terbuka"}
										</span>
									</div>
									<h2 className="mb-1 text-[15px] font-bold text-slate-900">
										{lvl.topik}
									</h2>
									<p className="text-xs text-slate-500">
										Contoh: {lvl.contoh}
									</p>
								</div>
								<div className="mt-2 flex items-center justify-between pt-4">
									<span className="text-[11.5px] font-semibold text-slate-700">
										{akurasi === null ? "Belum ada latihan" : `Akurasi ${akurasi}%`}
									</span>
									<Link
										to="/materi/$levelId"
										params={{ levelId: String(lvl.id) }}
										className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#7C4DFF] hover:underline"
									>
										<span>Buka pelajaran</span>
										<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
									</Link>
								</div>
							</div>
						);
					})}
				</div>

				{/* Banner Info 1: Isyarat angka 0-9 (SIBI) */}
				<div className="flex items-center gap-4 rounded-2xl border border-slate-200/75 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
						<Hand className="h-5 w-5" aria-hidden="true" />
					</div>
					<div>
						<h3 className="text-[13.5px] font-bold text-slate-800">
							Isyarat angka 0–9 (SIBI)
						</h3>
						<p className="mt-0.5 text-xs text-slate-500">
							Isyarat angka dijelaskan dengan teks. Saat menjawab soal, gunakan
							papan ketik, suara, atau tulisan.
						</p>
					</div>
				</div>

				{/* Banner Info 2: Sudah paham materinya? */}
				<div className="flex items-start gap-4 rounded-2xl border border-slate-200/75 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]">
					<div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#7C4DFF]">
						<Sparkles className="h-5 w-5" aria-hidden="true" />
					</div>
					<div>
						<h3 className="text-[13.5px] font-bold text-slate-800">
							Sudah paham materinya?
						</h3>
						<p className="mt-0.5 mb-3.5 text-xs text-slate-500">
							Uji pemahaman lewat latihan mandiri. Semua soal bisa dijawab
							dengan papan ketik, suara, isyarat angka, atau tulisan.
						</p>
						<Link
							to="/latihan"
							className="inline-flex items-center gap-2 rounded-xl bg-[#7C4DFF] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#7C4DFF]/25 transition hover:bg-[#6839ed]"
						>
							<span>Buka latihan</span>
							<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
