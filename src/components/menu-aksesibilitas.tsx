import { Accessibility, Sun, Type, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAksesibilitasStore } from "@/datas/stores/aksesibilitas-store";
import { ucapkan } from "@/lib/ucapkan";

export function MenuAksesibilitas() {
	const [terbuka, setTerbuka] = useState(false);
	const ukuranTeks = useAksesibilitasStore((state) => state.ukuranTeks);
	const kontrasTinggi = useAksesibilitasStore((state) => state.kontrasTinggi);
	const suaraOtomatis = useAksesibilitasStore((state) => state.suaraOtomatis);
	const setUkuranTeks = useAksesibilitasStore((state) => state.setUkuranTeks);
	const toggleKontrasTinggi = useAksesibilitasStore(
		(state) => state.toggleKontrasTinggi,
	);
	const toggleSuaraOtomatis = useAksesibilitasStore(
		(state) => state.toggleSuaraOtomatis,
	);

	// Sinkronisasi kelas CSS ke root documentElement (WCAG 1.4.3 & 1.4.4)
	useEffect(() => {
		if (typeof document === "undefined") return;
		const root = document.documentElement;
		root.classList.remove("teks-besar", "teks-sangat-besar");
		if (ukuranTeks === "besar") root.classList.add("teks-besar");
		if (ukuranTeks === "sangat-besar") root.classList.add("teks-sangat-besar");

		if (kontrasTinggi) {
			root.classList.add("kontras-tinggi");
		} else {
			root.classList.remove("kontras-tinggi");
		}
	}, [ukuranTeks, kontrasTinggi]);

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setTerbuka((prev) => !prev)}
				aria-expanded={terbuka}
				aria-haspopup="dialog"
				aria-label="Buka menu aksesibilitas disabilitas"
				className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-[#8b5cf6] transition-colors hover:bg-purple-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
			>
				<Accessibility className="h-4 w-4" aria-hidden="true" />
				<span className="hidden sm:inline">Fitur Disabilitas</span>
			</button>

			{terbuka && (
				<div
					role="dialog"
					aria-label="Pengaturan Aksesibilitas Disabilitas"
					className="absolute right-0 top-11 z-50 w-72 sm:w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95"
				>
					<div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
						<div className="flex items-center gap-2">
							<Accessibility className="h-4 w-4 text-[#8b5cf6]" />
							<h2 className="text-xs font-bold text-slate-800">
								Aksesibilitas Disabilitas
							</h2>
						</div>
						<button
							type="button"
							onClick={() => setTerbuka(false)}
							aria-label="Tutup menu aksesibilitas"
							className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					<div className="mt-3 space-y-3.5 text-xs">
						{/* Pengatur Ukuran Teks (Low Vision) */}
						<div>
							<div className="flex items-center gap-1.5 font-bold text-slate-700">
								<Type className="h-3.5 w-3.5 text-purple-600" />
								<span>Ukuran Teks (WCAG 1.4.4)</span>
							</div>
							<div className="mt-1.5 grid grid-cols-3 gap-1.5">
								{(
									[
										{ id: "normal", label: "Normal (A)" },
										{ id: "besar", label: "Besar (A+)" },
										{ id: "sangat-besar", label: "Ekstra (A++)" },
									] as const
								).map((opsi) => (
									<button
										key={opsi.id}
										type="button"
										onClick={() => {
											setUkuranTeks(opsi.id);
											ucapkan(`Ukuran teks diubah ke ${opsi.label}`);
										}}
										aria-pressed={ukuranTeks === opsi.id}
										className={`rounded-lg border px-2 py-1.5 text-center text-[11px] font-bold transition-all ${
											ukuranTeks === opsi.id
												? "border-purple-600 bg-purple-600 text-white"
												: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
										}`}
									>
										{opsi.label}
									</button>
								))}
							</div>
						</div>

						{/* Pengatur Kontras Tinggi */}
						<div className="flex items-center justify-between border-t border-slate-100 pt-3">
							<div>
								<div className="flex items-center gap-1.5 font-bold text-slate-700">
									<Sun className="h-3.5 w-3.5 text-amber-500" />
									<span>Kontras Tinggi</span>
								</div>
								<p className="text-[10px] text-slate-400">
									Mempertegas batas border hitam tebal & teks hitam pekat (Tema
									Terang Kontras Tinggi)
								</p>
							</div>
							<Button
								ukuran="sm"
								varian={kontrasTinggi ? "utama" : "kedua"}
								onClick={() => {
									const statusSebelumnya = kontrasTinggi;
									toggleKontrasTinggi();
									ucapkan(
										!statusSebelumnya
											? "Mode kontras tinggi diaktifkan"
											: "Mode kontras normal diaktifkan",
									);
								}}
							>
								{kontrasTinggi ? "Aktif" : "Mati"}
							</Button>
						</div>

						{/* Pengatur Pembaca Suara Otomatis */}
						<div className="flex items-center justify-between border-t border-slate-100 pt-3">
							<div>
								<div className="flex items-center gap-1.5 font-bold text-slate-700">
									{suaraOtomatis ? (
										<Volume2 className="h-3.5 w-3.5 text-emerald-600" />
									) : (
										<VolumeX className="h-3.5 w-3.5 text-slate-400" />
									)}
									<span>Suara Pembaca Layar</span>
								</div>
								<p className="text-[10px] text-slate-400">
									Membacakan konfirmasi, petunjuk, & soal secara otomatis
								</p>
							</div>
							<Button
								ukuran="sm"
								varian={suaraOtomatis ? "utama" : "kedua"}
								onClick={() => {
									const statusSebelumnya = suaraOtomatis;
									toggleSuaraOtomatis();
									if (!statusSebelumnya) {
										ucapkan(
											"Suara pembaca layar diaktifkan. Teks dan soal akan dibacakan untuk Anda.",
										);
									} else {
										ucapkan("Suara pembaca layar dinonaktifkan.");
									}
								}}
							>
								{suaraOtomatis ? "Aktif" : "Mati"}
							</Button>
						</div>

						{/* Panduan Pintasan Keyboard */}
						<div className="border-t border-slate-100 pt-3">
							<p className="text-[11px] font-bold text-slate-700">
								Pintasan Akses Cepat (WCAG 2.1.1):
							</p>
							<ul className="mt-1 space-y-1 text-[10px] text-slate-500">
								<li>
									•{" "}
									<kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-700">
										Tab
									</kbd>
									: Berpindah antar tombol & rumus
								</li>
								<li>
									•{" "}
									<kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-700">
										Enter
									</kbd>
									: Mengirim jawaban latihan
								</li>
								<li>
									•{" "}
									<kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-700">
										Spasi
									</kbd>
									: Menekan tombol audio / kamera
								</li>
							</ul>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
