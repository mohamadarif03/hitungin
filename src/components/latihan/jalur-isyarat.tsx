import {
	AlertCircle,
	Camera,
	Check,
	Hand,
	RefreshCw,
	Sparkles,
	VideoOff,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	classifyNumberGesture,
	ensureMediaPipeLoaded,
	type GestureResult,
	GestureStabilizer,
	type MediaPipeCameraInstance,
	type MediaPipeHandsInstance,
	type MediaPipeResults,
} from "@/lib/mediapipe-service";

type Props = {
	onTerbaca: (nilai: number) => void;
	onGantiJalur: () => void;
};

/**
 * Panduan visual isyarat angka BISINDO & SIBI (0 - 9).
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
		deskripsi:
			"Bentuk lingkaran O dengan jempol dan telunjuk atau kepalkan tangan.",
		jari: "Lingkaran O / Kepalan",
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
		deskripsi: "Jempol menyentuh kelingking (atau 5 + 1 jari).",
		jari: "Jempol sentuh kelingking",
	},
	{
		angka: 7,
		label: "Tujuh",
		deskripsi: "Jempol menyentuh jari manis (atau 5 + 2 jari).",
		jari: "Jempol sentuh manis",
	},
	{
		angka: 8,
		label: "Delapan",
		deskripsi: "Jempol menyentuh jari tengah (atau 5 + 3 jari).",
		jari: "Jempol sentuh tengah",
	},
	{
		angka: 9,
		label: "Sembilan",
		deskripsi: "Jempol menyentuh telunjuk (atau 5 + 4 jari).",
		jari: "Jempol sentuh telunjuk",
	},
	{
		angka: 10,
		label: "Sepuluh",
		deskripsi: "Buka kedua telapak tangan (5 jari kiri + 5 jari kanan).",
		jari: "5 kiri + 5 kanan",
	},
];

/**
 * Jalur isyarat angka dengan deteksi MediaPipe Hands real-time.
 * Menampilkan skeleton tangan (connectors & landmarks) di atas feed kamera mirrored.
 */
export function JalurIsyarat({ onTerbaca, onGantiJalur }: Props) {
	const [tahap, setTahap] = useState<"panduan" | "aktif" | "gagal">("panduan");
	const [pesan, setPesan] = useState("");
	const [angkaTerpilih, setAngkaTerpilih] = useState<number | null>(null);
	const [kameraTersedia, setKameraTersedia] = useState(true);
	const [loadingModel, setLoadingModel] = useState(false);
	const [handsDetected, setHandsDetected] = useState(false);
	const [gesturTerdeteksi, setGesturTerdeteksi] =
		useState<GestureResult | null>(null);

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const cameraInstanceRef = useRef<MediaPipeCameraInstance | null>(null);
	const handsInstanceRef = useRef<MediaPipeHandsInstance | null>(null);
	const stabilizerRef = useRef<GestureStabilizer>(new GestureStabilizer(8, 5));

	const hentikanKamera = useCallback(() => {
		try {
			if (cameraInstanceRef.current) {
				cameraInstanceRef.current.stop();
				cameraInstanceRef.current = null;
			}
		} catch {}

		try {
			if (handsInstanceRef.current) {
				handsInstanceRef.current.close();
				handsInstanceRef.current = null;
			}
		} catch {}

		if (videoRef.current?.srcObject) {
			const stream = videoRef.current.srcObject as MediaStream;
			for (const track of stream.getTracks()) track.stop();
			videoRef.current.srcObject = null;
		}

		stabilizerRef.current.reset();
		setHandsDetected(false);
		setGesturTerdeteksi(null);
	}, []);

	// Bersihkan kamera & instance MediaPipe saat unmount atau berpindah tahap
	useEffect(() => {
		return () => {
			hentikanKamera();
		};
	}, [hentikanKamera]);

	// Inisialisasi MediaPipe Hands + Camera saat tahap aktif
	useEffect(() => {
		if (tahap !== "aktif") return;

		let mounted = true;
		setLoadingModel(true);
		setPesan("Memuat model kecerdasan buatan...");

		async function inisialisasi() {
			const loaded = await ensureMediaPipeLoaded();
			if (!mounted) return;

			if (!loaded || !window.Hands || !window.Camera) {
				setLoadingModel(false);
				setPesan(
					"Kecerdasan buatan belum dapat dimuat. Anda tetap dapat memilih angka secara manual di bawah.",
				);
				return;
			}

			const videoElement = videoRef.current;
			const canvasElement = canvasRef.current;
			if (!videoElement || !canvasElement) return;

			const canvasCtx = canvasElement.getContext("2d");
			if (!canvasCtx) return;

			try {
				const hands = new window.Hands({
					locateFile: (file: string) =>
						`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
				});

				hands.setOptions({
					maxNumHands: 2,
					modelComplexity: 1,
					minDetectionConfidence: 0.55,
					minTrackingConfidence: 0.55,
				});

				hands.onResults((results: MediaPipeResults) => {
					if (!mounted || !canvasElement) return;

					// Sesuaikan ukuran resolusi canvas dengan video
					if (
						videoElement.videoWidth &&
						(canvasElement.width !== videoElement.videoWidth ||
							canvasElement.height !== videoElement.videoHeight)
					) {
						canvasElement.width = videoElement.videoWidth;
						canvasElement.height = videoElement.videoHeight;
					}

					canvasCtx.save();
					canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

					// Gambar frame kamera secara mirrored (efek cermin)
					canvasCtx.translate(canvasElement.width, 0);
					canvasCtx.scale(-1, 1);
					canvasCtx.drawImage(
						results.image,
						0,
						0,
						canvasElement.width,
						canvasElement.height,
					);

					if (
						results.multiHandLandmarks &&
						results.multiHandLandmarks.length > 0
					) {
						setHandsDetected(true);

						// Gambar skeleton tangan (connectors & landmarks)
						for (const landmarks of results.multiHandLandmarks) {
							if (window.drawConnectors && window.HAND_CONNECTIONS) {
								window.drawConnectors(
									canvasCtx,
									landmarks,
									window.HAND_CONNECTIONS,
									{
										color: "#8b5cf6",
										lineWidth: 3,
									},
								);
							}
							if (window.drawLandmarks) {
								window.drawLandmarks(canvasCtx, landmarks, {
									color: "#ec4899",
									lineWidth: 2,
									radius: 3,
								});
							}
						}

						// Klasifikasi angka dengan scoring pattern & temporal stabilizer
						const rawHasil = classifyNumberGesture(results.multiHandLandmarks);
						const { stableResult, isConfirmed } =
							stabilizerRef.current.update(rawHasil);

						if (stableResult) {
							setGesturTerdeteksi(stableResult);
							if (isConfirmed) {
								setAngkaTerpilih(stableResult.number);
								setPesan(`Terdeteksi stabil: ${stableResult.label}`);
							}
						}
					} else {
						setHandsDetected(false);
						stabilizerRef.current.reset();
						setGesturTerdeteksi(null);
					}

					canvasCtx.restore();
				});

				handsInstanceRef.current = hands;

				const camera = new window.Camera(videoElement, {
					onFrame: async () => {
						if (!mounted || !handsInstanceRef.current) return;
						await hands.send({ image: videoElement });
					},
					width: 640,
					height: 480,
				});

				cameraInstanceRef.current = camera;

				await camera.start();
				if (mounted) {
					setLoadingModel(false);
					setKameraTersedia(true);
					setPesan("Kamera dan pengenalan isyarat tangan aktif.");
				}
			} catch (err) {
				console.error("Gagal memulai kamera / MediaPipe:", err);
				if (mounted) {
					setLoadingModel(false);
					setKameraTersedia(false);
					setPesan(
						"Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser.",
					);
				}
			}
		}

		inisialisasi();

		return () => {
			mounted = false;
			hentikanKamera();
		};
	}, [tahap, hentikanKamera]);

	function nyalakan() {
		setPesan("");
		setAngkaTerpilih(null);
		setTahap("aktif");
	}

	function matikan() {
		hentikanKamera();
		setTahap("panduan");
		setPesan("");
		setAngkaTerpilih(null);
	}

	function kirimAngka(angka: number) {
		hentikanKamera();
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
						Peragakan isyarat angka dengan tanganmu ke kamera. Kamu dapat
						menggunakan <strong>satu tangan</strong> (isyarat BISINDO 0 - 9)
						atau <strong>penjumlahan dua tangan</strong> (misal 5 jari kiri + 2
						jari kanan = 7). MediaPipe akan mendeteksi posisi jari secara
						otomatis.
					</p>

					{/* Tabel panduan isyarat 0 - 10 */}
					<div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-11">
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
						Privasi terjamin: Pemrosesan MediaPipe berjalan 100% lokal di
						browser Anda dan <strong>tidak pernah dikirim ke server</strong>.
					</p>

					<div className="mt-3 flex flex-wrap gap-2">
						<Button ukuran="sm" onClick={nyalakan}>
							<Camera className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
							Nyalakan kamera & deteksi
						</Button>
						<Button varian="kedua" ukuran="sm" onClick={onGantiJalur}>
							Gunakan papan ketik
						</Button>
					</div>
				</div>
			)}

			{tahap === "aktif" && (
				<div className="space-y-3">
					{/* Area Kamera Bersih dengan Landmark Skeleton MediaPipe */}
					<div className="relative h-[360px] sm:h-[420px] w-full overflow-hidden rounded-2xl border border-slate-300 bg-slate-950 shadow-md">
						{/* Video elemen tersembunyi sebagai feed MediaPipe */}
						<video
							ref={videoRef}
							className="hidden"
							playsInline
							muted
							autoPlay
						/>

						{/* Canvas aktif menampilkan video mirrored + titik landmark */}
						<canvas
							ref={canvasRef}
							className="h-full w-full object-cover"
							aria-label="Tampilan kamera deteksi tangan"
						/>

						{/* State saat kamera tidak tersedia atau diblokir */}
						{!kameraTersedia && (
							<div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-300 bg-slate-900/90 backdrop-blur-xs">
								<Camera className="h-10 w-10 text-slate-500 mb-2" />
								<p className="text-sm font-bold text-white">Pratinjau Kamera</p>
								<p className="mt-1 text-xs text-slate-400 max-w-sm">
									Kamera tidak aktif atau izin belum diberikan. Silakan pilih
									angka isyarat secara manual pada tombol di bawah.
								</p>
							</div>
						)}

						{/* State saat loading model MediaPipe */}
						{loadingModel && (
							<div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs text-white">
								<RefreshCw className="h-8 w-8 animate-spin text-[#8b5cf6] mb-2" />
								<p className="text-xs font-semibold">
									Menyiapkan sensor MediaPipe Hands...
								</p>
								<p className="text-[10px] text-slate-400 mt-0.5">
									Mohon tunggu beberapa detik
								</p>
							</div>
						)}

						{/* Status badge di pojok kiri atas */}
						<div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md border border-white/10">
							<span
								className={`h-2 w-2 rounded-full ${
									handsDetected
										? "bg-emerald-400 animate-pulse"
										: "bg-amber-400"
								}`}
							/>
							<span>
								{handsDetected
									? "✋ Tangan Terdeteksi"
									: "Arahkan tangan ke kamera"}
							</span>
						</div>

						{/* Floating pill hasil pengenalan gestur di pojok kanan atas */}
						{gesturTerdeteksi && (
							<div
								className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white backdrop-blur-md shadow-lg animate-in fade-in ${
									gesturTerdeteksi.isTwoHands
										? "bg-indigo-900/90 border border-indigo-400/50"
										: "bg-purple-900/80 border border-purple-400/40"
								}`}
							>
								<Sparkles className="h-3.5 w-3.5 text-amber-300" />
								{gesturTerdeteksi.isTwoHands ? (
									<span>
										Penjumlahan: {gesturTerdeteksi.leftCount} (Kiri) +{" "}
										{gesturTerdeteksi.rightCount} (Kanan) ={" "}
										{gesturTerdeteksi.number}
									</span>
								) : (
									<span>Terdeteksi: Angka {gesturTerdeteksi.number}</span>
								)}
							</div>
						)}

						{/* Floating action pill di bagian bawah kamera jika terdeteksi */}
						{gesturTerdeteksi && (
							<div className="absolute bottom-4 inset-x-4 z-10 flex items-center justify-between gap-2 rounded-xl bg-slate-900/90 p-3 backdrop-blur-md border border-purple-500/30 text-white shadow-xl">
								<div className="flex items-center gap-2.5 min-w-0">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#8b5cf6] to-[#ec4899] text-base font-black text-white shadow">
										{gesturTerdeteksi.number}
									</div>
									<div className="truncate">
										<p className="text-xs font-bold text-purple-200 truncate">
											{gesturTerdeteksi.detail || gesturTerdeteksi.label}
										</p>
										<p className="text-[10px] text-slate-300 truncate">
											{gesturTerdeteksi.isTwoHands
												? `✋ Kiri (${gesturTerdeteksi.leftCount} jari) + 🤚 Kanan (${gesturTerdeteksi.rightCount} jari) = ${gesturTerdeteksi.number}`
												: `Kecocokan: ${(gesturTerdeteksi.confidence * 100).toFixed(0)}% (${gesturTerdeteksi.label})`}
										</p>
									</div>
								</div>
								<Button
									ukuran="sm"
									onClick={() => kirimAngka(gesturTerdeteksi.number)}
									className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
								>
									<Check className="mr-1 h-3.5 w-3.5" />
									Gunakan {gesturTerdeteksi.number}
								</Button>
							</div>
						)}
					</div>

					{/* Kontrol Isyarat Angka 0 - 10 */}
					<div className="rounded-xl border border-slate-200 bg-white p-4">
						<div className="flex items-center justify-between gap-2">
							<div>
								<p className="text-xs font-bold text-slate-800">
									Pilih angka yang kamu peragakan:
								</p>
								<p className="mt-0.5 text-[11px] text-slate-500">
									Tunjukkan satu atau dua tanganmu di kamera, atau langsung klik
									kartu di bawah.
								</p>
							</div>
							{angkaTerpilih !== null && (
								<span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-800">
									Angka {angkaTerpilih} aktif
								</span>
							)}
						</div>

						{/* Tombol Isyarat 0 - 10 */}
						<div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11">
							{PANDUAN_ISYARAT.map((item) => {
								const terpilih = angkaTerpilih === item.angka;
								const sedangTerdeteksi =
									gesturTerdeteksi?.number === item.angka;

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
										className={`relative flex flex-col items-center justify-center rounded-xl border p-2 transition-all ${
											terpilih
												? "border-[#8b5cf6] bg-purple-600 text-white font-bold shadow-sm"
												: sedangTerdeteksi
													? "border-purple-400 bg-purple-50 text-purple-900 ring-2 ring-purple-300"
													: "border-slate-200 bg-slate-50 text-slate-700 hover:border-purple-300 hover:bg-purple-50/50"
										}`}
									>
										{sedangTerdeteksi && !terpilih && (
											<span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-pink-500 text-[8px] text-white">
												✓
											</span>
										)}
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
					<div className="flex items-center gap-2 text-rose-700">
						<AlertCircle className="h-4 w-4" />
						<p className="text-xs font-semibold">{pesan}</p>
					</div>
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
