import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
	onGantiJalur: () => void;
};

/**
 * Jalur isyarat angka (S-25). Kamera hanya dinyalakan setelah siswa menekan
 * tombol, dan gambar diproses di browser tanpa dikirim atau disimpan (N-41).
 * Model pengenalan isyarat belum tersambung pada versi ini, sehingga status dan
 * pemulihannya dibuat jelas: siswa diarahkan ke jalur lain yang selalu tersedia
 * (S-31, S-32).
 */
export function JalurIsyarat({ onGantiJalur }: Props) {
	const [tahap, setTahap] = useState<"panduan" | "aktif" | "gagal">("panduan");
	const [pesan, setPesan] = useState("");
	const video = useRef<HTMLVideoElement | null>(null);
	const aliran = useRef<MediaStream | null>(null);

	useEffect(() => {
		return () => {
			for (const trek of aliran.current?.getTracks() ?? []) trek.stop();
			aliran.current = null;
		};
	}, []);

	async function nyalakan() {
		if (
			typeof navigator === "undefined" ||
			!navigator.mediaDevices?.getUserMedia
		) {
			setTahap("gagal");
			setPesan(
				"Perangkat ini tidak menyediakan kamera. Pilih cara menjawab lain.",
			);
			return;
		}
		try {
			const media = await navigator.mediaDevices.getUserMedia({ video: true });
			aliran.current = media;
			setTahap("aktif");
			setPesan("");
			if (video.current) {
				video.current.srcObject = media;
				await video.current.play().catch(() => undefined);
			}
		} catch {
			setTahap("gagal");
			setPesan(
				"Kamera tidak dapat dinyalakan atau izin ditolak. Kamu masih bisa memakai jalur lain.",
			);
		}
	}

	function matikan() {
		for (const trek of aliran.current?.getTracks() ?? []) trek.stop();
		aliran.current = null;
		if (video.current) video.current.srcObject = null;
		setTahap("panduan");
	}

	return (
		<div className="space-y-3">
			{tahap === "panduan" && (
				<div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
					<p className="text-xs font-semibold text-slate-800">
						Panduan posisi tangan
					</p>
					<ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] leading-relaxed text-slate-600">
						<li>Hadapkan telapak tangan ke kamera, jari terlihat penuh.</li>
						<li>
							Jarak tangan sekitar 40 cm dari kamera, dengan cahaya cukup.
						</li>
						<li>Tunjukkan satu isyarat angka 0-9 untuk setiap jawaban.</li>
					</ul>
					<p className="mt-2 text-[11px] leading-relaxed text-slate-600">
						Gambar kamera diproses di browser dan tidak dikirim atau disimpan.
						Kamera baru menyala setelah kamu menekan Nyalakan kamera.
					</p>
					<div className="mt-2 flex flex-wrap gap-2">
						<Button ukuran="sm" onClick={nyalakan}>
							Nyalakan kamera
						</Button>
						<Button varian="kedua" ukuran="sm" onClick={onGantiJalur}>
							Jangan pakai kamera
						</Button>
					</div>
				</div>
			)}

			{tahap === "aktif" && (
				<div className="space-y-2">
					<div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
						<video
							ref={video}
							muted
							playsInline
							className="h-44 w-full object-cover"
							aria-label="Pratinjau kamera untuk isyarat angka"
						/>
					</div>
					<div className="rounded-lg border border-amber-100 bg-amber-50/60 p-3">
						<p className="text-xs font-semibold text-amber-800">
							Kamera aktif. Jawaban dari kamera belum bisa dinilai.
						</p>
						<p className="mt-1 text-[11px] text-slate-600">
							Kirim jawabanmu lewat papan ketik, tulisan, atau suara.
						</p>
						<div className="mt-2 flex flex-wrap gap-2">
							<Button ukuran="sm" onClick={onGantiJalur}>
								Ganti cara menjawab
							</Button>
							<Button varian="kedua" ukuran="sm" onClick={matikan}>
								Matikan kamera
							</Button>
						</div>
					</div>
				</div>
			)}

			{tahap === "gagal" && (
				<div className="rounded-lg border border-rose-100 bg-rose-50/60 p-3">
					<p className="text-xs font-semibold text-rose-700">{pesan}</p>
					<div className="mt-2 flex flex-wrap gap-2">
						<Button ukuran="sm" varian="kedua" onClick={nyalakan}>
							Coba lagi
						</Button>
						<Button ukuran="sm" onClick={onGantiJalur}>
							Ganti cara menjawab
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
