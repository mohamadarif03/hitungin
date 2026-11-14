import { Link, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	CheckCircle2,
	Hand,
	Keyboard,
	Mic,
	Pause,
	PenTool,
	Target,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { JalurIsyarat } from "@/components/latihan/jalur-isyarat";
import { JalurKeyboard } from "@/components/latihan/jalur-keyboard";
import { JalurSuara } from "@/components/latihan/jalur-suara";
import { JalurTulisan } from "@/components/latihan/jalur-tulisan";
import { MathRumus } from "@/components/math-rumus";
import { TombolDengar } from "@/components/tombol-dengar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VisualSoal } from "@/components/visual-bilangan";
import { useAksesibilitasStore } from "@/datas/stores/aksesibilitas-store";
import { useLatihanStore } from "@/datas/stores/latihan-store";
import { nilaiJawaban, petunjuk, type Soal } from "@/lib/soal";
import { ucapkan } from "@/lib/ucapkan";
import { cn } from "@/lib/utils";

export type CaraMenjawab = "keyboard" | "suara" | "isyarat" | "tulisan";

const CARA: { id: CaraMenjawab; label: string; ikon: typeof Keyboard }[] = [
	{ id: "keyboard", label: "Papan ketik", ikon: Keyboard },
	{ id: "suara", label: "Suara", ikon: Mic },
	{ id: "isyarat", label: "Isyarat angka", ikon: Hand },
	{ id: "tulisan", label: "Tulisan", ikon: PenTool },
];

type HasilSesi = {
	benar: number;
	total: number;
	soalSalah: { teks: string; jawaban: number }[];
	daftarSalah: Soal[];
	petunjuk: number;
};

type Props = {
	soal: Soal[];
	level: number;
	indeksAwal?: number;
	batasPetunjuk?: number;
	tugasId?: string;
	simpan?: boolean;
	tamu?: boolean;
};

export function SesiLatihan({
	soal,
	level,
	indeksAwal = 0,
	batasPetunjuk,
	tugasId,
	simpan = false,
	tamu = false,
}: Props) {
	const [daftar, setDaftar] = useState(soal);
	const [indeks, setIndeks] = useState(
		Math.min(indeksAwal, Math.max(soal.length - 1, 0)),
	);
	const [cara, setCara] = useState<CaraMenjawab>("keyboard");
	const [jawaban, setJawaban] = useState<
		Record<string, { benar: boolean; nilai: number }>
	>({});
	const [percobaan, setPercobaan] = useState<Record<string, number>>({});
	const [petunjukKe, setPetunjukKe] = useState(0);
	const [konfirmasi, setKonfirmasi] = useState<number | null>(null);
	const [pesan, setPesan] = useState("");
	const [hasilAkhir, setHasilAkhir] = useState<HasilSesi | null>(null);
	const batalkanPengenalan = useCallback(() => setKonfirmasi(null), []);
	const gunakanKeyboard = useCallback(() => {
		setKonfirmasi(null);
		setCara("keyboard");
	}, []);
	const [petunjukDipakai, setPetunjukDipakai] = useState<
		Record<string, number>
	>({});

	const perbaruiIndeks = useLatihanStore((state) => state.perbaruiIndeks);
	const akhiriSesi = useLatihanStore((state) => state.akhiriSesi);
	const catatPenandaan = useLatihanStore((state) => state.catatPenandaan);
	const suaraOtomatis = useAksesibilitasStore((state) => state.suaraOtomatis);
	const navigate = useNavigate();

	const maksPetunjuk = batasPetunjuk ?? 3;
	const aktif = daftar[indeks];
	const benarSaatIni = jawaban[aktif.id]?.benar === true;
	const salahSaatIni = !benarSaatIni && (percobaan[aktif.id] ?? 0) > 0;

	// Fitur Disabilitas: Otomatis bacakan soal baru jika opsi Suara Pembaca Layar aktif
	useEffect(() => {
		if (suaraOtomatis && aktif && !hasilAkhir) {
			ucapkan(`Soal nomor ${indeks + 1}. ${aktif.teks}`);
		}
	}, [indeks, suaraOtomatis, aktif, hasilAkhir]);

	function kirim(nilai: number) {
		const tepat = nilaiJawaban(aktif, nilai);
		setKonfirmasi(null);
		setJawaban((sebelumnya) => ({
			...sebelumnya,
			[aktif.id]: { benar: tepat, nilai },
		}));

		if (tepat) {
			ucapkan(`Benar! Jawaban ${nilai} tepat.`);
		} else {
			setPercobaan((sebelumnya) => ({
				...sebelumnya,
				[aktif.id]: (sebelumnya[aktif.id] ?? 0) + 1,
			}));
			setPetunjukKe(0);
			setPesan(
				`Jawaban ${nilai} belum tepat. Tidak ada jawaban yang dihitung salah secara permanen.`,
			);
			ucapkan(`Jawaban ${nilai} belum tepat. Coba lagi atau minta petunjuk.`);
		}
	}

	function tanganiHasilTerbaca(angka: number) {
		if (!Number.isInteger(angka) || angka < 0 || angka > 100) {
			setKonfirmasi(null);
			setPesan(
				"Hasil belum terbaca sebagai bilangan 0–100. Ulangi jawaban atau gunakan papan ketik.",
			);
			return;
		}
		setKonfirmasi(angka);
		ucapkan(`Terbaca ${angka}. Konfirmasi apakah hasil ini benar.`);
	}

	function mintaPetunjuk() {
		if (petunjukKe >= maksPetunjuk) return;
		setPetunjukKe(petunjukKe + 1);
		setPetunjukDipakai((sebelumnya) => ({
			...sebelumnya,
			[aktif.id]: (sebelumnya[aktif.id] ?? 0) + 1,
		}));
	}

	function lewati() {
		setJawaban((sebelumnya) => ({
			...sebelumnya,
			[aktif.id]: { benar: false, nilai: 0 },
		}));
		setPercobaan((sebelumnya) => ({
			...sebelumnya,
			[aktif.id]: (sebelumnya[aktif.id] ?? 0) + 1,
		}));
		lanjut();
	}

	function lanjut() {
		setKonfirmasi(null);
		setPesan("");
		setPetunjukKe(0);
		if (indeks + 1 >= daftar.length) {
			selesaikan();
			return;
		}
		setIndeks(indeks + 1);
		if (simpan) perbaruiIndeks(indeks + 1);
	}

	function selesaikan() {
		const daftarSalah = daftar.filter(
			(butir) => jawaban[butir.id]?.benar !== true,
		);
		const benar = daftar.length - daftarSalah.length;
		const hasil: HasilSesi = {
			benar,
			total: daftar.length,
			petunjuk: Object.values(petunjukDipakai).reduce(
				(jumlah, nilai) => jumlah + nilai,
				0,
			),
			soalSalah: daftarSalah.map((butir) => ({
				teks: butir.teks,
				jawaban: butir.jawaban,
			})),
			daftarSalah,
		};
		setHasilAkhir(hasil);

		if (simpan) {
			akhiriSesi({
				id: `sesi-${Date.now()}`,
				level,
				benar,
				total: daftar.length,
				soalSalah: hasil.soalSalah,
				waktu: new Date().toISOString(),
				tugasId,
			});
		}
	}

	function ulangiSoalSalah() {
		if (!hasilAkhir || hasilAkhir.daftarSalah.length === 0) return;
		setDaftar(hasilAkhir.daftarSalah);
		setIndeks(0);
		setJawaban({});
		setPercobaan({});
		setPetunjukKe(0);
		setKonfirmasi(null);
		setPesan("");
		setHasilAkhir(null);
		setPetunjukDipakai({});
		if (simpan) perbaruiIndeks(0);
	}

	if (hasilAkhir) {
		return (
			<RingkasanSesi
				hasil={hasilAkhir}
				level={level}
				tamu={tamu}
				simpan={simpan}
				onUlangi={ulangiSoalSalah}
			/>
		);
	}

	return (
		<div className="mx-auto max-w-3xl space-y-4">
			<Card className="p-4">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div>
						<p className="text-[11px] font-bold tracking-wider text-purple-600 uppercase">
							Latihan Level {level}
						</p>
						<h1 className="text-sm font-bold text-slate-800">
							Soal {indeks + 1} dari {daftar.length}
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<Badge nada="hijau">Tanpa batas waktu</Badge>
						{tamu && <Badge nada="kuning">Mode tamu</Badge>}
						{simpan && (
							<Button
								varian="kedua"
								ukuran="sm"
								onClick={() => {
									perbaruiIndeks(indeks);
									navigate({ to: "/latihan" });
								}}
							>
								<Pause className="h-3 w-3" aria-hidden="true" />
								Jeda
							</Button>
						)}
					</div>
				</div>
				<div
					role="progressbar"
					aria-valuemin={1}
					aria-valuemax={daftar.length}
					aria-valuenow={indeks + 1}
					aria-label="Kemajuan sesi latihan"
					className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100"
				>
					<div
						className="h-full rounded-full bg-[#8b5cf6] transition-all"
						style={{ width: `${((indeks + 1) / daftar.length) * 100}%` }}
					/>
				</div>
			</Card>

			<Card className="p-5">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<h2 className="text-base font-bold text-slate-800">{aktif.teks}</h2>
					<TombolDengar teks={aktif.teks} label="Dengarkan soal" />
				</div>
				<MathRumus
					bagian={aktif.bagian}
					label={`Rumus soal ${indeks + 1}`}
					className="mt-3"
				/>
				<div className="mt-4">
					<VisualSoal soal={aktif} />
				</div>
				<p className="mt-3 text-[11px] text-slate-500">
					Audio tidak diputar otomatis. Tekan Dengarkan soal kapan saja,
					termasuk untuk mengulang.
				</p>
			</Card>

			{benarSaatIni && (
				<div className="flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-2">
						<CheckCircle2
							className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
							aria-hidden="true"
						/>
						<output className="block text-xs font-medium text-emerald-800">
							Benar. Jawaban {jawaban[aktif.id]?.nilai} tepat.
						</output>
					</div>
					<Button onClick={lanjut} className="w-full sm:w-auto">
						{indeks + 1 === daftar.length
							? "Lihat ringkasan sesi"
							: "Soal berikutnya"}
					</Button>
				</div>
			)}

			{salahSaatIni && (
				<div className="rounded-xl border border-rose-100 bg-rose-50/70 p-4">
					<div className="flex items-start gap-2">
						<AlertCircle
							className="mt-0.5 h-5 w-5 shrink-0 text-rose-500"
							aria-hidden="true"
						/>
						<div>
							<output className="block text-xs font-semibold text-rose-700">
								Jawaban salah. Ini umpan balik latihan, bukan penilaian final.
							</output>
							<p className="mt-0.5 text-[11px] text-slate-600">
								Minta petunjuk, coba lagi dengan cara lain, atau lewati soal.
							</p>
						</div>
					</div>
					<div className="mt-3 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
						<Button
							varian="kedua"
							ukuran="sm"
							onClick={mintaPetunjuk}
							disabled={petunjukKe >= maksPetunjuk}
						>
							{petunjukKe === 0 ? "Minta petunjuk" : "Petunjuk berikutnya"}
						</Button>
						<Button varian="halus" ukuran="sm" onClick={lewati}>
							Lewati soal
						</Button>
					</div>
					{petunjukKe > 0 && (
						<div className="mt-2 rounded-lg bg-white/80 p-3">
							<p className="text-[11px] font-semibold text-amber-700">
								Petunjuk {petunjukKe} dari {maksPetunjuk}
							</p>
							<p className="mt-1 text-xs leading-relaxed text-slate-700">
								{petunjuk(aktif, petunjukKe)}
							</p>
						</div>
					)}
				</div>
			)}

			{!benarSaatIni && (
				<Card className="p-5">
					<fieldset>
						<legend className="text-xs font-semibold text-slate-700">
							Cara menjawab
						</legend>
						<p className="mt-1 text-[11px] text-slate-500">
							Berganti cara tidak menghapus progres sesi. Jalur papan ketik
							selalu tersedia.
						</p>
						<div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
							{CARA.map((item) => (
								<button
									key={item.id}
									type="button"
									aria-pressed={cara === item.id}
									onClick={() => {
										setCara(item.id);
										setKonfirmasi(null);
										setPesan("");
									}}
									className={cn(
										"inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b5cf6]",
										cara === item.id
											? "border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]"
											: "border-slate-200 text-slate-600 hover:bg-slate-50",
									)}
								>
									<item.ikon className="h-3.5 w-3.5" aria-hidden="true" />
									{item.label}
								</button>
							))}
						</div>
					</fieldset>

					<div className="mt-4">
						{cara === "keyboard" && (
							<JalurKeyboard key={aktif.id} onKirim={kirim} />
						)}
						{cara === "suara" && (
							<JalurSuara
								key={aktif.id}
								onTerbaca={tanganiHasilTerbaca}
								onGantiJalur={gunakanKeyboard}
								onReset={batalkanPengenalan}
							/>
						)}
						{cara === "isyarat" && (
							<JalurIsyarat
								key={aktif.id}
								onTerbaca={tanganiHasilTerbaca}
								onGantiJalur={gunakanKeyboard}
								onReset={batalkanPengenalan}
							/>
						)}
						{cara === "tulisan" && (
							<JalurTulisan
								key={aktif.id}
								onTerbaca={tanganiHasilTerbaca}
								onGantiJalur={gunakanKeyboard}
								onReset={batalkanPengenalan}
							/>
						)}
					</div>

					{konfirmasi !== null && (
						<div className="mt-4 rounded-lg border border-purple-100 bg-purple-50/60 p-3">
							<output className="block sr-only">
								Terbaca {konfirmasi}. Konfirmasi apakah hasil pengenalan ini
								benar.
							</output>
							<p className="text-xs font-semibold text-slate-800">
								Terbaca{" "}
								<span className="text-base font-bold text-[#8b5cf6]">
									{konfirmasi}
								</span>
								. Benar?
							</p>
							<div className="mt-2 flex flex-wrap gap-2">
								<Button ukuran="sm" onClick={() => kirim(konfirmasi)}>
									Ya, benar
								</Button>
								<Button
									varian="kedua"
									ukuran="sm"
									onClick={() => {
										catatPenandaan({
											id: `tanda-${Date.now()}`,
											waktu: new Date().toISOString(),
											soalId: aktif.id,
											level,
											terbaca: konfirmasi ?? 0,
										});
										setKonfirmasi(null);
										setPesan(
											"Penandaan salah baca tercatat. Jawaban ini tidak dihitung salah; ulangi jawaban atau ganti cara.",
										);
									}}
								>
									Salah terbaca, ulangi
								</Button>
							</div>
							<p className="mt-2 text-[11px] text-slate-600">
								Hasil yang belum dikonfirmasi tidak dinilai.
							</p>
						</div>
					)}

					{pesan && (
						<output className="block mt-3 text-[11px] font-medium text-slate-600">
							{pesan}
						</output>
					)}
				</Card>
			)}

			<p className="pb-2 text-center text-[11px] text-slate-400">
				Hasil ini adalah <strong>umpan balik latihan</strong>, bukan penilaian
				final atau pengganti rapor guru.
			</p>
		</div>
	);
}

function RingkasanSesi({
	hasil,
	level,
	tamu,
	simpan,
	onUlangi,
}: {
	hasil: HasilSesi;
	level: number;
	tamu: boolean;
	simpan: boolean;
	onUlangi: () => void;
}) {
	const akurasi =
		hasil.total === 0 ? 0 : Math.round((hasil.benar / hasil.total) * 100);
	const levelBerikut = akurasi >= 80 && level < 6 ? level + 1 : null;

	return (
		<div className="mx-auto max-w-2xl space-y-4">
			<Card className="p-6">
				<div className="flex items-center gap-2">
					<CheckCircle2
						className="h-5 w-5 text-emerald-600"
						aria-hidden="true"
					/>
					<h1 className="text-base font-bold text-slate-800">
						Sesi latihan selesai
					</h1>
				</div>
				<p className="mt-1 text-xs text-slate-500">
					Ringkasan Level {level}. Tidak ada batas waktu yang dihitung.{" "}
					{hasil.petunjuk > 0
						? `Petunjuk dipakai ${hasil.petunjuk} kali.`
						: "Tanpa petunjuk."}
				</p>
				<div className="mt-4 grid grid-cols-3 gap-2 text-center sm:gap-3">
					<div className="rounded-lg bg-slate-50 p-3">
						<p className="text-[11px] text-slate-500">Soal dikerjakan</p>
						<p className="text-lg font-bold text-slate-800">{hasil.total}</p>
					</div>
					<div className="rounded-lg bg-emerald-50 p-3">
						<p className="text-[11px] text-emerald-700">Benar</p>
						<p className="text-lg font-bold text-emerald-700">{hasil.benar}</p>
					</div>
					<div className="rounded-lg bg-purple-50 p-3">
						<p className="text-[11px] text-purple-700">Akurasi</p>
						<p className="text-lg font-bold text-purple-700">{akurasi}%</p>
					</div>
				</div>
				{!simpan && (
					<p className="mt-3 rounded-lg bg-amber-50 p-2 text-[11px] text-amber-800">
						Mode tamu: progres dan riwayat tidak disimpan.
					</p>
				)}
			</Card>

			{hasil.soalSalah.length > 0 && (
				<Card className="p-5">
					<h2 className="text-xs font-bold text-slate-800">
						Soal yang perlu diulang
					</h2>
					<ul className="mt-2 space-y-1.5">
						{hasil.soalSalah.map((butir) => (
							<li
								key={butir.teks}
								className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px]"
							>
								<span className="text-slate-700">{butir.teks}</span>
								<span className="font-semibold text-slate-800">
									Jawaban: {butir.jawaban}
								</span>
							</li>
						))}
					</ul>
				</Card>
			)}

			<Card className="p-5">
				<div className="flex items-start gap-2">
					<Target
						className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5cf6]"
						aria-hidden="true"
					/>
					<div>
						<h2 className="text-xs font-bold text-slate-800">
							Saran berikutnya
						</h2>
						<p className="mt-1 text-[11px] leading-relaxed text-slate-600">
							{levelBerikut
								? `Akurasi di atas 80 persen. Lanjutkan ke Level ${levelBerikut} di peta materi.`
								: `Ulangi Level ${level} sekali lagi, lalu coba lagi saat sudah lebih yakin.`}
						</p>
					</div>
				</div>
			</Card>

			<div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
				{hasil.daftarSalah.length > 0 && (
					<Button onClick={onUlangi}>Ulangi soal yang salah</Button>
				)}
				<Link
					to="/materi"
					className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
				>
					Buka materi
				</Link>
				{tamu ? (
					<Link
						to="/masuk"
						className="inline-flex h-11 items-center justify-center rounded-lg bg-[#8b5cf6] px-4 text-sm font-semibold text-white shadow-xs hover:bg-purple-700"
					>
						Masuk untuk menyimpan progres
					</Link>
				) : (
					<Link
						to="/beranda"
						className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
					>
						Kembali ke beranda
					</Link>
				)}
			</div>

			<p className="pb-2 text-center text-[11px] text-slate-400">
				Hasil ini adalah <strong>umpan balik latihan</strong>, bukan penilaian
				final atau pengganti rapor guru.
			</p>
		</div>
	);
}
