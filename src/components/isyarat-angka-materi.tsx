import { Hand, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useState } from "react";
import { PANDUAN_ISYARAT } from "@/components/latihan/jalur-isyarat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Komponen materi isyarat angka 0-9 (S-15).
 * Menyediakan animasi/demonstrasi isyarat angka 0-9 BISINDO & SIBI,
 * disertai teks padanan dan dapat dijeda/diputar (Pause/Play).
 */
export function IsyaratAngkaMateri() {
	const [indeks, setIndeks] = useState(0);
	const [otomatisPutar, setOtomatisPutar] = useState(false);
	const [sumberIsyarat, setSumberIsyarat] = useState<"BISINDO" | "SIBI">(
		"BISINDO",
	);

	const aktif = PANDUAN_ISYARAT[indeks] ?? PANDUAN_ISYARAT[0];

	// Otomatis putar berjangka jika siswa mengaktifkan putar animasi
	useEffect(() => {
		if (!otomatisPutar) return;
		const timer = setInterval(() => {
			setIndeks((prev) => (prev + 1) % PANDUAN_ISYARAT.length);
		}, 3000);
		return () => clearInterval(timer);
	}, [otomatisPutar]);

	return (
		<Card className="p-5">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Hand className="h-4 w-4 text-[#8b5cf6]" aria-hidden="true" />
					<h2 className="text-sm font-bold text-slate-800">
						Belajar Isyarat Angka 0–9 (S-15)
					</h2>
				</div>
				<div className="flex items-center gap-1.5">
					<Badge nada="ungu">Akses Siswa Tuli</Badge>
					<button
						type="button"
						onClick={() =>
							setSumberIsyarat((s) => (s === "BISINDO" ? "SIBI" : "BISINDO"))
						}
						className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
					>
						Sumber: <strong className="text-purple-700">{sumberIsyarat}</strong>
					</button>
				</div>
			</div>

			<p className="mt-1 text-xs leading-relaxed text-slate-600">
				Setiap bilangan 0 sampai 9 memiliki bentuk isyarat tangan standar{" "}
				<strong>{sumberIsyarat}</strong> (Bahasa Isyarat Indonesia). Gerakan ini
				dapat dipelajari dan dijeda kapan saja.
			</p>

			{/* Tampilan Visual Kartu Isyarat */}
			<div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
				<div className="flex flex-col items-center justify-center rounded-xl border border-purple-200 bg-gradient-to-b from-purple-50/80 to-purple-100/50 p-6 text-center shadow-xs">
					<span className="text-6xl font-black tracking-tight text-[#8b5cf6]">
						{aktif.angka}
					</span>
					<span className="mt-1 text-sm font-bold text-slate-800">
						Angka {aktif.label}
					</span>
					<span className="mt-2 inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 shadow-2xs">
						{aktif.jari}
					</span>
				</div>

				<div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-4">
					<div>
						<output className="block text-[11px] font-bold text-purple-600 uppercase tracking-wider">
							Panduan Gerakan Isyarat:
						</output>
						<p className="mt-1 text-sm font-bold text-slate-800">
							{aktif.deskripsi}
						</p>

						<div className="mt-3 rounded-lg bg-white p-3 border border-slate-200">
							<p className="text-[11px] font-semibold text-slate-600">
								Tips mempraktikkan di depan kamera (S-25):
							</p>
							<p className="mt-0.5 text-[11px] text-slate-500">
								Pastikan telapak tangan tegak menghadap kamera dan semua jari
								yang membentuk angka tidak terhalang bayangan.
							</p>
						</div>
					</div>

					{/* Tombol Kontrol Animasi / Step (Play/Pause/Prev/Next) */}
					<div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 pt-3">
						<div className="flex items-center gap-1.5">
							<Button
								ukuran="sm"
								varian="kedua"
								onClick={() =>
									setIndeks(
										(prev) =>
											(prev - 1 + PANDUAN_ISYARAT.length) %
											PANDUAN_ISYARAT.length,
									)
								}
								aria-label="Isyarat sebelumnya"
							>
								<SkipBack className="h-3.5 w-3.5" />
							</Button>
							<Button
								ukuran="sm"
								onClick={() => setOtomatisPutar((p) => !p)}
								aria-pressed={otomatisPutar}
							>
								{otomatisPutar ? (
									<>
										<Pause className="mr-1.5 h-3.5 w-3.5" />
										Jeda animasi
									</>
								) : (
									<>
										<Play className="mr-1.5 h-3.5 w-3.5" />
										Putar animasi
									</>
								)}
							</Button>
							<Button
								ukuran="sm"
								varian="kedua"
								onClick={() =>
									setIndeks((prev) => (prev + 1) % PANDUAN_ISYARAT.length)
								}
								aria-label="Isyarat berikutnya"
							>
								<SkipForward className="h-3.5 w-3.5" />
							</Button>
						</div>

						<span className="text-[11px] font-semibold text-slate-500">
							Angka {indeks + 1} dari {PANDUAN_ISYARAT.length}
						</span>
					</div>
				</div>
			</div>

			{/* Bilah Pilihan Angka 0 - 9 */}
			<div className="mt-4 flex flex-wrap gap-1.5">
				{PANDUAN_ISYARAT.map((item, idx) => (
					<button
						key={item.angka}
						type="button"
						onClick={() => {
							setIndeks(idx);
							setOtomatisPutar(false);
						}}
						aria-pressed={indeks === idx}
						className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition-all ${
							indeks === idx
								? "border-[#8b5cf6] bg-purple-600 text-white shadow-xs"
								: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
						}`}
					>
						{item.angka}
					</button>
				))}
			</div>
		</Card>
	);
}
