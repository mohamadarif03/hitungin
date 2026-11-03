import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
	onGantiJalur: () => void;
};

/**
 * Jalur tulisan pada kanvas (S-26). Kanvas bisa dipakai sentuh maupun mouse dan
 * selalu ada tombol hapus berlabel. Pengenalan tulisan belum tersambung pada
 * versi ini, jadi hasil yang tidak terbaca ditampilkan apa adanya tanpa
 * dihitung salah (S-27).
 */
export function JalurTulisan({ onGantiJalur }: Props) {
	const kanvas = useRef<HTMLCanvasElement | null>(null);
	const menggambar = useRef(false);
	const [adaTulisan, setAdaTulisan] = useState(false);
	const [pesan, setPesan] = useState("");

	useEffect(() => {
		const elemen = kanvas.current;
		const konteks = elemen?.getContext("2d");
		if (!elemen || !konteks) return;
		konteks.fillStyle = "#ffffff";
		konteks.fillRect(0, 0, elemen.width, elemen.height);
		konteks.lineWidth = 10;
		konteks.lineCap = "round";
		konteks.lineJoin = "round";
		konteks.strokeStyle = "#1e293b";
	}, []);

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

	function hapus() {
		const elemen = kanvas.current;
		const konteks = elemen?.getContext("2d");
		if (!elemen || !konteks) return;
		konteks.fillStyle = "#ffffff";
		konteks.fillRect(0, 0, elemen.width, elemen.height);
		setAdaTulisan(false);
		setPesan("");
	}

	function periksa() {
		if (!adaTulisan) {
			setPesan("Kanvas masih kosong. Tulis satu angka terlebih dahulu.");
			return;
		}
		setPesan(
			"Tulisan belum terbaca. Jawaban tidak dinilai. Gunakan papan ketik untuk mengirim jawaban.",
		);
	}

	return (
		<div className="space-y-2">
			<p id="bantuan-kanvas" className="text-[11px] text-slate-500">
				Tulis satu angka pada kotak di bawah. Bisa memakai jari atau mouse.
			</p>
			<canvas
				ref={kanvas}
				width={600}
				height={240}
				role="img"
				aria-label="Kanvas untuk menulis jawaban angka"
				aria-describedby="bantuan-kanvas"
				onPointerDown={mulai}
				onPointerMove={gambar}
				onPointerUp={berhenti}
				onPointerLeave={berhenti}
				className="h-auto w-full cursor-crosshair touch-none rounded-lg border border-dashed border-slate-300 bg-white"
			/>
			<div className="flex flex-wrap gap-2">
				<Button varian="kedua" ukuran="sm" onClick={hapus}>
					Hapus tulisan
				</Button>
				<Button ukuran="sm" onClick={periksa}>
					Periksa tulisan
				</Button>
				<Button varian="halus" ukuran="sm" onClick={onGantiJalur}>
					Pakai papan ketik
				</Button>
			</div>
			{pesan && (
				<output className="block text-[11px] leading-relaxed font-medium text-slate-600">
					{pesan}
				</output>
			)}
		</div>
	);
}
