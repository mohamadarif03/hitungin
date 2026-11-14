import { Download, Share, X } from "lucide-react";
import { useEffect, useState } from "react";

type EventPasang = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Ajakan memasang HITUNGIN ke layar utama. Android dan desktop memakai
 * beforeinstallprompt; iPhone tidak mendukungnya, jadi ditampilkan petunjuk manual.
 */
export function AjakanPasang() {
	const [eventPasang, setEventPasang] = useState<EventPasang | null>(null);
	const [tampilIos, setTampilIos] = useState(false);
	const [ditutup, setDitutup] = useState(false);

	useEffect(() => {
		const sudahTerpasang =
			window.matchMedia("(display-mode: standalone)").matches ||
			(navigator as Navigator & { standalone?: boolean }).standalone === true;
		if (sudahTerpasang) return;

		const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
		if (ios) setTampilIos(true);

		function tanganiPrompt(e: Event) {
			e.preventDefault();
			setEventPasang(e as EventPasang);
		}
		function tanganiTerpasang() {
			setEventPasang(null);
			setTampilIos(false);
		}

		window.addEventListener("beforeinstallprompt", tanganiPrompt);
		window.addEventListener("appinstalled", tanganiTerpasang);
		return () => {
			window.removeEventListener("beforeinstallprompt", tanganiPrompt);
			window.removeEventListener("appinstalled", tanganiTerpasang);
		};
	}, []);

	if (ditutup || (!eventPasang && !tampilIos)) return null;

	async function pasang() {
		if (!eventPasang) return;
		await eventPasang.prompt();
		const pilihan = await eventPasang.userChoice;
		if (pilihan.outcome === "accepted") setEventPasang(null);
	}

	return (
		<section
			aria-label="Pasang aplikasi"
			className="mb-4 flex items-start gap-3 rounded-xl border border-purple-100 bg-purple-50/70 p-3.5"
		>
			<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#8b5cf6]">
				<Download className="h-4 w-4" aria-hidden="true" />
			</span>
			<div className="min-w-0 flex-1">
				<p className="text-xs font-bold text-slate-800">
					Pasang HITUNGIN di layar utama
				</p>
				{eventPasang ? (
					<button
						type="button"
						onClick={pasang}
						className="mt-2 inline-flex min-h-11 items-center rounded-lg bg-[#8b5cf6] px-4 text-xs font-semibold text-white"
					>
						Pasang sekarang
					</button>
				) : (
					<p className="mt-1 flex flex-wrap items-center gap-1 text-[11px] leading-relaxed text-slate-600">
						Tekan
						<Share className="inline h-3.5 w-3.5" aria-hidden="true" />
						Bagikan di Safari, lalu pilih Tambah ke Layar Utama.
					</p>
				)}
			</div>
			<button
				type="button"
				onClick={() => setDitutup(true)}
				aria-label="Tutup ajakan pasang"
				className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-white"
			>
				<X className="h-4 w-4" aria-hidden="true" />
			</button>
		</section>
	);
}
