import { Mic, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Pengenalan suara memakai Web Speech API bawaan browser + Web Audio API untuk deteksi sinyal suara.
 * Rekaman dikirim ke layanan browser saat siswa menekan Mulai rekam, dan tidak disimpan aplikasi (N-40, N-42).
 * Bila layanan gagal atau tidak tersedia, siswa diberi pesan jelas dan pilihan jalur lain (S-24, S-31).
 */
type HasilPengenal = {
	resultIndex: number;
	results: {
		length: number;
		[index: number]: {
			isFinal: boolean;
			[index: number]: { transcript: string };
		};
	};
};

type PengenalSuara = {
	lang: string;
	continuous: boolean;
	interimResults: boolean;
	start: () => void;
	stop: () => void;
	abort: () => void;
	onresult: ((peristiwa: HasilPengenal) => void) | null;
	onerror: ((peristiwa: { error: string; message?: string }) => void) | null;
	onend: (() => void) | null;
};

type KonstruktorPengenal = new () => PengenalSuara;

/**
 * Mengubah transkripsi bahasa Indonesia menjadi angka (0-100).
 * Contoh: "tiga puluh lima" -> 35, "tiga lima" -> 35, "dua belas" -> 12, "sepuluh" -> 10, "seratus" -> 100.
 */
export function ambilAngka(transkrip: string): number | null {
	if (!transkrip) return null;
	const bersih = transkrip.toLowerCase().trim();

	// 1. Jika sudah ada digit langsung berupa angka
	const matchDigit = bersih.match(/\b\d+\b/);
	if (matchDigit) {
		const parsed = Number.parseInt(matchDigit[0], 10);
		if (!Number.isNaN(parsed)) return parsed;
	}

	const KATA_DASAR: Record<string, number> = {
		nol: 0,
		kosong: 0,
		satu: 1,
		dua: 2,
		tiga: 3,
		empat: 4,
		lima: 5,
		enam: 6,
		tujuh: 7,
		delapan: 8,
		sembilan: 9,
	};

	const KATA_KHUSUS: Record<string, number> = {
		sepuluh: 10,
		sebelas: 11,
		seratus: 100,
	};

	const kata = bersih
		.replace(/[^a-z0-9\s]/g, " ")
		.split(/\s+/)
		.filter(Boolean);

	if (kata.length === 0) return null;

	// Cek kata tunggal khusus
	if (kata.length === 1 && KATA_KHUSUS[kata[0]] !== undefined) {
		return KATA_KHUSUS[kata[0]];
	}

	// Aturan pembentukan bilangan Bahasa Indonesia (0-100)
	let total = 0;
	let parsed = false;

	for (let i = 0; i < kata.length; i++) {
		const k = kata[i];

		if (k === "seratus") {
			total += 100;
			parsed = true;
			continue;
		}

		if (k === "sepuluh") {
			total += 10;
			parsed = true;
			continue;
		}

		if (k === "sebelas") {
			total += 11;
			parsed = true;
			continue;
		}

		if (k === "belas") {
			if (total > 0 && total < 10) {
				total = 10 + total;
				parsed = true;
			}
			continue;
		}

		if (k === "puluh") {
			if (total > 0 && total < 10) {
				total = total * 10;
				parsed = true;
			}
			continue;
		}

		if (KATA_DASAR[k] !== undefined) {
			const n = KATA_DASAR[k];
			if (total === 0 && !parsed) {
				total = n;
				parsed = true;
			} else if (total >= 10 && total % 10 === 0) {
				// misalnya "dua puluh" (20) diikuti "lima" (5) -> 25
				total += n;
			} else {
				// sebutan digit berurutan: "tiga" (3) lalu "lima" (5) -> 35
				total = Number.parseInt(`${total}${n}`, 10);
			}
		}
	}

	if (parsed) return total;

	// Fallback deretan angka apa pun yang tersisa
	const deretDigit = bersih.match(/\d+/g);
	if (deretDigit && deretDigit.length > 0) {
		return Number.parseInt(deretDigit.join(""), 10);
	}

	return null;
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
		"izin" | "merekam" | "memproses" | "terdeteksi" | "gagal"
	>("izin");
	const [pesan, setPesan] = useState("");
	const [transkrip, setTranskrip] = useState("");
	const [angkaTerdeteksi, setAngkaTerdeteksi] = useState<number | null>(null);
	const [volumeSuara, setVolumeSuara] = useState(0);

	const pengenal = useRef<PengenalSuara | null>(null);
	const audioStream = useRef<MediaStream | null>(null);
	const audioCtx = useRef<AudioContext | null>(null);
	const animId = useRef<number | null>(null);

	// Bersihkan sumber daya audio dan perekam saat komponen dibongkar
	useEffect(() => {
		return () => {
			hentikanAudioMeter();
			try {
				pengenal.current?.abort();
			} catch {}
			pengenal.current = null;
		};
	}, []);

	function hentikanAudioMeter() {
		if (animId.current) {
			cancelAnimationFrame(animId.current);
			animId.current = null;
		}
		if (audioStream.current) {
			for (const trek of audioStream.current.getTracks()) trek.stop();
			audioStream.current = null;
		}
		if (audioCtx.current && audioCtx.current.state !== "closed") {
			audioCtx.current.close().catch(() => {});
			audioCtx.current = null;
		}
		setVolumeSuara(0);
	}

	async function mulaiAudioMeter() {
		try {
			if (navigator?.mediaDevices?.getUserMedia) {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
				audioStream.current = stream;

				const AudioContextClass =
					window.AudioContext ||
					(window as unknown as { webkitAudioContext: typeof AudioContext })
						.webkitAudioContext;
				if (AudioContextClass) {
					const ctx = new AudioContextClass();
					audioCtx.current = ctx;
					const sumber = ctx.createMediaStreamSource(stream);
					const analyser = ctx.createAnalyser();
					analyser.fftSize = 256;
					sumber.connect(analyser);

					const dataArray = new Uint8Array(analyser.frequencyBinCount);
					const ukur = () => {
						analyser.getByteFrequencyData(dataArray);
						let jumlah = 0;
						for (let i = 0; i < dataArray.length; i++) {
							jumlah += dataArray[i];
						}
						const rerata = jumlah / dataArray.length;
						// Skala 0 - 100
						const tingkat = Math.min(100, Math.round((rerata / 128) * 100));
						setVolumeSuara(tingkat);
						animId.current = requestAnimationFrame(ukur);
					};
					ukur();
				}
			}
		} catch {
			// Izin mikrofon via getUserMedia opsional, SpeechRecognition mungkin masih jalan mandiri
		}
	}

	function mulai() {
		const Konstruktor = ambilPengenal();
		setTranskrip("");
		setAngkaTerdeteksi(null);
		setPesan("");

		mulaiAudioMeter();

		if (!Konstruktor) {
			setTahap("gagal");
			setPesan(
				"Browser ini tidak menyediakan Web Speech API. Kamu bisa memilih angka di bawah atau ganti ke papan ketik.",
			);
			return;
		}

		try {
			const alat = new Konstruktor();
			alat.lang = "id-ID";
			alat.continuous = true;
			alat.interimResults = true;

			alat.onresult = (peristiwa) => {
				let hasilTeks = "";
				for (let i = peristiwa.resultIndex; i < peristiwa.results.length; i++) {
					const bagian = peristiwa.results[i]?.[0]?.transcript ?? "";
					hasilTeks += ` ${bagian}`;
				}
				hasilTeks = hasilTeks.trim();
				if (hasilTeks) {
					setTranskrip(hasilTeks);
					const angka = ambilAngka(hasilTeks);
					if (angka !== null) {
						setAngkaTerdeteksi(angka);
						setTahap("terdeteksi");
						setPesan(`Suara terdeteksi: "${hasilTeks}" (Angka: ${angka})`);
					}
				}
			};

			alat.onerror = (peristiwa) => {
				hentikanAudioMeter();
				setTahap("gagal");
				if (
					peristiwa.error === "not-allowed" ||
					peristiwa.error === "service-not-allowed"
				) {
					setPesan(
						"Izin mikrofon ditolak atau dibatasi. Kamu bisa menjawab dengan papan ketik atau tulisan.",
					);
				} else if (peristiwa.error === "no-speech") {
					setPesan(
						"Belum ada suara yang terdengar. Coba bicara lebih dekat ke mikrofon atau coba lagi.",
					);
				} else {
					setPesan(
						"Layanan suara browser sedang mengalami gangguan. Gunakan tombol angka di bawah atau papan ketik.",
					);
				}
			};

			alat.onend = () => {
				hentikanAudioMeter();
				setTahap((sebelum) => (sebelum === "merekam" ? "izin" : sebelum));
			};

			pengenal.current = alat;
			alat.start();
			setTahap("merekam");
			setPesan("Mikrofon aktif. Sebutkan angka jawabanmu sekarang...");
		} catch {
			hentikanAudioMeter();
			setTahap("gagal");
			setPesan(
				"Mikrofon belum dapat dinyalakan. Coba lagi atau gunakan papan ketik.",
			);
		}
	}

	function selesai() {
		hentikanAudioMeter();
		try {
			pengenal.current?.stop();
		} catch {}

		if (angkaTerdeteksi !== null) {
			setTahap("memproses");
			onTerbaca(angkaTerdeteksi);
		} else if (transkrip) {
			const angka = ambilAngka(transkrip);
			if (angka !== null) {
				setTahap("memproses");
				onTerbaca(angka);
			} else {
				setTahap("gagal");
				setPesan(
					`Terdengar "${transkrip}", namun belum terdeteksi sebagai angka. Coba sebutkan lagi seperti "lima belas" atau "tiga puluh lima".`,
				);
			}
		} else {
			setTahap("gagal");
			setPesan(
				"Belum ada suara yang terdeteksi. Silakan coba lagi atau gunakan papan ketik.",
			);
		}
	}

	function kirimAngkaLangsung(n: number) {
		hentikanAudioMeter();
		try {
			pengenal.current?.stop();
		} catch {}
		setTahap("memproses");
		onTerbaca(n);
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
						merekam, suara diproses langsung di browser untuk diubah menjadi
						angka. HITUNGIN tidak menyimpan rekaman suara; hanya angka hasil
						yang akan dicatat.
					</p>
					<div className="mt-3 flex flex-wrap gap-2">
						<Button ukuran="sm" onClick={mulai}>
							<Mic className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
							Mulai rekam suara
						</Button>
						<Button varian="kedua" ukuran="sm" onClick={onGantiJalur}>
							Jangan rekam, pakai papan ketik
						</Button>
					</div>
				</div>
			)}

			{tahap === "merekam" && (
				<div className="rounded-lg border border-purple-200 bg-purple-50/70 p-4">
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<span className="relative flex h-3 w-3">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
								<span className="relative inline-flex h-3 w-3 rounded-full bg-purple-600" />
							</span>
							<p className="text-xs font-bold text-purple-900">
								Sedang mendengarkan... Sebutkan angkanya!
							</p>
						</div>
						<div
							className="flex items-center gap-1"
							aria-label={`Indikator volume suara: ${volumeSuara}%`}
						>
							<Volume2 className="h-3.5 w-3.5 text-purple-600" />
							<div className="h-2 w-16 overflow-hidden rounded-full bg-purple-200">
								<div
									className="h-full bg-purple-600 transition-all duration-75"
									style={{ width: `${Math.max(8, volumeSuara)}%` }}
								/>
							</div>
						</div>
					</div>

					<p className="mt-2 text-[11px] text-slate-600">
						Contoh: ucapkan &quot;tiga puluh lima&quot;, &quot;tiga lima&quot;,
						atau &quot;sepuluh&quot;.
					</p>

					{transkrip && (
						<div className="mt-2 rounded-md bg-white p-2.5 shadow-xs border border-purple-100">
							<p className="text-[11px] font-semibold text-slate-500">
								Kata yang terdengar:
							</p>
							<p className="text-sm font-bold text-purple-700">
								&quot;{transkrip}&quot;
							</p>
						</div>
					)}

					{angkaTerdeteksi !== null && (
						<div className="mt-2 flex items-center justify-between rounded-md bg-emerald-50 p-2.5 border border-emerald-200">
							<span className="text-xs font-semibold text-emerald-800">
								Terdeteksi angka:{" "}
								<strong className="text-base text-emerald-700">
									{angkaTerdeteksi}
								</strong>
							</span>
							<Button ukuran="sm" onClick={selesai}>
								Gunakan {angkaTerdeteksi}
							</Button>
						</div>
					)}

					<div className="mt-3 flex flex-wrap gap-2">
						<Button ukuran="sm" onClick={selesai}>
							Selesai merekam
						</Button>
						<Button
							varian="kedua"
							ukuran="sm"
							onClick={() => {
								hentikanAudioMeter();
								try {
									pengenal.current?.abort();
								} catch {}
								setTahap("izin");
								setPesan("Perekaman suara dibatalkan.");
							}}
						>
							Batalkan
						</Button>
					</div>
				</div>
			)}

			{tahap === "terdeteksi" && (
				<div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
					<p className="text-xs font-bold text-emerald-800">
						Suara berhasil terdeteksi sebagai angka: {angkaTerdeteksi}
					</p>
					<p className="mt-1 text-[11px] text-slate-600">
						Tekan tombol di bawah untuk mengirim ke konfirmasi jawaban.
					</p>
					<div className="mt-2 flex flex-wrap gap-2">
						<Button
							ukuran="sm"
							onClick={() => {
								if (angkaTerdeteksi !== null) {
									setTahap("memproses");
									onTerbaca(angkaTerdeteksi);
								}
							}}
						>
							Kirim angka {angkaTerdeteksi}
						</Button>
						<Button varian="kedua" ukuran="sm" onClick={mulai}>
							Ucapkan ulang
						</Button>
					</div>
				</div>
			)}

			{tahap === "memproses" && (
				<output className="block rounded-lg bg-slate-50 p-3 text-xs font-medium text-slate-600">
					Memeriksa hasil rekaman suara...
				</output>
			)}

			{tahap === "gagal" && (
				<div className="rounded-lg border border-rose-100 bg-rose-50/70 p-3 space-y-2">
					<p className="text-xs font-semibold text-rose-700">{pesan}</p>
					<p className="text-[11px] text-slate-600">
						Jika perangkat tidak mendukung pengenalan suara otomatis, kamu bisa
						langsung memilih simulasi angka di bawah atau berganti ke papan
						ketik:
					</p>
					<div className="flex flex-wrap gap-1.5 pt-1">
						{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 35].map(
							(val) => (
								<button
									key={val}
									type="button"
									onClick={() => kirimAngkaLangsung(val)}
									className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 hover:border-purple-400 hover:bg-purple-50"
								>
									{val}
								</button>
							),
						)}
					</div>
					<div className="mt-3 flex flex-wrap gap-2">
						<Button ukuran="sm" varian="kedua" onClick={mulai}>
							Coba rekam lagi
						</Button>
						<Button ukuran="sm" onClick={onGantiJalur}>
							Ganti ke papan ketik
						</Button>
					</div>
				</div>
			)}

			{pesan && tahap !== "gagal" && tahap !== "merekam" && (
				<output className="block text-[11px] text-slate-500">{pesan}</output>
			)}
		</div>
	);
}
