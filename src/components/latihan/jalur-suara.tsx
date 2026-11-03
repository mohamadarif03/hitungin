import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Pengenalan suara memakai Web Speech API bawaan browser. Rekaman dikirim ke
 * layanan browser saat siswa menekan Mulai rekam, dan tidak disimpan aplikasi
 * (N-40, N-42). Bila layanan gagal, siswa diberi pesan dan pilihan jalur lain
 * (S-24, S-31).
 */
type HasilPengenal = { results: ArrayLike<ArrayLike<{ transcript: string }>> };

type PengenalSuara = {
	lang: string;
	continuous: boolean;
	interimResults: boolean;
	start: () => void;
	stop: () => void;
	onresult: ((peristiwa: HasilPengenal) => void) | null;
	onerror: ((peristiwa: { error: string }) => void) | null;
	onend: (() => void) | null;
};

type KonstruktorPengenal = new () => PengenalSuara;

const KATA_ANGKA: Record<string, string> = {
	nol: "0",
	kosong: "0",
	satu: "1",
	dua: "2",
	tiga: "3",
	empat: "4",
	lima: "5",
	enam: "6",
	tujuh: "7",
	delapan: "8",
	sembilan: "9",
};

/** Mengubah transkripsi menjadi angka, contoh "3 5" atau "tiga lima" menjadi 35. */
export function ambilAngka(transkrip: string): number | null {
	const deretDigit = transkrip.match(/\d+/g);
	if (deretDigit && deretDigit.length > 0) {
		return Number.parseInt(deretDigit.join(""), 10);
	}
	const kata = transkrip
		.toLowerCase()
		.replace(/[^a-z\s]/g, " ")
		.split(/\s+/)
		.filter(Boolean)
		.map((potongan) => KATA_ANGKA[potongan])
		.filter(Boolean);
	if (kata.length === 0) return null;
	return Number.parseInt(kata.join(""), 10);
}

function ambilPengenal(): KonstruktorPengenal | null {
	if (typeof window === "undefined") return null;
	const jendela = window as unknown as {
		SpeechRecognition?: KonstruktorPengenal;
		webkitSpeechRecognition?: KonstruktorPengenal;
	};
	return jendela.SpeechRecognition ?? jendela.webkitSpeechRecognition ?? null;
}

type Props = {
	onTerbaca: (nilai: number) => void;
	onGantiJalur: () => void;
};

export function JalurSuara({ onTerbaca, onGantiJalur }: Props) {
	const [tahap, setTahap] = useState<
		"izin" | "merekam" | "memproses" | "gagal"
	>("izin");
	const [pesan, setPesan] = useState("");
	const pengenal = useRef<PengenalSuara | null>(null);

	useEffect(() => {
		return () => {
			pengenal.current?.stop();
			pengenal.current = null;
		};
	}, []);

	function mulai() {
		const Konstruktor = ambilPengenal();
		if (!Konstruktor) {
			setTahap("gagal");
			setPesan(
				"Browser ini belum mendukung pengenalan suara. Gunakan papan ketik atau tulisan untuk menjawab.",
			);
			return;
		}

		const alat = new Konstruktor();
		alat.lang = "id-ID";
		alat.continuous = false;
		alat.interimResults = false;
		alat.onresult = (peristiwa) => {
			const transkrip = Array.from(
				{ length: peristiwa.results.length },
				(_, urutan) => peristiwa.results[urutan]?.[0]?.transcript ?? "",
			).join(" ");
			const angka = ambilAngka(transkrip);
			if (angka === null) {
				setTahap("gagal");
				setPesan(
					"Suaramu belum terbaca sebagai angka. Coba lagi atau pakai jalur lain.",
				);
				return;
			}
			setTahap("memproses");
			onTerbaca(angka);
		};
		alat.onerror = (peristiwa) => {
			setTahap("gagal");
			setPesan(
				peristiwa.error === "not-allowed" ||
					peristiwa.error === "service-not-allowed"
					? "Izin mikrofon ditolak. Kamu masih bisa menjawab dengan papan ketik."
					: "Layanan pengenalan suara sedang tidak tersedia. Coba lagi atau ganti cara menjawab.",
			);
		};
		alat.onend = () => {
			setTahap((sebelumnya) =>
				sebelumnya === "merekam" ? "izin" : sebelumnya,
			);
		};

		pengenal.current = alat;
		try {
			alat.start();
			setPesan("");
			setTahap("merekam");
		} catch {
			setTahap("gagal");
			setPesan(
				"Mikrofon belum bisa dipakai. Coba lagi atau ganti cara menjawab.",
			);
		}
	}

	function selesai() {
		pengenal.current?.stop();
		setTahap("memproses");
		setPesan("Memproses rekaman…");
	}

	return (
		<div className="space-y-3">
			{tahap === "izin" && (
				<div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
					<p className="text-xs font-semibold text-slate-800">
						Sebelum merekam suara
					</p>
					<p className="mt-1 text-[11px] leading-relaxed text-slate-600">
						Rekaman hanya dimulai setelah kamu menekan Mulai rekam. Saat
						direkam, suara dikirim ke layanan pengenalan suara browser untuk
						diubah menjadi angka. HITUNGIN tidak menyimpan rekaman, yang dicatat
						hanya angka hasil pengenalan.
					</p>
					<div className="mt-2 flex flex-wrap gap-2">
						<Button ukuran="sm" onClick={mulai}>
							Mulai rekam
						</Button>
						<Button varian="kedua" ukuran="sm" onClick={onGantiJalur}>
							Jangan rekam, pakai papan ketik
						</Button>
					</div>
				</div>
			)}

			{tahap === "merekam" && (
				<div className="rounded-lg border border-purple-100 bg-purple-50/60 p-3">
					<p className="text-xs font-semibold text-slate-800">
						Sedang merekam. Sebut angkanya, lalu tekan Selesai.
					</p>
					<p className="mt-1 text-[11px] text-slate-600">
						Contoh: "tiga lima" untuk 35, atau "tiga puluh lima".
					</p>
					<div className="mt-2 flex flex-wrap gap-2">
						<Button ukuran="sm" onClick={selesai}>
							Selesai merekam
						</Button>
						<Button
							varian="kedua"
							ukuran="sm"
							onClick={() => {
								pengenal.current?.stop();
								setTahap("izin");
								setPesan("Rekaman dibatalkan. Tidak ada yang dinilai.");
							}}
						>
							Batalkan
						</Button>
					</div>
				</div>
			)}

			{tahap === "memproses" && (
				<output className="block text-xs font-medium text-slate-600">
					Memeriksa hasil rekaman…
				</output>
			)}

			{tahap === "gagal" && (
				<div className="rounded-lg border border-rose-100 bg-rose-50/60 p-3">
					<p className="text-xs font-semibold text-rose-700">{pesan}</p>
					<div className="mt-2 flex flex-wrap gap-2">
						<Button ukuran="sm" varian="kedua" onClick={mulai}>
							Coba lagi
						</Button>
						<Button ukuran="sm" onClick={onGantiJalur}>
							Ganti cara menjawab
						</Button>
					</div>
				</div>
			)}

			{pesan && tahap !== "gagal" && (
				<output className="block text-[11px] text-slate-500">{pesan}</output>
			)}
		</div>
	);
}
