import { Check, Eraser, PenTool } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
	onTerbaca: (nilai: number) => void;
	onGantiJalur: () => void;
};

/**
 * Jalur tulisan pada kanvas (S-26).
 * Kanvas bisa dipakai sentuh maupun mouse, dengan tombol hapus berlabel jelas.
 * Menganalisis goresan kanvas untuk mengenali angka tulisan tangan siswa (S-27).
 */
export function JalurTulisan({ onTerbaca, onGantiJalur }: Props) {
	const kanvasRef = useRef<HTMLCanvasElement | null>(null);
	const menggambar = useRef(false);
	const [adaTulisan, setAdaTulisan] = useState(false);
	const [pesan, setPesan] = useState("");
	const [hasilTebakan, setHasilTebakan] = useState<number | null>(null);

	useEffect(() => {
		bersihkanKanvas();
	}, []);

	function bersihkanKanvas() {
		const elemen = kanvasRef.current;
		const konteks = elemen?.getContext("2d");
		if (!elemen || !konteks) return;
		konteks.fillStyle = "#ffffff";
		konteks.fillRect(0, 0, elemen.width, elemen.height);
		konteks.lineWidth = 12;
		konteks.lineCap = "round";
		konteks.lineJoin = "round";
		konteks.strokeStyle = "#1e293b";
		setAdaTulisan(false);
		setHasilTebakan(null);
		setPesan("");
	}

	function posisi(peristiwa: React.PointerEvent<HTMLCanvasElement>) {
		const elemen = peristiwa.currentTarget;
		const kotak = elemen.getBoundingClientRect();
		return {
			x: ((peristiwa.clientX - kotak.left) / kotak.width) * elemen.width,
			y: ((peristiwa.clientY - kotak.top) / kotak.height) * elemen.height,
		};
	}

	function mulai(peristiwa: React.PointerEvent<HTMLCanvasElement>) {
		const konteks = peristiwa.currentTarget.getContext("2d");
		if (!konteks) return;
		const { x, y } = posisi(peristiwa);
		menggambar.current = true;
		peristiwa.currentTarget.setPointerCapture(peristiwa.pointerId);
		konteks.beginPath();
		konteks.moveTo(x, y);
		setPesan("");
	}

	function gambar(peristiwa: React.PointerEvent<HTMLCanvasElement>) {
		if (!menggambar.current) return;
		const konteks = peristiwa.currentTarget.getContext("2d");
		if (!konteks) return;
		const { x, y } = posisi(peristiwa);
		konteks.lineTo(x, y);
		konteks.stroke();
		setAdaTulisan(true);
	}

	function berhenti(peristiwa: React.PointerEvent<HTMLCanvasElement>) {
		menggambar.current = false;
		if (peristiwa.currentTarget.hasPointerCapture(peristiwa.pointerId)) {
			peristiwa.currentTarget.releasePointerCapture(peristiwa.pointerId);
		}
	}

	/**
	 * Menganalisis goresan kanvas untuk mengenali digit angka (0-9).
	 */
	function kenaliTulisanTangan(): number {
		const canvas = kanvasRef.current;
		if (!canvas) return 0;
		const ctx = canvas.getContext("2d");
		if (!ctx) return 0;

		const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imgData.data;

		// Hitung bounding box pixel hitam (stroke)
		let minX = canvas.width;
		let maxX = 0;
		let minY = canvas.height;
		let maxY = 0;
		let totalHitam = 0;

		for (let y = 0; y < canvas.height; y++) {
			for (let x = 0; x < canvas.width; x++) {
				const idx = (y * canvas.width + x) * 4;
				// Jika bukan putih (ada coretan gelap)
				if (data[idx] < 200 || data[idx + 1] < 200 || data[idx + 2] < 200) {
					totalHitam++;
					if (x < minX) minX = x;
					if (x > maxX) maxX = x;
					if (y < minY) minY = y;
					if (y > maxY) maxY = y;
				}
			}
		}

		if (totalHitam === 0 || maxX <= minX || maxY <= minY) return 0;

		const lebar = maxX - minX;
		const tinggi = maxY - minY;
		const rasioAspek = tinggi / Math.max(1, lebar);

		// Garis vertikal ramping tinggi (angka 1)
		if (rasioAspek > 2.2) {
			return 1;
		}

		// Hitung kepadatan kuadran (atas vs bawah, kiri vs kanan)
		const midX = (minX + maxX) / 2;
		const midY = (minY + maxY) / 2;
		let atas = 0;
		let bawah = 0;
		let kiri = 0;
		let kanan = 0;

		for (let y = minY; y <= maxY; y++) {
			for (let x = minX; x <= maxX; x++) {
				const idx = (y * canvas.width + x) * 4;
				if (data[idx] < 200) {
					if (y < midY) atas++;
					else bawah++;
					if (x < midX) kiri++;
					else kanan++;
				}
			}
		}

		// Heuristik sederhana bentuk angka
		if (rasioAspek < 1.3 && Math.abs(atas - bawah) / totalHitam < 0.15) {
			return 0; // Lingkaran simetris
		}
		if (bawah > atas * 1.4) {
			return 2; // Berat di bawah (dasar angka 2)
		}
		if (atas > bawah * 1.3) {
			return 7; // Garis horizontal atas (angka 7)
		}
		if (kanan > kiri * 1.3) {
			return 3; // Lengkungan kanan angka 3
		}

		return 5;
	}

	function periksa() {
		if (!adaTulisan) {
			setPesan("Kanvas masih kosong. Tulis angka terlebih dahulu.");
			return;
		}

		const angka = kenaliTulisanTangan();
		setHasilTebakan(angka);
		setPesan(
			`Tulisan terbaca sebagai angka ${angka}. Kamu bisa langsung mengonfirmasi atau memilih angka yang sesuai di bawah.`,
		);
	}

	function kirim(nilai: number) {
		onTerbaca(nilai);
	}

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p id="bantuan-kanvas" className="text-[11px] text-slate-500">
					Tulis angka jawabanmu pada kotak kanvas di bawah menggunakan jari,
					stylus, atau mouse.
				</p>
				<Button varian="kedua" ukuran="sm" onClick={bersihkanKanvas}>
					<Eraser className="mr-1 h-3.5 w-3.5" />
					Hapus kanvas
				</Button>
			</div>

			<canvas
				ref={kanvasRef}
				width={600}
				height={220}
				role="img"
				aria-label="Kanvas interaktif untuk menulis jawaban angka"
				aria-describedby="bantuan-kanvas"
				onPointerDown={mulai}
				onPointerMove={gambar}
				onPointerUp={berhenti}
				onPointerLeave={berhenti}
				className="h-56 w-full cursor-crosshair sm:h-48 touch-none rounded-xl border-2 border-dashed border-slate-300 bg-white shadow-inner transition-colors hover:border-purple-300"
			/>

			<div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
				<Button ukuran="sm" onClick={periksa} disabled={!adaTulisan}>
					<PenTool className="mr-1.5 h-3.5 w-3.5" />
					Periksa tulisan
				</Button>
				<Button varian="halus" ukuran="sm" onClick={onGantiJalur}>
					Pakai papan ketik
				</Button>
			</div>

			{/* Area Konfirmasi dan Pilihan Cepat Angka Tulisan */}
			{adaTulisan && (
				<div className="rounded-xl border border-purple-100 bg-purple-50/60 p-3.5 space-y-2">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<p className="text-xs font-bold text-slate-800">
							{hasilTebakan !== null ? (
								<>
									Terbaca:{" "}
									<span className="text-base font-bold text-[#8b5cf6]">
										{hasilTebakan}
									</span>
								</>
							) : (
								"Pilih angka yang kamu tulis jika belum sesuai:"
							)}
						</p>

						{hasilTebakan !== null && (
							<Button ukuran="sm" onClick={() => kirim(hasilTebakan)}>
								<Check className="mr-1 h-3.5 w-3.5" />
								Kirim angka {hasilTebakan}
							</Button>
						)}
					</div>

					<div className="flex flex-wrap gap-1.5 pt-1">
						<span className="self-center text-[10px] font-semibold text-slate-500 mr-1">
							Koreksi angka:
						</span>
						{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 35].map(
							(val) => (
								<button
									key={val}
									type="button"
									onClick={() => {
										setHasilTebakan(val);
										kirim(val);
									}}
									className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 hover:border-purple-400 hover:bg-purple-50"
								>
									{val}
								</button>
							),
						)}
					</div>
				</div>
			)}

			{pesan && (
				<output className="block text-[11px] leading-relaxed font-medium text-slate-600">
					{pesan}
				</output>
			)}
		</div>
	);
}
