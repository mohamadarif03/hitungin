import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { JalurIsyarat } from "@/components/latihan/jalur-isyarat";
import { SesiLatihan } from "@/components/latihan/sesi-latihan";
import { MenuAksesibilitas } from "@/components/menu-aksesibilitas";
import { useAksesibilitasStore } from "@/datas/stores/aksesibilitas-store";
import { buatSoal } from "@/lib/soal";

export const Route = createFileRoute("/tamu")({
	component: HalamanTamu,
});

/** Mode tamu (S-02): satu soal contoh, tanpa menyimpan progres atau rekaman. */
function HalamanTamu() {
	const [siap, setSiap] = useState(false);
	const [soal] = useState(() => buatSoal(3, 1));
	const ukuranTeks = useAksesibilitasStore((state) => state.ukuranTeks);
	const kontrasTinggi = useAksesibilitasStore((state) => state.kontrasTinggi);

	useEffect(() => {
		setSiap(true);
	}, []);

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
		<div className="min-h-dvh bg-[#f8f9fb] text-slate-700 antialiased">
			<header className="border-b border-slate-100 bg-white">
				<div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
					<span className="flex items-center gap-2">
						<svg
							className="h-6 w-6"
							viewBox="0 0 32 32"
							fill="none"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M8 24C8 15 15 6 25 6C22 13 18 17 12 18C16 19 20 18 23 15C19 22 14 25 8 24Z"
								fill="url(#gradTamu)"
							/>
							<circle cx="11" cy="11" r="3" fill="#8b5cf6" />
							<defs>
								<linearGradient
									id="gradTamu"
									x1="8"
									y1="6"
									x2="25"
									y2="24"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#8b5cf6" />
									<stop offset="1" stopColor="#ec4899" />
								</linearGradient>
							</defs>
						</svg>
						<span className="text-sm font-bold tracking-tight text-slate-800">
							HITUNGIN
						</span>
						<span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
							Mode tamu
						</span>
					</span>
					<div className="flex items-center gap-2.5">
						<MenuAksesibilitas />
						<Link
							to="/masuk"
							className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 no-underline hover:text-[#8b5cf6]"
						>
							<ArrowLeft className="h-3 w-3" aria-hidden="true" />
							Kembali ke masuk
						</Link>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-3xl px-4 py-6">
				<p className="mb-4 text-[11px] leading-relaxed text-slate-500">
					Ini satu soal contoh tanpa akun. Progres dan rekaman tidak disimpan,
					dan semua jawaban bisa dicoba dengan papan ketik bila kamera atau
					mikrofon tidak tersedia.
				</p>
				{siap ? (
					<SesiLatihan soal={soal} level={3} tamu />
				) : (
					<output className="block text-xs font-medium text-slate-500">
						Menyiapkan soal contoh…
					</output>
				)}
			</main>
		</div>
	);
}
