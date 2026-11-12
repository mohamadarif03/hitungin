// @ts-nocheck

import {
	AlertCircle,
	Archive,
	ArrowRight,
	CheckCircle2,
	ClipboardCheck,
	ClipboardList,
	Download,
	FileText,
	Hand,
	Home,
	Info,
	Keyboard,
	KeyRound,
	LogOut,
	type LucideIcon,
	Menu,
	Mic,
	PenTool,
	Plus,
	Send,
	Trash2,
	TrendingUp,
	Users,
} from "lucide-react";
import {
	type InputHTMLAttributes,
	type ReactNode,
	useMemo,
	useState,
} from "react";

/* ============================ KONSTANTA ============================ */

type JalurId = "keyboard" | "suara" | "isyarat" | "tulisan";
type StatusPenilaian = "benar" | "salah";
type StatusSistem = "benar" | "salah" | "tidak-terbaca" | "layanan-gagal";
type TinjauMasukan = {
	penilaian: StatusPenilaian | null;
	pengenalanSalah: boolean;
	catatan: string;
	oleh?: string;
};

type Kelas = { id: string; nama: string; kode: string };
type Siswa = {
	id: string;
	kelasId: string;
	nama: string;
	kemampuan: number;
	level: number;
	terakhirHari: number;
	pinBaru: boolean;
	arsip: boolean;
};
type Tugas = {
	id: string;
	kelasId: string;
	judul: string;
	levelId: number;
	jumlah: number;
	tenggat: string | null;
	jalur: JalurId[];
	petunjuk: number;
	siswaIds: string[] | null;
	catatan: string;
	status: "draf" | "terbit";
};
type Percobaan = {
	id: string;
	sesi: string;
	siswaId: string;
	kelasId: string;
	tugasId: string | null;
	levelId: number;
	jenis: string;
	soal: string;
	kunci: number;
	terbaca: number | null;
	sistem: StatusSistem;
	jalur: JalurId;
	petunjuk: number;
	durasi: number;
	hariLalu: number;
	tinjau: TinjauMasukan | null;
};
type Audit = {
	id: string;
	kelasId: string;
	pelaku: string;
	aksi: string;
	detail: string;
	hari: number;
};
type DataGuru = {
	kelas: Kelas[];
	siswa: Siswa[];
	tugas: Tugas[];
	percobaan: Percobaan[];
	audit: Audit[];
};
type TugasForm = {
	judul: string;
	levelId: number;
	jumlah: number;
	tenggat: string;
	petunjuk: number;
	jalur: JalurId[];
	khusus: boolean;
	pilih: string[];
	catatan: string;
};

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
	id: string;
	label: string;
	petunjuk?: string;
	galat?: string;
};

type StatProps = {
	label: string;
	nilai: string | number;
	keterangan?: string;
	Ikon: LucideIcon;
};

type PesanProps = {
	nada?: "hijau" | "rose" | "kuning" | "ungu";
	children: ReactNode;
};

type JudulProps = {
	judul: string;
	keterangan?: string;
	aksi?: ReactNode;
};

type KartuProps = {
	children: ReactNode;
	className?: string;
};

const AKUN = {
	email: "ratna@contoh.sch.id",
	sandi: "demo1234",
	nama: "Bu Ratna",
};

const LEVEL = [
	{ id: 1, topik: "Bilangan 0 sampai 10" },
	{ id: 2, topik: "Bilangan 11 sampai 100" },
	{ id: 3, topik: "Penjumlahan sampai 20" },
	{ id: 4, topik: "Pengurangan sampai 20" },
	{ id: 5, topik: "Tambah dan kurang sampai 100 tanpa menyimpan" },
	{ id: 6, topik: "Tambah dan kurang sampai 100 dengan menyimpan" },
] as const;

const JALUR = [
	{ id: "keyboard", label: "Papan ketik", ikon: Keyboard },
	{ id: "suara", label: "Suara", ikon: Mic },
	{ id: "isyarat", label: "Isyarat angka", ikon: Hand },
	{ id: "tulisan", label: "Tulisan", ikon: PenTool },
] as const satisfies ReadonlyArray<{
	id: JalurId;
	label: string;
	ikon: LucideIcon;
}>;

const JALUR_LABEL: Record<JalurId, string> = Object.fromEntries(
	JALUR.map((j) => [j.id, j.label]),
) as Record<JalurId, string>;
const JALUR_IKON: Record<JalurId, LucideIcon> = Object.fromEntries(
	JALUR.map((j) => [j.id, j.ikon]),
) as Record<JalurId, LucideIcon>;
const SISTEM_LABEL: Record<StatusSistem, string> = {
	benar: "Benar",
	salah: "Salah",
	"tidak-terbaca": "Tidak terbaca",
	"layanan-gagal": "Layanan gagal",
};

const MENU = [
	{ id: "beranda", label: "Beranda", ikon: Home },
	{ id: "kelas", label: "Kelas dan Siswa", ikon: Users },
	{ id: "tugas", label: "Penugasan", ikon: ClipboardList },
	{ id: "progres", label: "Pantau Progres", ikon: TrendingUp },
	{ id: "tinjau", label: "Tinjau Jawaban", ikon: ClipboardCheck },
	{ id: "laporan", label: "Laporan", ikon: FileText },
	{ id: "bantuan", label: "Bantuan", ikon: Info },
] as const satisfies ReadonlyArray<{
	id: string;
	label: string;
	ikon: LucideIcon;
}>;

const MENU_BAWAH = ["beranda", "kelas", "tugas", "progres", "tinjau"] as const;

/* ============================ DATA CONTOH ============================ */

function rng(benih: number): () => number {
	let s = benih;
	return () => {
		s = (s * 1664525 + 1013904223) % 4294967296;
		return s / 4294967296;
	};
}

function buatSoal(
	levelId: number,
	r: () => number,
): { teks: string; kunci: number } {
	const antara = (min: number, maks: number): number =>
		min + Math.floor(r() * (maks - min + 1));
	if (levelId === 1) {
		const n = antara(1, 10);
		return { teks: `Tunjukkan angka ${n}`, kunci: n };
	}
	if (levelId === 2) {
		const n = antara(10, 99);
		return { teks: `Bilangan berapa yang datang setelah ${n}?`, kunci: n + 1 };
	}
	if (levelId === 3) {
		const a = antara(2, 12);
		const b = antara(1, 20 - a);
		return { teks: `Berapa hasil dari ${a} ditambah ${b}?`, kunci: a + b };
	}
	if (levelId === 4) {
		const a = antara(6, 20);
		const b = antara(1, a - 1);
		return { teks: `Berapa hasil dari ${a} dikurangi ${b}?`, kunci: a - b };
	}
	if (levelId === 5) {
		const a = 10 * antara(1, 4) + antara(0, 4);
		const b = 10 * antara(1, 4) + antara(0, 4);
		return { teks: `Berapa hasil dari ${a} ditambah ${b}?`, kunci: a + b };
	}
	const a = 10 * antara(1, 4) + antara(5, 9);
	const b = 10 * antara(1, 4) + antara(5, 9);
	return { teks: `Berapa hasil dari ${a} ditambah ${b}?`, kunci: a + b };
}

function buatData(): DataGuru {
	const r = rng(20261110);
	let urutan = 0;
	const percobaan: Percobaan[] = [];
	const audit: Audit[] = [];

	const kelas: Kelas[] = [
		{ id: "k1", nama: "SLB Negeri 1, Kelas 2", kode: "SLB2-K7" },
		{ id: "k2", nama: "4 SD Inklusif", kode: "KLS-4A" },
	];

	// [id, kelasId, nama, kemampuan, level tertinggi, hari sejak terakhir aktif, PIN baru]
	const benih: Array<
		[string, string, string, number, number, number, boolean]
	> = [
		["s1", "k1", "Farhan Akbar", 0.84, 4, 0, false],
		["s2", "k1", "Gita Permata", 0.62, 3, 1, false],
		["s3", "k1", "Hana Safitri", 0.9, 4, 0, false],
		["s4", "k1", "Ilham Nugraha", 0.47, 2, 9, false],
		["s5", "k2", "Rafi Ramadhan", 0.74, 3, 0, false],
		["s6", "k2", "Aulia Putri", 0.88, 4, 2, false],
		["s7", "k2", "Bima Saputra", 0.56, 2, 1, true],
		["s8", "k2", "Citra Lestari", 0.93, 5, 0, false],
		["s9", "k2", "Dimas Aditya", 0.6, 3, 3, false],
	];
	const siswa: Siswa[] = benih.map(
		([id, kelasId, nama, kemampuan, level, terakhirHari, pinBaru]) => ({
			id,
			kelasId,
			nama,
			kemampuan,
			level,
			terakhirHari,
			pinBaru,
			arsip: false,
		}),
	);

	const jalurAcak = (): JalurId => {
		const f = r();
		return f < 0.35
			? "keyboard"
			: f < 0.6
				? "suara"
				: f < 0.8
					? "isyarat"
					: "tulisan";
	};

	function sesi(
		s: Siswa,
		hariLalu: number,
		levelId: number,
		jalur: JalurId,
		jumlah: number,
		tugasId: string | null,
	): void {
		urutan += 1;
		const sesiId = `sesi${urutan}`;
		const pengali = { keyboard: 1, suara: 0.93, isyarat: 0.86, tulisan: 0.9 }[
			jalur
		];
		const peluang =
			Math.min(0.97, Math.max(0.25, s.kemampuan - (levelId - 1) * 0.07)) *
			pengali;
		for (let i = 0; i < jumlah; i++) {
			const soal = buatSoal(levelId, r);
			let sistem: StatusSistem;
			let terbaca: number | null = null;
			let petunjuk = 0;
			if (r() < peluang) {
				sistem = "benar";
				terbaca = soal.kunci;
				petunjuk = r() < 0.25 ? 1 : 0;
			} else {
				const f = r();
				if (jalur !== "keyboard" && f < 0.14) sistem = "tidak-terbaca";
				else if (jalur === "suara" && f < 0.18) sistem = "layanan-gagal";
				else {
					sistem = "salah";
					terbaca = Math.max(
						0,
						soal.kunci + (r() < 0.5 ? -1 : 1) * (1 + Math.floor(r() * 3)),
					);
					petunjuk = 1 + Math.floor(r() * 2);
				}
			}
			let tinjau: TinjauMasukan | null = null;
			if (
				sistem === "salah" &&
				jalur !== "keyboard" &&
				hariLalu >= 2 &&
				r() < 0.3
			) {
				tinjau = {
					penilaian: "benar",
					pengenalanSalah: true,
					catatan: "Tulisan angka terbaca keliru. Jawaban sebenarnya sesuai.",
				};
				audit.push({
					id: `au${urutan}-${i}`,
					kelasId: s.kelasId,
					pelaku: AKUN.nama,
					aksi: "Ubah penilaian",
					detail: `${s.nama}, ${LEVEL[levelId - 1].topik}: Salah menjadi Benar, pengenalan salah ditandai`,
					hari: hariLalu - 1,
				});
			}
			percobaan.push({
				id: `${sesiId}-${i}`,
				sesi: sesiId,
				siswaId: s.id,
				kelasId: s.kelasId,
				tugasId,
				levelId,
				jenis: LEVEL[levelId - 1].topik,
				soal: soal.teks,
				kunci: soal.kunci,
				terbaca,
				sistem,
				jalur,
				petunjuk,
				durasi: 10 + Math.floor(r() * 40),
				hariLalu,
				tinjau,
			});
		}
	}

	siswa.forEach((s: Siswa) => {
		for (let k = 0; k < 6; k++) {
			const hari =
				k === 0 ? s.terakhirHari : s.terakhirHari + Math.floor(r() * 11);
			sesi(
				s,
				hari,
				1 + Math.floor(r() * s.level),
				jalurAcak(),
				r() < 0.5 ? 5 : 10,
				null,
			);
		}
	});
	siswa
		.filter((s: Siswa) => s.kelasId === "k1")
		.forEach((s: Siswa) => {
			if (r() < 0.8)
				sesi(s, 1, 3, r() < 0.5 ? "keyboard" : "tulisan", 10, "t1");
		});
	sesi(siswa[0], 0, 4, "keyboard", 5, "t2");
	sesi(siswa[1], 0, 4, "suara", 2, "t2");

	const tugas: Tugas[] = [
		{
			id: "t1",
			kelasId: "k1",
			judul: "Penjumlahan sampai 20",
			levelId: 3,
			jumlah: 10,
			tenggat: "12 Nov 2026",
			jalur: ["keyboard", "suara", "tulisan"],
			petunjuk: 3,
			siswaIds: null,
			catatan: "Kerjakan tanpa terburu-buru.",
			status: "terbit",
		},
		{
			id: "t2",
			kelasId: "k1",
			judul: "Pengurangan sampai 20",
			levelId: 4,
			jumlah: 5,
			tenggat: "14 Nov 2026",
			jalur: ["keyboard", "suara", "isyarat", "tulisan"],
			petunjuk: 1,
			siswaIds: ["s1", "s2"],
			catatan: "Coba jawab tanpa petunjuk dulu.",
			status: "terbit",
		},
		{
			id: "t3",
			kelasId: "k2",
			judul: "Urutan bilangan 11-100",
			levelId: 2,
			jumlah: 8,
			tenggat: null,
			jalur: ["keyboard", "suara", "isyarat", "tulisan"],
			petunjuk: 3,
			siswaIds: null,
			catatan: "",
			status: "draf",
		},
	];

	return { kelas, siswa, tugas, percobaan, audit };
}

/* ============================ HITUNGAN ============================ */

function nilaiAkhir(p: Percobaan): StatusPenilaian | null {
	if (p.tinjau?.penilaian) return p.tinjau.penilaian;
	if (p.sistem === "benar" || p.sistem === "salah") return p.sistem;
	return null;
}

function akurasi(list: Percobaan[]): number | null {
	const dinilai = list
		.map(nilaiAkhir)
		.filter((x): x is StatusPenilaian => x !== null);
	if (dinilai.length === 0) return null;
	return Math.round(
		(dinilai.filter((x) => x === "benar").length / dinilai.length) * 100,
	);
}

function perluTinjau(p: Percobaan): boolean {
	return !p.tinjau && p.jalur !== "keyboard";
}

function alasanPerhatian(s: Siswa, list: Percobaan[]): string[] {
	const alasan: string[] = [];
	const acc = akurasi(list);
	const dinilai = list.filter((p) => nilaiAkhir(p) !== null).length;
	if (acc !== null && dinilai >= 5 && acc < 60)
		alasan.push(`Akurasi ${acc}% di bawah 60%`);
	if (s.terakhirHari >= 5) alasan.push(`Belum berlatih ${s.terakhirHari} hari`);
	if (list.filter((p) => p.sistem === "tidak-terbaca").length >= 3) {
		alasan.push("Sering tidak terbaca, periksa alat input");
	}
	return alasan;
}

function hariLabel(h: number): string {
	if (h <= 0) return "hari ini";
	if (h === 1) return "kemarin";
	return `${h} hari lalu`;
}

function statusTugas(t: Tugas, siswa: Siswa[], percobaan: Percobaan[]) {
	const target = t.siswaIds
		? siswa.filter((s) => t.siswaIds?.includes(s.id) && !s.arsip)
		: siswa.filter((s) => !s.arsip);
	return target.map((s) => {
		const kerja = percobaan.filter(
			(p) => p.tugasId === t.id && p.siswaId === s.id,
		);
		const status =
			kerja.length === 0
				? "belum"
				: kerja.length < t.jumlah
					? "sedang"
					: "selesai";
		return {
			siswa: s,
			status,
			dikerjakan: kerja.length,
			benar: kerja.filter((p) => nilaiAkhir(p) === "benar").length,
		};
	});
}

function nadaAkurasi(persen: number | null): string {
	if (persen === null) return "bg-slate-200";
	if (persen >= 80) return "bg-emerald-500";
	if (persen >= 60) return "bg-amber-500";
	return "bg-rose-500";
}

function unduhCsv(nama: string, isi: string): void {
	const blob = new Blob(["\uFEFF", isi], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = nama;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

function csv(baris: Array<Array<string | number | null | undefined>>): string {
	return baris
		.map((kolom) =>
			kolom
				.map((v) => {
					const t = v === null || v === undefined ? "" : String(v);
					return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
				})
				.join(","),
		)
		.join("\r\n");
}

/* ============================ KOMPONEN KECIL ============================ */

function Kartu({ children, className = "" }: KartuProps) {
	return (
		<div
			className={`rounded-xl border border-slate-100 bg-white p-5 shadow-sm ${className}`}
		>
			{children}
		</div>
	);
}

function Bilah({ persen }: { persen: number | null }) {
	return (
		<div className="flex items-center gap-2.5">
			<div
				aria-hidden="true"
				className="h-2 w-full max-w-40 overflow-hidden rounded-full bg-slate-100"
			>
				<div
					className={`h-full rounded-full ${nadaAkurasi(persen)}`}
					style={{ width: `${persen ?? 0}%` }}
				/>
			</div>
			<span className="w-12 shrink-0 text-right text-xs font-bold tabular-nums text-slate-700">
				{persen === null ? "Belum" : `${persen}%`}
			</span>
		</div>
	);
}

function Stat({ label, nilai, keterangan, Ikon }: StatProps) {
	return (
		<Kartu className="flex items-center justify-between gap-3">
			<div>
				<p className="text-xs font-semibold text-slate-600">{label}</p>
				<p className="mt-1 text-xl font-bold text-slate-800">{nilai}</p>
				{keterangan && (
					<p className="mt-1 text-[11px] text-slate-500">{keterangan}</p>
				)}
			</div>
			<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
				<Ikon className="h-5 w-5" aria-hidden="true" />
			</span>
		</Kartu>
	);
}

function Pesan({ nada = "hijau", children }: PesanProps) {
	const kelas = {
		hijau: "border-emerald-100 bg-emerald-50 text-emerald-800",
		rose: "border-rose-100 bg-rose-50 text-rose-700",
		kuning: "border-amber-100 bg-amber-50 text-amber-800",
		ungu: "border-violet-100 bg-violet-50 text-violet-800",
	}[nada];
	return (
		<div
			role={nada === "rose" ? "alert" : "status"}
			className={`rounded-lg border px-3 py-2 text-xs font-medium leading-relaxed ${kelas}`}
		>
			{children}
		</div>
	);
}

function Judul({ judul, keterangan, aksi }: JudulProps) {
	return (
		<div className="flex flex-wrap items-start justify-between gap-3">
			<div>
				<h1 className="text-lg font-bold text-slate-800">{judul}</h1>
				{keterangan && (
					<p className="mt-1 text-xs leading-relaxed text-slate-500">
						{keterangan}
					</p>
				)}
			</div>
			{aksi}
		</div>
	);
}

const TOMBOL = {
	utama:
		"inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-violet-500 px-4 text-xs font-semibold text-white shadow-sm hover:bg-violet-600 disabled:opacity-50",
	kedua:
		"inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50",
	halus:
		"inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100",
	bahaya:
		"inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50",
};

const INPUT =
	"h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200";

function Field({ id, label, petunjuk, galat, ...props }: FieldProps) {
	return (
		<div className="space-y-1.5">
			<label
				htmlFor={id}
				className="block text-[13px] font-semibold text-slate-700"
			>
				{label}
			</label>
			<input id={id} className={INPUT} {...props} />
			{petunjuk && <p className="text-[12px] text-slate-500">{petunjuk}</p>}
			{galat && (
				<p role="alert" className="text-[12px] font-medium text-rose-600">
					{galat}
				</p>
			)}
		</div>
	);
}

/* ============================ MASUK ============================ */

function Masuk({ onMasuk }: { onMasuk: () => void }) {
	const [email, setEmail] = useState("");
	const [sandi, setSandi] = useState("");
	const [galat, setGalat] = useState("");

	function kirim() {
		if (email.trim().toLowerCase() === AKUN.email && sandi === AKUN.sandi) {
			setGalat("");
			onMasuk();
		} else {
			setGalat("Surel atau kata sandi belum cocok. Coba akun contoh di bawah.");
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-slate-700">
			<Kartu className="w-full max-w-sm p-6">
				<div className="flex items-center gap-2.5">
					<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
						<Users className="h-5 w-5" aria-hidden="true" />
					</span>
					<span className="text-sm font-bold text-slate-800">
						HITUNGIN · Guru Pendamping
					</span>
				</div>
				<h1 className="mt-5 text-xl font-bold text-slate-800">
					Masuk sebagai guru
				</h1>
				<p className="mt-1 text-xs text-slate-500">
					Pantau latihan kelasmu dan tinjau jawaban siswa.
				</p>
				<div className="mt-5 space-y-3.5">
					<Field
						id="email"
						label="Surel"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="nama@sekolah.sch.id"
					/>
					<Field
						id="sandi"
						label="Kata sandi"
						type="password"
						value={sandi}
						onChange={(e) => setSandi(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && kirim()}
					/>
					{galat && <Pesan nada="rose">{galat}</Pesan>}
					<button
						type="button"
						onClick={kirim}
						className={`${TOMBOL.utama} w-full`}
					>
						Masuk <ArrowRight className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>
				<div className="mt-5 rounded-xl border border-violet-100 bg-violet-50/60 p-4">
					<p className="text-xs font-bold text-slate-800">Akun contoh</p>
					<p className="mt-1 text-xs text-slate-600">
						Surel <span className="font-semibold">{AKUN.email}</span>, kata
						sandi <span className="font-semibold">{AKUN.sandi}</span>
					</p>
					<button
						type="button"
						onClick={() => {
							setEmail(AKUN.email);
							setSandi(AKUN.sandi);
						}}
						className="mt-2 text-xs font-semibold text-violet-600 hover:text-violet-700"
					>
						Isi otomatis
					</button>
				</div>
			</Kartu>
		</div>
	);
}

/* ============================ BERANDA ============================ */

function Beranda({
	kelas,
	siswa,
	percobaan,
	tugas,
	ke,
}: {
	kelas: Kelas;
	siswa: Siswa[];
	percobaan: Percobaan[];
	tugas: Tugas[];
	ke: (halaman: string) => void;
}) {
	const daftar = siswa
		.filter((s) => s.kelasId === kelas.id && !s.arsip)
		.map((s) => {
			const list = percobaan.filter((p) => p.siswaId === s.id);
			return { s, alasan: alasanPerhatian(s, list) };
		});
	const perhatian = daftar.filter((x) => x.alasan.length > 0);
	const kelasPercobaan = percobaan.filter((p) => p.kelasId === kelas.id);
	const menunggu = kelasPercobaan.filter(perluTinjau).length;
	const tugasTerbit = tugas.filter(
		(t) => t.kelasId === kelas.id && t.status === "terbit",
	);
	const terbaru = [...kelasPercobaan]
		.sort((a, b) => a.hariLalu - b.hariLalu)
		.slice(0, 6);
	const namaSiswa = (id) => siswa.find((s) => s.id === id)?.nama ?? "";

	return (
		<div className="space-y-5">
			<Judul judul="Beranda Guru" keterangan={`Ringkasan ${kelas.nama}.`} />
			<div className="grid gap-3 sm:grid-cols-3">
				<Stat
					label="Siswa aktif"
					nilai={`${daftar.length} siswa`}
					keterangan={`${perhatian.length} perlu perhatian`}
					Ikon={Users}
				/>
				<Stat
					label="Akurasi kelas"
					nilai={
						akurasi(kelasPercobaan) === null
							? "Belum ada"
							: `${akurasi(kelasPercobaan)}%`
					}
					keterangan="dari jawaban yang dinilai"
					Ikon={CheckCircle2}
				/>
				<Stat
					label="Menunggu tinjauan"
					nilai={`${menunggu} jawaban`}
					keterangan="suara, isyarat, atau tulisan"
					Ikon={AlertCircle}
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Kartu>
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-bold text-slate-800">
							Perlu perhatian
						</h2>
						<button
							type="button"
							onClick={() => ke("progres")}
							className="text-xs font-semibold text-violet-600"
						>
							Semua progres
						</button>
					</div>
					{perhatian.length === 0 ? (
						<p className="mt-3 text-xs text-slate-500">
							Tidak ada siswa yang perlu perhatian.
						</p>
					) : (
						<ul className="mt-3 divide-y divide-slate-100">
							{perhatian.map((x) => (
								<li key={x.s.id} className="py-3">
									<p className="text-xs font-bold text-slate-800">{x.s.nama}</p>
									<p className="mt-0.5 text-[11px] text-slate-500">
										{x.alasan.join(". ")}
									</p>
								</li>
							))}
						</ul>
					)}
				</Kartu>

				<Kartu>
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-bold text-slate-800">Tugas berjalan</h2>
						<button
							type="button"
							onClick={() => ke("tugas")}
							className="text-xs font-semibold text-violet-600"
						>
							Semua tugas
						</button>
					</div>
					{tugasTerbit.length === 0 ? (
						<p className="mt-3 text-xs text-slate-500">
							Belum ada tugas yang diterbitkan.
						</p>
					) : (
						<ul className="mt-3 divide-y divide-slate-100">
							{tugasTerbit.map((t) => (
								<li key={t.id} className="py-3">
									<p className="text-xs font-bold text-slate-800">{t.judul}</p>
									<p className="mt-0.5 text-[11px] text-slate-500">
										Level {t.levelId} · {t.jumlah} soal · tenggat{" "}
										{t.tenggat ?? "tanpa tenggat"}
									</p>
								</li>
							))}
						</ul>
					)}
				</Kartu>
			</div>

			<Kartu>
				<h2 className="text-sm font-bold text-slate-800">Aktivitas terbaru</h2>
				<ul className="mt-3 divide-y divide-slate-100">
					{terbaru.map((p) => {
						const nilai = nilaiAkhir(p);
						return (
							<li
								key={p.id}
								className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs"
							>
								<span className="text-slate-700">
									<span className="font-semibold text-slate-800">
										{namaSiswa(p.siswaId)}
									</span>{" "}
									menjawab {p.soal.toLowerCase()} lewat{" "}
									{JALUR_LABEL[p.jalur].toLowerCase()}
								</span>
								<span className="font-semibold text-slate-600">
									{nilai === null
										? SISTEM_LABEL[p.sistem]
										: nilai === "benar"
											? "Benar"
											: "Salah"}{" "}
									· {hariLabel(p.hariLalu)}
								</span>
							</li>
						);
					})}
				</ul>
			</Kartu>
			<p className="text-[11px] text-slate-500">
				Hasil latihan adalah umpan balik latihan, bukan penilaian final.
			</p>
		</div>
	);
}

/* ============================ KELAS DAN SISWA ============================ */

function Kelas({
	kelas,
	kelasList,
	pilihKelas,
	siswa,
	aksi,
}: {
	kelas: Kelas;
	kelasList: Kelas[];
	pilihKelas: (id: string) => void;
	siswa: Siswa[];
	aksi: {
		tambahSiswa: (nama: string) => { ok: boolean; pesan?: string };
		tambahKelas: (nama: string) => void;
		gantiKode: (id: string) => void;
		resetPin: (siswaId: string) => string;
		arsip: (siswaId: string, arsip: boolean) => void;
	};
}) {
	const [namaBaru, setNamaBaru] = useState("");
	const [namaSiswa, setNamaSiswa] = useState("");
	const [pinAwal, setPinAwal] = useState("");
	const [galat, setGalat] = useState<Record<string, string>>({});
	const [pesan, setPesan] = useState<{
		nada: "hijau" | "rose";
		teks: string;
	} | null>(null);
	const [pinTerakhir, setPinTerakhir] = useState<{
		nama: string;
		pin: string;
	} | null>(null);

	const aktif = siswa.filter((s) => s.kelasId === kelas.id && !s.arsip);
	const diarsip = siswa.filter((s) => s.kelasId === kelas.id && s.arsip);

	function tambahSiswa() {
		const kesalahan = {};
		if (namaSiswa.trim().length < 2)
			kesalahan.nama = "Tulis nama siswa minimal 2 huruf.";
		if (!/^\d{4,6}$/.test(pinAwal))
			kesalahan.pin = "PIN awal harus 4 sampai 6 angka.";
		setGalat(kesalahan);
		setPesan(null);
		if (Object.keys(kesalahan).length) return;
		const hasil = aksi.tambahSiswa(namaSiswa.trim());
		if (!hasil.ok) return setPesan({ nada: "rose", teks: hasil.pesan });
		setPesan({
			nada: "hijau",
			teks: `${namaSiswa.trim()} ditambahkan. Siswa masuk dengan kode ${kelas.kode}, nama, dan PIN awal.`,
		});
		setNamaSiswa("");
		setPinAwal("");
	}

	return (
		<div className="space-y-5">
			<Judul
				judul="Kelas dan Siswa"
				keterangan="Buat kelas, bagikan kode gabung, lalu tambahkan siswa."
			/>

			<div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
				<div className="space-y-4">
					<Kartu>
						<h2 className="text-sm font-bold text-slate-800">Kelas Anda</h2>
						<ul className="mt-3 space-y-2">
							{kelasList.map((k) => (
								<li key={k.id}>
									<button
										type="button"
										aria-pressed={k.id === kelas.id}
										onClick={() => pilihKelas(k.id)}
										className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3.5 py-3 text-left text-xs font-bold ${k.id === kelas.id ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:bg-slate-50"}`}
									>
										{k.nama}
										<span className="rounded bg-white px-2 py-0.5 tracking-wider text-violet-700">
											{k.kode}
										</span>
									</button>
								</li>
							))}
						</ul>
						<div className="mt-4 flex flex-wrap gap-2">
							<button
								type="button"
								className={TOMBOL.kedua}
								onClick={() => aksi.gantiKode(kelas.id)}
							>
								Ganti kode gabung
							</button>
						</div>
						<div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
							<Field
								id="nama-kelas"
								label="Buat kelas baru"
								value={namaBaru}
								onChange={(e) => setNamaBaru(e.target.value)}
								placeholder="Contoh: 5 SD Inklusif"
							/>
							<button
								type="button"
								className={TOMBOL.kedua}
								onClick={() => {
									if (namaBaru.trim().length < 3)
										return setPesan({
											nada: "rose",
											teks: "Nama kelas minimal 3 huruf.",
										});
									aksi.tambahKelas(namaBaru.trim());
									setNamaBaru("");
									setPesan({ nada: "hijau", teks: "Kelas baru dibuat." });
								}}
							>
								<Plus className="h-3.5 w-3.5" aria-hidden="true" /> Simpan kelas
							</button>
						</div>
					</Kartu>

					<Kartu>
						<h2 className="text-sm font-bold text-slate-800">Tambah siswa</h2>
						<div className="mt-4 space-y-3.5">
							<Field
								id="nama-siswa"
								label="Nama siswa"
								value={namaSiswa}
								onChange={(e) => setNamaSiswa(e.target.value)}
								placeholder="Contoh: Budi Pratama"
								galat={galat.nama}
							/>
							<Field
								id="pin-awal"
								label="PIN awal"
								inputMode="numeric"
								maxLength={6}
								value={pinAwal}
								onChange={(e) => setPinAwal(e.target.value.replace(/\D/g, ""))}
								petunjuk="Siswa diminta mengganti PIN saat pertama masuk."
								galat={galat.pin}
							/>
							<button
								type="button"
								className={TOMBOL.utama}
								onClick={tambahSiswa}
							>
								<Plus className="h-3.5 w-3.5" aria-hidden="true" /> Tambah siswa
							</button>
							{pesan && <Pesan nada={pesan.nada}>{pesan.teks}</Pesan>}
						</div>
					</Kartu>
				</div>

				<div className="space-y-4">
					<Kartu>
						<h2 className="text-sm font-bold text-slate-800">
							Siswa ({aktif.length} aktif)
						</h2>
						{aktif.length === 0 ? (
							<p className="mt-3 text-xs text-slate-500">
								Belum ada siswa aktif.
							</p>
						) : (
							<ul className="mt-3 divide-y divide-slate-100">
								{aktif.map((s) => (
									<li
										key={s.id}
										className="flex flex-wrap items-center justify-between gap-3 py-3"
									>
										<div>
											<p className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-800">
												{s.nama}
												{s.pinBaru && (
													<span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
														PIN baru
													</span>
												)}
											</p>
											<p className="mt-0.5 text-[11px] text-slate-500">
												Terakhir aktif {hariLabel(s.terakhirHari)}
											</p>
										</div>
										<div className="flex flex-wrap gap-2">
											<button
												type="button"
												className={TOMBOL.kedua}
												onClick={() =>
													setPinTerakhir({
														nama: s.nama,
														pin: aksi.resetPin(s.id),
													})
												}
											>
												<KeyRound className="h-3.5 w-3.5" aria-hidden="true" />{" "}
												Reset PIN
											</button>
											<button
												type="button"
												className={TOMBOL.halus}
												onClick={() => aksi.arsip(s.id, true)}
											>
												<Archive className="h-3.5 w-3.5" aria-hidden="true" />{" "}
												Arsipkan
											</button>
										</div>
									</li>
								))}
							</ul>
						)}
						{pinTerakhir && (
							<div className="mt-4">
								<Pesan nada="ungu">
									PIN baru untuk {pinTerakhir.nama}:{" "}
									<span className="font-bold tracking-[0.2em]">
										{pinTerakhir.pin}
									</span>
									. Berikan sekarang, PIN ini tidak ditampilkan lagi.
								</Pesan>
							</div>
						)}
					</Kartu>

					{diarsip.length > 0 && (
						<Kartu>
							<h2 className="text-sm font-bold text-slate-800">Diarsipkan</h2>
							<ul className="mt-3 divide-y divide-slate-100">
								{diarsip.map((s) => (
									<li
										key={s.id}
										className="flex items-center justify-between py-2.5"
									>
										<span className="text-xs font-semibold text-slate-700">
											{s.nama}
										</span>
										<button
											type="button"
											className={TOMBOL.kedua}
											onClick={() => aksi.arsip(s.id, false)}
										>
											Pulihkan
										</button>
									</li>
								))}
							</ul>
						</Kartu>
					)}
				</div>
			</div>
		</div>
	);
}

/* ============================ PENUGASAN ============================ */

const TUGAS_KOSONG = {
	judul: "",
	levelId: 3,
	jumlah: 10,
	tenggat: "",
	petunjuk: 3,
	jalur: ["keyboard"],
	khusus: false,
	pilih: [],
	catatan: "",
};

function Penugasan({
	kelas,
	siswa,
	percobaan,
	tugas,
	aksi,
}: {
	kelas: Kelas;
	siswa: Siswa[];
	percobaan: Percobaan[];
	tugas: Tugas[];
	aksi: {
		buatTugas: (data: Omit<Tugas, "id">, status: "draf" | "terbit") => void;
		terbitkan: (id: string) => void;
		hapusTugas: (id: string) => void;
	};
}) {
	const [buka, setBuka] = useState<string | null>(null); // null = daftar, "baru" = form, id = detail
	const daftar = tugas
		.filter((t) => t.kelasId === kelas.id)
		.sort(
			(a, b) => (a.status === "draf" ? -1 : 1) - (b.status === "draf" ? -1 : 1),
		);

	if (buka === "baru") {
		return (
			<FormTugas
				kelas={kelas}
				siswa={siswa}
				onBatal={() => setBuka(null)}
				onSimpan={(data, status) => {
					aksi.buatTugas(data, status);
					setBuka(null);
				}}
			/>
		);
	}

	const aktif = buka ? tugas.find((t) => t.id === buka) : null;
	if (aktif) {
		const status = statusTugas(aktif, siswa, percobaan);
		const selesai = status.filter((x) => x.status === "selesai").length;
		return (
			<div className="space-y-5">
				<button
					type="button"
					onClick={() => setBuka(null)}
					className="text-xs font-semibold text-slate-500 hover:text-violet-600"
				>
					← Penugasan
				</button>
				<Judul
					judul={aktif.judul}
					keterangan={`Level ${aktif.levelId} · ${aktif.jumlah} soal · tenggat ${aktif.tenggat ?? "tanpa tenggat"} · ${aktif.status === "draf" ? "Draf" : "Diterbitkan"}`}
					aksi={
						<div className="flex flex-wrap gap-2">
							{aktif.status === "draf" && (
								<>
									<button
										type="button"
										className={TOMBOL.utama}
										onClick={() => aksi.terbitkan(aktif.id)}
									>
										<Send className="h-3.5 w-3.5" aria-hidden="true" />{" "}
										Terbitkan
									</button>
									<button
										type="button"
										className={TOMBOL.halus}
										onClick={() => {
											aksi.hapusTugas(aktif.id);
											setBuka(null);
										}}
									>
										<Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Hapus
										draf
									</button>
								</>
							)}
						</div>
					}
				/>
				<Kartu className="text-xs text-slate-600">
					<p>
						Cara menjawab: {aktif.jalur.map((j) => JALUR_LABEL[j]).join(", ")}.
						Batas petunjuk {aktif.petunjuk} per soal.
					</p>
					{aktif.catatan && (
						<p className="mt-2 rounded-lg bg-slate-50 p-3">
							Catatan: {aktif.catatan}
						</p>
					)}
				</Kartu>
				{aktif.status === "terbit" && (
					<Kartu>
						<div className="flex flex-wrap items-center justify-between gap-2">
							<h2 className="text-sm font-bold text-slate-800">
								Status pengumpulan
							</h2>
							<p className="text-xs font-semibold text-slate-600">
								{selesai} dari {status.length} siswa selesai
							</p>
						</div>
						<ul className="mt-3 divide-y divide-slate-100">
							{status.map((x) => (
								<li
									key={x.siswa.id}
									className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs"
								>
									<span className="font-bold text-slate-800">
										{x.siswa.nama}
									</span>
									<span className="text-slate-600">
										{x.status === "belum"
											? "Belum mengerjakan"
											: x.status === "sedang"
												? "Sedang"
												: "Selesai"}{" "}
										· {x.dikerjakan} dari {aktif.jumlah} soal
										{x.dikerjakan > 0 ? `, ${x.benar} benar` : ""}
									</span>
								</li>
							))}
						</ul>
					</Kartu>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-5">
			<Judul
				judul="Penugasan"
				keterangan="Tugas berisi level, jumlah soal, tenggat, dan cara menjawab yang boleh dipakai."
				aksi={
					<button
						type="button"
						className={TOMBOL.utama}
						onClick={() => setBuka("baru")}
					>
						<Plus className="h-3.5 w-3.5" aria-hidden="true" /> Buat tugas baru
					</button>
				}
			/>
			{daftar.length === 0 && (
				<Kartu>
					<p className="text-xs text-slate-500">
						Belum ada tugas untuk kelas ini.
					</p>
				</Kartu>
			)}
			<ul className="space-y-3">
				{daftar.map((t) => {
					const status = statusTugas(t, siswa, percobaan);
					const selesai = status.filter((x) => x.status === "selesai").length;
					return (
						<li key={t.id}>
							<Kartu>
								<div className="flex flex-wrap items-start justify-between gap-2">
									<div>
										<h2 className="text-sm font-bold text-slate-800">
											{t.judul}
										</h2>
										<p className="mt-0.5 text-[11px] text-slate-500">
											Level {t.levelId} · {t.jumlah} soal · tenggat{" "}
											{t.tenggat ?? "tanpa tenggat"}
										</p>
									</div>
									<span
										className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${t.status === "draf" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"}`}
									>
										{t.status === "draf"
											? "Draf"
											: selesai === status.length && status.length > 0
												? "Semua selesai"
												: "Berjalan"}
									</span>
								</div>
								<p className="mt-3 text-[11px] text-slate-600">
									{t.status === "draf"
										? "Belum diterbitkan. Siswa belum bisa melihatnya."
										: `${selesai} dari ${status.length} siswa sudah selesai.`}
								</p>
								<button
									type="button"
									onClick={() => setBuka(t.id)}
									className={`${TOMBOL.kedua} mt-3`}
								>
									Lihat status{" "}
									<ArrowRight className="h-3 w-3" aria-hidden="true" />
								</button>
							</Kartu>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

function FormTugas({
	kelas,
	siswa,
	onBatal,
	onSimpan,
}: {
	kelas: Kelas;
	siswa: Siswa[];
	onBatal: () => void;
	onSimpan: (data: Omit<Tugas, "id">, status: "draf" | "terbit") => void;
}) {
	const [f, setF] = useState<TugasForm>(TUGAS_KOSONG);
	const [galat, setGalat] = useState<Record<string, string>>({});
	const aktif = siswa.filter((s) => s.kelasId === kelas.id && !s.arsip);

	const atur = (k, v) => setF((x) => ({ ...x, [k]: v }));
	const ubahJalur = (id) => {
		if (id === "keyboard") return;
		atur(
			"jalur",
			f.jalur.includes(id) ? f.jalur.filter((j) => j !== id) : [...f.jalur, id],
		);
	};
	const ubahPilih = (id) =>
		atur(
			"pilih",
			f.pilih.includes(id) ? f.pilih.filter((x) => x !== id) : [...f.pilih, id],
		);

	function kirim(status) {
		const kesalahan = {};
		if (f.judul.trim().length < 3)
			kesalahan.judul = "Tulis judul tugas minimal 3 huruf.";
		if (f.khusus && f.pilih.length === 0)
			kesalahan.pilih = "Pilih minimal satu siswa.";
		setGalat(kesalahan);
		if (Object.keys(kesalahan).length) return;
		onSimpan(
			{
				kelasId: kelas.id,
				judul: f.judul.trim(),
				levelId: f.levelId,
				jumlah: f.jumlah,
				tenggat: f.tenggat
					? new Date(f.tenggat).toLocaleDateString("id-ID", {
							day: "numeric",
							month: "short",
							year: "numeric",
						})
					: null,
				jalur: f.jalur,
				petunjuk: f.petunjuk,
				siswaIds: f.khusus ? f.pilih : null,
				catatan: f.catatan.trim(),
			},
			status,
		);
	}

	const chip = (aktif) =>
		`flex h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-semibold ${aktif ? "border-violet-500 bg-violet-50 text-violet-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`;

	return (
		<div className="mx-auto max-w-3xl space-y-4">
			<button
				type="button"
				onClick={onBatal}
				className="text-xs font-semibold text-slate-500 hover:text-violet-600"
			>
				← Penugasan
			</button>
			<Judul
				judul="Buat tugas baru"
				keterangan={`Untuk ${kelas.nama}. Simpan sebagai draf sampai siap diterbitkan.`}
			/>

			<Kartu className="space-y-4">
				<Field
					id="judul-tugas"
					label="Judul tugas"
					value={f.judul}
					onChange={(e) => atur("judul", e.target.value)}
					placeholder="Contoh: Latihan penjumlahan sampai 20"
					galat={galat.judul}
				/>
				<div className="space-y-1.5">
					<label
						htmlFor="level"
						className="block text-[13px] font-semibold text-slate-700"
					>
						Level materi
					</label>
					<select
						id="level"
						value={f.levelId}
						onChange={(e) => atur("levelId", Number(e.target.value))}
						className={INPUT}
					>
						{LEVEL.map((l) => (
							<option key={l.id} value={l.id}>
								Level {l.id}: {l.topik}
							</option>
						))}
					</select>
				</div>
				<fieldset>
					<legend className="text-xs font-semibold text-slate-700">
						Jumlah soal
					</legend>
					<div className="mt-2 flex flex-wrap gap-2">
						{[5, 10, 15].map((n) => (
							<label key={n} className={chip(f.jumlah === n)}>
								<input
									type="radio"
									name="jumlah"
									className="accent-violet-500"
									checked={f.jumlah === n}
									onChange={() => atur("jumlah", n)}
								/>{" "}
								{n} soal
							</label>
						))}
					</div>
				</fieldset>
				<fieldset>
					<legend className="text-xs font-semibold text-slate-700">
						Batas petunjuk per soal
					</legend>
					<div className="mt-2 flex flex-wrap gap-2">
						{[1, 2, 3].map((n) => (
							<label key={n} className={chip(f.petunjuk === n)}>
								<input
									type="radio"
									name="petunjuk"
									className="accent-violet-500"
									checked={f.petunjuk === n}
									onChange={() => atur("petunjuk", n)}
								/>{" "}
								{n} petunjuk
							</label>
						))}
					</div>
				</fieldset>
				<Field
					id="tenggat"
					label="Tenggat (opsional)"
					type="date"
					value={f.tenggat}
					onChange={(e) => atur("tenggat", e.target.value)}
				/>
				<fieldset>
					<legend className="text-xs font-semibold text-slate-700">
						Cara menjawab yang diizinkan
					</legend>
					<p className="mt-0.5 text-[11px] text-slate-500">
						Papan ketik selalu diizinkan agar setiap soal bisa dijawab tanpa
						kamera atau mikrofon.
					</p>
					<div className="mt-2 flex flex-wrap gap-2">
						{JALUR.map((j) => (
							<label key={j.id} className={chip(f.jalur.includes(j.id))}>
								<input
									type="checkbox"
									className="accent-violet-500"
									disabled={j.id === "keyboard"}
									checked={f.jalur.includes(j.id)}
									onChange={() => ubahJalur(j.id)}
								/>
								{j.label}
								{j.id === "keyboard" ? " (selalu)" : ""}
							</label>
						))}
					</div>
				</fieldset>
				<fieldset>
					<legend className="text-xs font-semibold text-slate-700">
						Ditugaskan kepada
					</legend>
					<div className="mt-2 flex flex-wrap gap-2">
						<label className={chip(!f.khusus)}>
							<input
								type="radio"
								name="target"
								className="accent-violet-500"
								checked={!f.khusus}
								onChange={() => atur("khusus", false)}
							/>{" "}
							Seluruh kelas ({aktif.length} siswa)
						</label>
						<label className={chip(f.khusus)}>
							<input
								type="radio"
								name="target"
								className="accent-violet-500"
								checked={f.khusus}
								onChange={() => atur("khusus", true)}
							/>{" "}
							Siswa tertentu
						</label>
					</div>
					{f.khusus && (
						<ul className="mt-3 grid gap-2 sm:grid-cols-2">
							{aktif.map((s) => (
								<li key={s.id}>
									<label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-700">
										<input
											type="checkbox"
											className="accent-violet-500"
											checked={f.pilih.includes(s.id)}
											onChange={() => ubahPilih(s.id)}
										/>
										{s.nama}
									</label>
								</li>
							))}
						</ul>
					)}
					{galat.pilih && (
						<p
							role="alert"
							className="mt-2 text-[12px] font-medium text-rose-600"
						>
							{galat.pilih}
						</p>
					)}
				</fieldset>
				<div className="space-y-1.5">
					<label
						htmlFor="catatan"
						className="block text-[13px] font-semibold text-slate-700"
					>
						Catatan untuk siswa (opsional)
					</label>
					<textarea
						id="catatan"
						rows={3}
						value={f.catatan}
						onChange={(e) => atur("catatan", e.target.value)}
						className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
					/>
				</div>
			</Kartu>

			<div className="flex flex-wrap gap-2 pb-4">
				<button
					type="button"
					className={TOMBOL.utama}
					onClick={() => kirim("terbit")}
				>
					<Send className="h-3.5 w-3.5" aria-hidden="true" /> Terbitkan ke siswa
				</button>
				<button
					type="button"
					className={TOMBOL.kedua}
					onClick={() => kirim("draf")}
				>
					Simpan sebagai draf
				</button>
			</div>
		</div>
	);
}

/* ============================ PANTAU PROGRES ============================ */

const PERIODE = [
	{ id: 7, label: "7 hari terakhir" },
	{ id: 14, label: "14 hari terakhir" },
	{ id: 999, label: "Semua waktu" },
];

function Progres({
	kelas,
	siswa,
	percobaan,
}: {
	kelas: Kelas;
	siswa: Siswa[];
	percobaan: Percobaan[];
}) {
	const [periode, setPeriode] = useState<number>(14);
	const [dipilih, setDipilih] = useState<string | null>(null);
	const dalam = percobaan.filter(
		(p) => p.kelasId === kelas.id && p.hariLalu <= periode,
	);

	const daftar = siswa
		.filter((s) => s.kelasId === kelas.id && !s.arsip)
		.map((s) => {
			const list = dalam.filter((p) => p.siswaId === s.id);
			return { s, list, acc: akurasi(list), alasan: alasanPerhatian(s, list) };
		});

	const polaSalah = useMemo(() => {
		const peta = {};
		dalam.forEach((p) => {
			const n = nilaiAkhir(p);
			if (n === null) return;
			peta[p.jenis] = peta[p.jenis] || { salah: 0, total: 0 };
			peta[p.jenis].total += 1;
			if (n === "salah") peta[p.jenis].salah += 1;
		});
		return Object.entries(peta)
			.filter(([, v]) => v.salah > 0)
			.sort((a, b) => b[1].salah - a[1].salah)
			.slice(0, 3);
	}, [dalam]);

	if (dipilih) {
		const s = siswa.find((x) => x.id === dipilih);
		const list = dalam.filter((p) => p.siswaId === dipilih);
		const sesiMap = {};
		list.forEach((p) => {
			sesiMap[p.sesi] = sesiMap[p.sesi] || {
				levelId: p.levelId,
				total: 0,
				benar: 0,
				dinilai: 0,
				hari: p.hariLalu,
				jalur: new Set(),
				petunjuk: 0,
			};
			const g = sesiMap[p.sesi];
			g.total += 1;
			g.petunjuk += p.petunjuk;
			g.jalur.add(JALUR_LABEL[p.jalur]);
			if (nilaiAkhir(p) !== null) g.dinilai += 1;
			if (nilaiAkhir(p) === "benar") g.benar += 1;
		});
		const sesiList = Object.values(sesiMap)
			.sort((a, b) => a.hari - b.hari)
			.slice(0, 15);
		return (
			<div className="space-y-5">
				<button
					type="button"
					onClick={() => setDipilih(null)}
					className="text-xs font-semibold text-slate-500 hover:text-violet-600"
				>
					← Pantau progres
				</button>
				<Judul
					judul={s.nama}
					keterangan={`${kelas.nama} · terakhir aktif ${hariLabel(s.terakhirHari)}`}
				/>
				<div className="grid gap-3 sm:grid-cols-3">
					<Stat
						label="Akurasi"
						nilai={akurasi(list) === null ? "Belum ada" : `${akurasi(list)}%`}
						keterangan={`${list.filter((p) => nilaiAkhir(p) !== null).length} soal dinilai`}
						Ikon={CheckCircle2}
					/>
					<Stat
						label="Soal dijawab"
						nilai={`${list.length}`}
						keterangan={`${Object.keys(sesiMap).length} sesi`}
						Ikon={ClipboardList}
					/>
					<Stat
						label="Petunjuk"
						nilai={
							list.length
								? (
										list.reduce((a, p) => a + p.petunjuk, 0) / list.length
									).toFixed(1)
								: "–"
						}
						keterangan="rata-rata per soal"
						Ikon={Hand}
					/>
				</div>
				<Kartu>
					<h2 className="text-sm font-bold text-slate-800">
						Akurasi per level
					</h2>
					<ul className="mt-3 space-y-3">
						{LEVEL.map((l) => (
							<li key={l.id}>
								<p className="mb-1 text-xs font-semibold text-slate-700">
									Level {l.id}: {l.topik}
								</p>
								<Bilah
									persen={akurasi(list.filter((p) => p.levelId === l.id))}
								/>
							</li>
						))}
					</ul>
				</Kartu>
				<Kartu>
					<h2 className="text-sm font-bold text-slate-800">Riwayat sesi</h2>
					{sesiList.length === 0 ? (
						<p className="mt-3 text-xs text-slate-500">
							Belum ada latihan pada periode ini.
						</p>
					) : (
						<ul className="mt-3 divide-y divide-slate-100">
							{sesiList.map((g) => (
								<li
									key={`sesi-${g.levelId}-${g.hari}-${Array.from(g.jalur).join("-")}`}
									className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs"
								>
									<span className="font-bold text-slate-800">
										Level {g.levelId} · {hariLabel(g.hari)}
									</span>
									<span className="text-slate-600">
										{[...g.jalur].join(", ")} · {g.benar} benar dari {g.dinilai}{" "}
										dinilai · {g.petunjuk} petunjuk
									</span>
								</li>
							))}
						</ul>
					)}
				</Kartu>
			</div>
		);
	}

	const acc = akurasi(dalam);
	return (
		<div className="space-y-5">
			<Judul
				judul="Pantau Progres"
				keterangan="Akurasi dihitung dari jawaban yang sudah dinilai. Jawaban tidak terbaca tidak dihitung salah."
				aksi={
					<select
						aria-label="Periode"
						value={periode}
						onChange={(e) => setPeriode(Number(e.target.value))}
						className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800"
					>
						{PERIODE.map((p) => (
							<option key={p.id} value={p.id}>
								{p.label}
							</option>
						))}
					</select>
				}
			/>
			<div className="grid gap-3 sm:grid-cols-3">
				<Stat
					label="Akurasi kelas"
					nilai={acc === null ? "Belum ada" : `${acc}%`}
					keterangan={PERIODE.find((p) => p.id === periode).label}
					Ikon={CheckCircle2}
				/>
				<Stat
					label="Siswa perlu perhatian"
					nilai={`${daftar.filter((x) => x.alasan.length).length} siswa`}
					keterangan={`dari ${daftar.length} siswa aktif`}
					Ikon={AlertCircle}
				/>
				<Stat
					label="Soal dijawab"
					nilai={`${dalam.length}`}
					keterangan="termasuk yang belum dinilai"
					Ikon={Users}
				/>
			</div>

			<Kartu>
				<h2 className="text-sm font-bold text-slate-800">Akurasi per level</h2>
				<ul className="mt-4 space-y-3">
					{LEVEL.map((l) => {
						const data = dalam.filter((p) => p.levelId === l.id);
						return (
							<li
								key={l.id}
								className="grid gap-2 sm:grid-cols-[1fr_1.2fr] sm:items-center"
							>
								<div>
									<p className="text-xs font-semibold text-slate-800">
										Level {l.id}: {l.topik}
									</p>
									<p className="text-[11px] text-slate-500">
										{data.length} soal dijawab
									</p>
								</div>
								<Bilah persen={akurasi(data)} />
							</li>
						);
					})}
				</ul>
			</Kartu>

			<div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
				<Kartu>
					<h2 className="text-sm font-bold text-slate-800">Siswa</h2>
					<ul className="mt-3 divide-y divide-slate-100">
						{daftar.map((x) => (
							<li
								key={x.s.id}
								className="grid gap-2 py-3 sm:grid-cols-[1fr_1.1fr_auto] sm:items-center"
							>
								<div>
									<p className="text-xs font-bold text-slate-800">{x.s.nama}</p>
									{x.alasan.length > 0 && (
										<p className="mt-1 text-[11px] text-amber-700">
											{x.alasan.join(". ")}
										</p>
									)}
								</div>
								<Bilah persen={x.acc} />
								<button
									type="button"
									onClick={() => setDipilih(x.s.id)}
									className={TOMBOL.kedua}
								>
									Detail <ArrowRight className="h-3 w-3" aria-hidden="true" />
								</button>
							</li>
						))}
					</ul>
				</Kartu>
				<Kartu>
					<h2 className="text-sm font-bold text-slate-800">
						Pola kesalahan kelas
					</h2>
					{polaSalah.length === 0 ? (
						<p className="mt-3 text-xs text-slate-500">
							Belum ada jawaban salah pada periode ini.
						</p>
					) : (
						<ul className="mt-3 space-y-3">
							{polaSalah.map(([jenis, v]) => (
								<li key={jenis}>
									<p className="text-xs font-semibold text-slate-800">
										{jenis}
									</p>
									<p className="text-[11px] text-slate-600">
										{v.salah} salah dari {v.total} soal yang dinilai
									</p>
								</li>
							))}
						</ul>
					)}
				</Kartu>
			</div>
		</div>
	);
}

/* ============================ TINJAU JAWABAN ============================ */

function Tinjau({
	kelas,
	siswa,
	percobaan,
	audit,
	aksi,
}: {
	kelas: Kelas;
	siswa: Siswa[];
	percobaan: Percobaan[];
	audit: Audit[];
	aksi: {
		tinjau: (id: string, masukan: TinjauMasukan, nama: string) => void;
	};
}) {
	const [filter, setFilter] = useState<"belum" | "tidak-terbaca" | "semua">(
		"belum",
	);
	const namaSiswa = (id) => siswa.find((s) => s.id === id)?.nama ?? "Siswa";
	const daftar = percobaan
		.filter((p) => p.kelasId === kelas.id)
		.filter((p) => {
			if (filter === "belum") return perluTinjau(p);
			if (filter === "tidak-terbaca")
				return p.sistem === "tidak-terbaca" || p.sistem === "layanan-gagal";
			return true;
		})
		.sort((a, b) => a.hariLalu - b.hariLalu)
		.slice(0, 25);

	return (
		<div className="space-y-4">
			<Judul
				judul="Tinjau Jawaban"
				keterangan="Periksa hasil yang terbaca dan penilaian sistem. Ubah penilaian atau tandai pengenalan yang keliru."
			/>
			<div className="flex flex-wrap gap-2">
				{[
					{ id: "belum", label: "Belum ditinjau" },
					{ id: "tidak-terbaca", label: "Tidak terbaca" },
					{ id: "semua", label: "Semua" },
				].map((f) => (
					<button
						key={f.id}
						type="button"
						aria-pressed={filter === f.id}
						onClick={() => setFilter(f.id)}
						className={filter === f.id ? TOMBOL.utama : TOMBOL.kedua}
					>
						{f.label}
					</button>
				))}
			</div>
			{daftar.length === 0 && (
				<Kartu>
					<p className="text-xs text-slate-500">
						Tidak ada jawaban untuk ditinjau pada filter ini.
					</p>
				</Kartu>
			)}
			<ul className="space-y-3">
				{daftar.map((p) => (
					<li key={p.id}>
						<KartuTinjau
							p={p}
							nama={namaSiswa(p.siswaId)}
							onSimpan={(masukan) =>
								aksi.tinjau(p.id, masukan, namaSiswa(p.siswaId))
							}
						/>
					</li>
				))}
			</ul>
			<Kartu>
				<h2 className="text-sm font-bold text-slate-800">Riwayat perubahan</h2>
				{audit.length === 0 ? (
					<p className="mt-3 text-xs text-slate-500">Belum ada perubahan.</p>
				) : (
					<ul className="mt-3 divide-y divide-slate-100">
						{audit.slice(0, 10).map((a) => (
							<li
								key={a.id}
								className="py-2.5 text-[11px] leading-relaxed text-slate-600"
							>
								<span className="font-semibold text-slate-800">{a.aksi}</span>:{" "}
								{a.detail}
								<span className="block text-slate-400">
									{a.pelaku}, {hariLabel(a.hari)}
								</span>
							</li>
						))}
					</ul>
				)}
			</Kartu>
		</div>
	);
}

function KartuTinjau({
	p,
	nama,
	onSimpan,
}: {
	p: Percobaan;
	nama: string;
	onSimpan: (masukan: TinjauMasukan) => void;
}) {
	const [terbuka, setTerbuka] = useState<boolean>(false);
	const [penilaian, setPenilaian] = useState<"ikut" | "benar" | "salah">(
		p.tinjau?.penilaian ?? "ikut",
	);
	const [pengenalan, setPengenalan] = useState<boolean>(
		p.tinjau?.pengenalanSalah ?? false,
	);
	const [catatan, setCatatan] = useState<string>(p.tinjau?.catatan ?? "");
	const nilai = nilaiAkhir(p);
	const Ikon = JALUR_IKON[p.jalur];

	return (
		<Kartu>
			<div className="flex flex-wrap items-start justify-between gap-2">
				<div>
					<p className="text-xs font-bold text-slate-800">{nama}</p>
					<p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
						<Ikon className="h-3 w-3" aria-hidden="true" />{" "}
						{JALUR_LABEL[p.jalur]} · Level {p.levelId} · {hariLabel(p.hariLalu)}
					</p>
				</div>
				<span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
					Sistem: {SISTEM_LABEL[p.sistem]}
				</span>
			</div>
			<p className="mt-3 text-sm font-semibold text-slate-800">{p.soal}</p>
			<p className="mt-2 text-[12px] text-slate-600">
				Terbaca:{" "}
				<span className="font-semibold">{p.terbaca ?? "tidak terbaca"}</span> ·
				Kunci: <span className="font-semibold">{p.kunci}</span> · Penilaian
				akhir:{" "}
				<span className="font-semibold">
					{nilai === null
						? "tidak dihitung"
						: nilai === "benar"
							? "Benar"
							: "Salah"}
				</span>
			</p>
			<button
				type="button"
				aria-expanded={terbuka}
				onClick={() => setTerbuka((t) => !t)}
				className={`${TOMBOL.kedua} mt-4`}
			>
				{terbuka ? "Tutup tinjauan" : "Tinjau jawaban ini"}
			</button>
			{terbuka && (
				<div className="mt-4 space-y-3.5 rounded-xl bg-slate-50 p-4">
					<div className="space-y-1.5">
						<label
							htmlFor="select-penilaian-guru"
							className="block text-[13px] font-semibold text-slate-700"
						>
							Penilaian
						</label>
						<select
							id="select-penilaian-guru"
							value={penilaian}
							onChange={(e) => setPenilaian(e.target.value)}
							className={INPUT}
						>
							<option value="ikut">Ikuti sistem</option>
							<option value="benar">Ubah menjadi Benar</option>
							<option value="salah">Ubah menjadi Salah</option>
						</select>
					</div>
					<label className="flex items-start gap-2 text-xs font-medium text-slate-700">
						<input
							type="checkbox"
							className="mt-0.5 accent-violet-500"
							checked={pengenalan}
							onChange={(e) => setPengenalan(e.target.checked)}
						/>
						<span>
							Tandai pengenalan salah
							<span className="block font-normal text-slate-500">
								Dipakai bila yang terbaca tidak sesuai jawaban siswa.
							</span>
						</span>
					</label>
					<Field
						id={`catatan-${p.id}`}
						label="Catatan untuk siswa"
						value={catatan}
						onChange={(e) => setCatatan(e.target.value)}
					/>
					<button
						type="button"
						className={TOMBOL.utama}
						onClick={() => {
							onSimpan({
								penilaian: penilaian === "ikut" ? null : penilaian,
								pengenalanSalah: pengenalan,
								catatan,
							});
							setTerbuka(false);
						}}
					>
						Simpan tinjauan
					</button>
				</div>
			)}
		</Kartu>
	);
}

/* ============================ LAPORAN ============================ */

function Laporan({
	kelas,
	siswa,
	percobaan,
}: {
	kelas: Kelas;
	siswa: Siswa[];
	percobaan: Percobaan[];
}) {
	const [periode, setPeriode] = useState<number>(14);
	const baris = percobaan
		.filter((p) => p.kelasId === kelas.id && p.hariLalu <= periode)
		.sort((a, b) => a.hariLalu - b.hariLalu)
		.map((p) => {
			const n = nilaiAkhir(p);
			return [
				hariLabel(p.hariLalu),
				siswa.find((s) => s.id === p.siswaId)?.nama ?? "",
				p.levelId,
				p.jenis,
				n === null ? "Tidak dihitung" : n === "benar" ? "Benar" : "Salah",
				SISTEM_LABEL[p.sistem],
				JALUR_LABEL[p.jalur],
				p.terbaca,
				p.kunci,
				p.petunjuk,
			];
		});
	const kolom = [
		"Waktu",
		"Nama siswa",
		"Level",
		"Jenis soal",
		"Penilaian akhir",
		"Penilaian sistem",
		"Cara menjawab",
		"Terbaca",
		"Kunci",
		"Petunjuk",
	];

	return (
		<div className="space-y-4">
			<Judul
				judul="Laporan"
				keterangan="Rekap latihan kelas dalam bentuk CSV. Berkas berisi nama siswa, simpan dengan hati-hati."
			/>
			<Kartu className="flex flex-wrap items-end gap-3">
				<div className="space-y-1.5">
					<label
						htmlFor="periode-laporan"
						className="block text-xs font-semibold text-slate-700"
					>
						Periode
					</label>
					<select
						id="periode-laporan"
						value={periode}
						onChange={(e) => setPeriode(Number(e.target.value))}
						className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold"
					>
						{PERIODE.map((p) => (
							<option key={p.id} value={p.id}>
								{p.label}
							</option>
						))}
					</select>
				</div>
				<button
					type="button"
					disabled={baris.length === 0}
					className={TOMBOL.utama}
					onClick={() =>
						unduhCsv(`laporan-${kelas.kode}.csv`, csv([kolom, ...baris]))
					}
				>
					<Download className="h-4 w-4" aria-hidden="true" /> Unduh CSV
				</button>
			</Kartu>
			<p className="text-[11px] text-slate-500">
				{baris.length} baris. Pratinjau menampilkan 8 baris pertama.
			</p>
			<Kartu className="overflow-x-auto p-0">
				<table className="w-full min-w-[640px] text-left text-[11px]">
					<caption className="sr-only">Pratinjau laporan latihan</caption>
					<thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
						<tr>
							{kolom.map((k) => (
								<th key={k} scope="col" className="px-3 py-2.5 font-semibold">
									{k}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{baris.slice(0, 8).map((b) => (
							<tr key={`row-${b.join("-")}`}>
								{b.map((v) => (
									<td
										key={`cell-${b[0]}-${v ?? ""}`}
										className="px-3 py-2 text-slate-700"
									>
										{v ?? "–"}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</Kartu>
		</div>
	);
}

/* ============================ BANTUAN ============================ */

function Bantuan() {
	const STATUS = [
		[
			"Salah hitung",
			"Hasil terbaca jelas, tetapi tidak sama dengan jawaban menurut aturan. Bisa berarti siswa keliru menghitung.",
		],
		[
			"Tidak terbaca",
			"Sistem tidak yakin dengan hasil pengenalan. Tidak dihitung salah; siswa diminta mengulang atau memakai cara lain.",
		],
		[
			"Layanan gagal",
			"Mikrofon, kamera, atau layanan pengenalan tidak tersedia. Ini bukan kesalahan siswa.",
		],
	];
	return (
		<div className="space-y-4">
			<Judul
				judul="Bantuan"
				keterangan="Cara membaca dashboard dan batas kemampuan sistem."
			/>
			<Kartu>
				<h2 className="text-sm font-bold text-slate-800">
					Membaca status jawaban
				</h2>
				<dl className="mt-3 space-y-3">
					{STATUS.map(([j, i]) => (
						<div key={j}>
							<dt className="text-xs font-bold text-slate-800">{j}</dt>
							<dd className="mt-0.5 text-xs leading-relaxed text-slate-600">
								{i}
							</dd>
						</div>
					))}
				</dl>
			</Kartu>
			<Kartu>
				<h2 className="text-sm font-bold text-slate-800">
					Penilaian final ada di tangan Anda
				</h2>
				<p className="mt-2 text-xs leading-relaxed text-slate-600">
					Sistem menilai dengan aturan matematika, bukan tebakan AI. Hasilnya
					tetap umpan balik latihan. Tinjau jawaban yang meragukan dan ubah
					penilaiannya bila perlu.
				</p>
			</Kartu>
			<Kartu>
				<h2 className="text-sm font-bold text-slate-800">
					Pertanyaan yang sering muncul
				</h2>
				<dl className="mt-3 space-y-3 text-xs leading-relaxed text-slate-600">
					<div>
						<dt className="font-semibold text-slate-800">
							Apakah rekaman suara disimpan?
						</dt>
						<dd>
							Tidak secara bawaan. Yang disimpan hanya hasil terbaca dan
							penilaian.
						</dd>
					</div>
					<div>
						<dt className="font-semibold text-slate-800">
							Bagaimana jika siswa tidak bisa memakai kamera?
						</dt>
						<dd>
							Siswa tetap bisa menjawab lewat papan ketik. Atur cara menjawab
							per tugas di menu Penugasan.
						</dd>
					</div>
				</dl>
			</Kartu>
		</div>
	);
}

/* ============================ APLIKASI ============================ */

export default function AplikasiGuru() {
	const [data, setData] = useState(buatData);
	const [masuk, setMasuk] = useState(false);
	const [halaman, setHalaman] = useState("beranda");
	const [kelasId, setKelasId] = useState("k1");
	const [lainnya, setLainnya] = useState(false);

	if (!masuk) return <Masuk onMasuk={() => setMasuk(true)} />;

	const kelas = data.kelas.find((k) => k.id === kelasId) ?? data.kelas[0];
	const catat = (aksiNama, detail) => ({
		id: `au${Math.random().toString(36).slice(2, 9)}`,
		kelasId: kelas.id,
		pelaku: AKUN.nama,
		aksi: aksiNama,
		detail,
		hari: 0,
	});
	const ubah = (fn) => setData((d) => fn(d));

	const aksi = {
		tambahSiswa(nama) {
			const ada = data.siswa.some(
				(s) =>
					s.kelasId === kelas.id &&
					!s.arsip &&
					s.nama.toLowerCase() === nama.toLowerCase(),
			);
			if (ada) return { ok: false, pesan: `${nama} sudah ada di kelas ini.` };
			ubah((d) => ({
				...d,
				siswa: [
					...d.siswa,
					{
						id: `s${Math.random().toString(36).slice(2, 8)}`,
						kelasId: kelas.id,
						nama,
						kemampuan: 0.6,
						level: 1,
						terakhirHari: 0,
						arsip: false,
						pinBaru: true,
					},
				],
				audit: [catat("Tambah siswa", nama), ...d.audit],
			}));
			return { ok: true };
		},
		tambahKelas(nama) {
			const id = `k${Math.random().toString(36).slice(2, 7)}`;
			ubah((d) => ({
				...d,
				kelas: [
					...d.kelas,
					{
						id,
						nama,
						kode: `${nama.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 90 + 10)}`,
					},
				],
			}));
			setKelasId(id);
		},
		gantiKode(id) {
			ubah((d) => ({
				...d,
				kelas: d.kelas.map((k) =>
					k.id === id
						? {
								...k,
								kode: `${k.nama.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 90 + 10)}`,
							}
						: k,
				),
				audit: [
					catat("Ganti kode gabung", "Kode gabung diperbarui"),
					...d.audit,
				],
			}));
		},
		resetPin(siswaId) {
			ubah((d) => ({
				...d,
				siswa: d.siswa.map((s) =>
					s.id === siswaId ? { ...s, pinBaru: true } : s,
				),
			}));
			return String(1000 + Math.floor(Math.random() * 9000));
		},
		arsip(siswaId, arsip) {
			ubah((d) => ({
				...d,
				siswa: d.siswa.map((s) => (s.id === siswaId ? { ...s, arsip } : s)),
			}));
		},
		buatTugas(t, status) {
			const id = `t${Math.random().toString(36).slice(2, 7)}`;
			ubah((d) => ({ ...d, tugas: [...d.tugas, { ...t, id, status }] }));
		},
		terbitkan(id) {
			ubah((d) => ({
				...d,
				tugas: d.tugas.map((t) =>
					t.id === id ? { ...t, status: "terbit" } : t,
				),
			}));
		},
		hapusTugas(id) {
			ubah((d) => ({ ...d, tugas: d.tugas.filter((t) => t.id !== id) }));
		},
		tinjau(id, masukan, nama) {
			ubah((d) => {
				const p = d.percobaan.find((x) => x.id === id);
				const sebelum = p ? nilaiAkhir(p) : null;
				const sesudah =
					masukan.penilaian ??
					(p && (p.sistem === "benar" || p.sistem === "salah")
						? p.sistem
						: null);
				const entri = [];
				if (sebelum !== sesudah)
					entri.push(
						catat(
							"Ubah penilaian",
							`${nama}: ${sebelum ?? "belum dinilai"} menjadi ${sesudah ?? "sesuai sistem"}`,
						),
					);
				if (masukan.pengenalanSalah)
					entri.push(catat("Tandai pengenalan salah", nama));
				return {
					...d,
					percobaan: d.percobaan.map((x) =>
						x.id === id ? { ...x, tinjau: { ...masukan, oleh: AKUN.nama } } : x,
					),
					audit: [...entri, ...d.audit],
				};
			});
		},
	};

	const kelasSaya = data.kelas;
	const kelasPilihan = (
		<select
			aria-label="Kelas"
			value={kelas.id}
			onChange={(e) => setKelasId(e.target.value)}
			className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800"
		>
			{kelasSaya.map((k) => (
				<option key={k.id} value={k.id}>
					{k.nama}
				</option>
			))}
		</select>
	);

	const isi = {
		beranda: (
			<Beranda
				kelas={kelas}
				siswa={data.siswa}
				percobaan={data.percobaan}
				tugas={data.tugas}
				ke={setHalaman}
			/>
		),
		kelas: (
			<Kelas
				kelas={kelas}
				kelasList={kelasSaya}
				pilihKelas={setKelasId}
				siswa={data.siswa}
				aksi={aksi}
			/>
		),
		tugas: (
			<Penugasan
				kelas={kelas}
				siswa={data.siswa}
				percobaan={data.percobaan}
				tugas={data.tugas}
				aksi={aksi}
			/>
		),
		progres: (
			<Progres kelas={kelas} siswa={data.siswa} percobaan={data.percobaan} />
		),
		tinjau: (
			<Tinjau
				kelas={kelas}
				siswa={data.siswa}
				percobaan={data.percobaan}
				audit={data.audit.filter((a) => a.kelasId === kelas.id)}
				aksi={aksi}
			/>
		),
		laporan: (
			<Laporan kelas={kelas} siswa={data.siswa} percobaan={data.percobaan} />
		),
		bantuan: <Bantuan />,
	}[halaman];

	const antrean = data.percobaan.filter(
		(p) => p.kelasId === kelas.id && perluTinjau(p),
	).length;
	const aktifMenu = MENU.find((m) => m.id === halaman);

	return (
		<div className="min-h-screen bg-slate-50 text-slate-700">
			<div className="flex min-h-screen">
				<aside className="hidden w-60 shrink-0 flex-col border-r border-slate-100 bg-white px-3 py-4 md:flex">
					<div className="mb-4 px-3">
						<p className="text-[11px] font-bold uppercase tracking-wider text-violet-600">
							HITUNGIN
						</p>
						<p className="text-sm font-bold text-slate-800">Guru Pendamping</p>
					</div>
					<nav aria-label="Menu guru" className="flex-1 space-y-1">
						{MENU.map((m) => (
							<button
								key={m.id}
								type="button"
								aria-current={halaman === m.id ? "page" : undefined}
								onClick={() => setHalaman(m.id)}
								className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] font-medium ${halaman === m.id ? "bg-violet-500 font-semibold text-white" : "text-slate-600 hover:bg-slate-50"}`}
							>
								<span className="flex items-center gap-2.5">
									<m.ikon className="h-4 w-4" aria-hidden="true" />
									{m.label}
								</span>
								{m.id === "tinjau" && antrean > 0 && (
									<span className="rounded bg-pink-50 px-1.5 py-0.5 text-[10px] font-bold text-pink-600">
										{antrean}
									</span>
								)}
							</button>
						))}
					</nav>
					<div className="border-t border-slate-100 pt-3">
						<p className="px-3 text-xs font-bold text-slate-800">{AKUN.nama}</p>
						<button
							type="button"
							onClick={() => setMasuk(false)}
							className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50"
						>
							<LogOut className="h-4 w-4" aria-hidden="true" /> Keluar
						</button>
					</div>
				</aside>

				<div className="flex min-w-0 flex-1 flex-col">
					<header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 sm:px-6">
						<h2 className="truncate text-sm font-bold text-slate-800 md:hidden">
							HITUNGIN · {aktifMenu.label}
						</h2>
						<span className="hidden text-sm font-bold text-slate-800 md:block">
							{aktifMenu.label}
						</span>
						<div className="flex items-center gap-2">{kelasPilihan}</div>
					</header>
					<main className="flex-1 px-4 pb-28 pt-5 sm:px-6 md:pb-8">
						<div className="mx-auto max-w-5xl">{isi}</div>
					</main>
				</div>
			</div>

			{lainnya && (
				<div className="fixed inset-x-0 bottom-16 z-20 border-t border-slate-100 bg-white px-3 py-3 shadow-lg md:hidden">
					{["laporan", "bantuan"].map((id) => {
						const m = MENU.find((x) => x.id === id);
						return (
							<button
								key={id}
								type="button"
								onClick={() => {
									setHalaman(id);
									setLainnya(false);
								}}
								className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50"
							>
								<m.ikon className="h-4 w-4" aria-hidden="true" /> {m.label}
							</button>
						);
					})}
					<button
						type="button"
						onClick={() => setMasuk(false)}
						className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50"
					>
						<LogOut className="h-4 w-4" aria-hidden="true" /> Keluar
					</button>
				</div>
			)}

			<nav
				aria-label="Menu utama"
				className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-100 bg-white md:hidden"
			>
				<ul className="flex">
					{MENU.filter((m) => MENU_BAWAH.includes(m.id)).map((m) => (
						<li key={m.id} className="flex-1">
							<button
								type="button"
								aria-current={halaman === m.id ? "page" : undefined}
								onClick={() => {
									setHalaman(m.id);
									setLainnya(false);
								}}
								className={`flex h-16 w-full flex-col items-center justify-center gap-1 text-[10px] font-semibold ${halaman === m.id ? "text-violet-600" : "text-slate-500"}`}
							>
								<m.ikon className="h-5 w-5" aria-hidden="true" />
								{m.label.split(" ")[0]}
							</button>
						</li>
					))}
					<li className="flex-1">
						<button
							type="button"
							aria-expanded={lainnya}
							onClick={() => setLainnya((v) => !v)}
							className={`flex h-16 w-full flex-col items-center justify-center gap-1 text-[10px] font-semibold ${lainnya ? "text-violet-600" : "text-slate-500"}`}
						>
							<Menu className="h-5 w-5" aria-hidden="true" /> Lainnya
						</button>
					</li>
				</ul>
			</nav>
		</div>
	);
}
