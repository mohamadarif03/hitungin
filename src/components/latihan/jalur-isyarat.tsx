import { Camera, Check, Hand, VideoOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
	onTerbaca: (nilai: number) => void;
	onGantiJalur: () => void;
};

/**
 * Panduan visual isyarat angka BISINDO & SIBI (0 - 9).
 * Sesuai PRD S-15 & S-25: Ada panduan posisi tangan dan contoh gerakan.
 */
export const PANDUAN_ISYARAT: {
	angka: number;
	label: string;
	deskripsi: string;
	jari: string;
}[] = [
	{
		angka: 0,
		label: "Nol",
		deskripsi: "Bentuk lingkaran O dengan jempol dan telunjuk.",
		jari: "Lingkaran O",
	},
	{
		angka: 1,
		label: "Satu",
		deskripsi: "Angkat jari telunjuk tegak ke atas.",
		jari: "Telunjuk tegak",
	},
	{
		angka: 2,
		label: "Dua",
		deskripsi: "Angkat telunjuk dan jari tengah (bentuk V).",
		jari: "Telunjuk & tengah (V)",
	},
	{
		angka: 3,
		label: "Tiga",
		deskripsi: "Angkat telunjuk, tengah, dan manis tegak lurus.",
		jari: "Tiga jari tegak",
	},
	{
		angka: 4,
		label: "Empat",
		deskripsi: "Buka empat jari (telunjuk sampai kelingking).",
		jari: "Empat jari tegak",
	},
	{
		angka: 5,
		label: "Lima",
		deskripsi: "Buka seluruh telapak tangan (kelima jari).",
		jari: "Lima jari terbuka",
	},
	{
		angka: 6,
		label: "Enam",
		deskripsi: "Tekuk jari kelingking, sentuh dengan jempol.",
		jari: "Jempol sentuh kelingking",
	},
	{
		angka: 7,
		label: "Tujuh",
		deskripsi: "Jempol menyentuh ujung jari manis.",
		jari: "Jempol sentuh manis",
	},
	{
		angka: 8,
		label: "Delapan",
		deskripsi: "Jempol menyentuh ujung jari tengah.",
		jari: "Jempol sentuh tengah",
	},
	{
		angka: 9,
		label: "Sembilan",
		deskripsi: "Jempol menyentuh ujung jari telunjuk.",
		jari: "Jempol sentuh telunjuk",
	},
];

/**
 * Jalur isyarat angka bersih (PRD S-25, N-41).
 * Menampilkan feed kamera yang bersih tanpa elemen yang menumpuk/mengganggu.
 * Siswa memperagakan isyarat tangan dan memilih angka yang ditunjukkan.
 */
export function JalurIsyarat({ onTerbaca, onGantiJalur }: Props) {
	const [tahap, setTahap] = useState<"panduan" | "aktif" | "gagal">("panduan");
	const [pesan, setPesan] = useState("");
	const [angkaTerpilih, setAngkaTerpilih] = useState<number | null>(null);
	const [kameraTersedia, setKameraTersedia] = useState(true);

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const aliranRef = useRef<MediaStream | null>(null);

	// Bersihkan stream saat unmount
	useEffect(() => {
		return () => {
			matikanStream();
		};
	}, []);

	function matikanStream() {
		if (aliranRef.current) {
			for (const trek of aliranRef.current.getTracks()) trek.stop();
			aliranRef.current = null;
		}
		if (videoRef.current) {
			videoRef.current.srcObject = null;
		}
	}

	const pasangVideoRef = useCallback((node: HTMLVideoElement | null) => {
		videoRef.current = node;
		if (node && aliranRef.current) {
			node.srcObject = aliranRef.current;
			node.play().catch(() => {});
		}
	}, []);

	async function nyalakan() {
		setPesan("");
		setAngkaTerpilih(null);

		if (!navigator.mediaDevices?.getUserMedia) {
			setKameraTersedia(false);
			setTahap("aktif");
			setPesan(
				"Kamera fisik tidak terdeteksi. Kamu tetap bisa memilih angka isyarat dari kartu di bawah.",
			);
			return;
		}

		try {
			const media = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: "user",
					width: { ideal: 640 },
					height: { ideal: 480 },
				},
			});
			aliranRef.current = media;
			setKameraTersedia(true);
			setTahap("aktif");

			if (videoRef.current) {
				videoRef.current.srcObject = media;
				await videoRef.current.play().catch(() => {});
			}
		} catch {
			setKameraTersedia(false);
			setTahap("aktif");
			setPesan(
				"Izin kamera belum diberikan atau kamera tidak aktif. Kamu dapat memilih angka isyarat di bawah atau beralih ke papan ketik.",
			);
		}
	}

	function matikan() {
		matikanStream();
		setTahap("panduan");
		setPesan("");
		setAngkaTerpilih(null);
	}

	function kirimAngka(angka: number) {
		matikanStream();
		onTerbaca(angka);
	}

	return (
		<div className="space-y-3">
			{tahap === "panduan" && (
				<div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
					<div className="flex items-center gap-2 text-slate-800">
						<Hand className="h-4 w-4 text-[#8b5cf6]" aria-hidden="true" />
						<p className="text-xs font-bold">
							Panduan Isyarat Angka (BISINDO & SIBI)
						</p>
					</div>

					<p className="mt-2 text-xs leading-relaxed text-slate-600">
						Peragakan isyarat angka dengan tanganmu ke kamera, lalu pilih angka
						yang kamu tunjukkan untuk konfirmasi jawaban.
					</p>

					{/* Tabel panduan isyarat 0 - 9 */}
					<div className="mt-3 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
						{PANDUAN_ISYARAT.map((item) => (
							<div
								key={item.angka}
								className="flex flex-col items-center rounded-lg border border-slate-200 bg-white p-1.5 text-center"
							>
								<span className="text-sm font-bold text-purple-700">
									{item.angka}
								</span>
								<span className="text-[10px] font-medium text-slate-500">
									{item.label}
								</span>
							</div>
						))}
					</div>

					<p className="mt-3 text-[11px] leading-relaxed text-slate-500">
						Privasi terjamin: Gambar kamera diproses langsung di browser dan{" "}
						<strong>tidak pernah dikirim atau disimpan</strong> di server.
					</p>

					<div className="mt-3 flex flex-wrap gap-2">
						<Button ukuran="sm" onClick={nyalakan}>
							<Camera className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
							Nyalakan kamera
						</Button>
						<Button varian="kedua" ukuran="sm" onClick={onGantiJalur}>
							Gunakan papan ketik
						</Button>
					</div>
				</div>
			)}

			{tahap === "aktif" && (
				<div className="space-y-3">
					{/* Area Kamera Bersih Tanpa Elemen yang Menumpuk */}
					<div className="relative h-[360px] sm:h-[420px] w-full overflow-hidden rounded-2xl border border-slate-300 bg-slate-900 shadow-md">
						{kameraTersedia ? (
							<video
								ref={pasangVideoRef}
								autoPlay
								playsInline
								muted
								className="h-full w-full object-cover -scale-x-100"
								aria-label="Tampilan kamera langsung"
							/>
						) : (
							<div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-slate-300">
								<Camera className="h-10 w-10 text-slate-500 mb-2" />
								<p className="text-sm font-bold text-white">Pratinjau Kamera</p>
								<p className="mt-1 text-xs text-slate-400 max-w-sm">
									Kamera tidak aktif atau tidak ditemukan. Pilih angka isyarat
									pada daftar di bawah.
								</p>
							</div>
						)}

						{/* Badge status minimalis di pojok kanan atas */}
						<div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
							<span
								className={`h-2 w-2 rounded-full ${
									kameraTersedia ? "bg-emerald-400" : "bg-amber-400"
								}`}
							/>
							<span>{kameraTersedia ? "Kamera Aktif" : "Mode Panduan"}</span>
						</div>
					</div>

					{/* Kontrol Isyarat Angka 0 - 9 */}
					<div className="rounded-xl border border-slate-200 bg-white p-4">
						<p className="text-xs font-bold text-slate-800">
							Pilih angka yang kamu peragakan:
						</p>
						<p className="mt-0.5 text-[11px] text-slate-500">
							Tunjukkan tanganmu di kamera, lalu tekan angka yang sesuai.
						</p>

						{/* Tombol Isyarat 0 - 9 */}
						<div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
							{PANDUAN_ISYARAT.map((item) => {
								const terpilih = angkaTerpilih === item.angka;
								return (
									<button
										key={item.angka}
										type="button"
										onClick={() => {
											setAngkaTerpilih(item.angka);
											setPesan(
												`Angka ${item.angka} (${item.label}) dipilih: ${item.deskripsi}`,
											);
										}}
										aria-pressed={terpilih}
										className={`flex flex-col items-center justify-center rounded-xl border p-2 transition-all ${
											terpilih
												? "border-[#8b5cf6] bg-purple-600 text-white font-bold shadow-sm"
												: "border-slate-200 bg-slate-50 text-slate-700 hover:border-purple-300 hover:bg-purple-50/50"
										}`}
									>
										<span className="text-base font-bold">{item.angka}</span>
										<span
											className={`text-[9px] ${
												terpilih ? "text-purple-100" : "text-slate-500"
											}`}
										>
											{item.label}
										</span>
									</button>
								);
							})}
						</div>

						{/* Konfirmasi kirim angka isyarat */}
						{angkaTerpilih !== null && (
							<div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-purple-50 p-3 border border-purple-200">
								<div>
									<p className="text-xs font-bold text-purple-900">
										Isyarat terpilih: Angka {angkaTerpilih} (
										{PANDUAN_ISYARAT[angkaTerpilih]?.label})
									</p>
									<p className="text-[11px] text-purple-700">
										{PANDUAN_ISYARAT[angkaTerpilih]?.deskripsi}
									</p>
								</div>
								<Button ukuran="sm" onClick={() => kirimAngka(angkaTerpilih)}>
									<Check className="mr-1 h-3.5 w-3.5" />
									Gunakan angka {angkaTerpilih}
								</Button>
							</div>
						)}

						<div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
							<Button varian="kedua" ukuran="sm" onClick={matikan}>
								<VideoOff className="mr-1.5 h-3.5 w-3.5" />
								Matikan kamera
							</Button>
							<Button varian="halus" ukuran="sm" onClick={onGantiJalur}>
								Ganti ke papan ketik
							</Button>
						</div>
					</div>
				</div>
			)}

			{tahap === "gagal" && (
				<div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3 space-y-2">
					<p className="text-xs font-semibold text-rose-700">{pesan}</p>
					<div className="flex flex-wrap gap-2">
						<Button ukuran="sm" varian="kedua" onClick={nyalakan}>
							Coba lagi
						</Button>
						<Button ukuran="sm" onClick={onGantiJalur}>
							Ganti ke papan ketik
						</Button>
					</div>
				</div>
			)}

			{pesan && tahap !== "gagal" && (
				<output className="block text-[11px] font-medium text-slate-600">
					{pesan}
				</output>
			)}
		</div>
	);
}
