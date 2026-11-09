import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
	BookOpen,
	Calculator,
	ClipboardList,
	Home,
	LogOut,
	Maximize,
	Minimize,
} from "lucide-react";
import { useEffect, useState } from "react";
import { MenuAksesibilitas } from "@/components/menu-aksesibilitas";
import { useAksesibilitasStore } from "@/datas/stores/aksesibilitas-store";
import { useAuthStore } from "@/datas/stores/auth-store";
import { cn } from "@/lib/utils";

const MENU = [
	{ to: "/", label: "Beranda", ikon: Home, lencana: undefined, tepat: true },
	{
		to: "/materi",
		label: "Materi Belajar",
		ikon: BookOpen,
		lencana: "6 Level",
		tepat: false,
	},
	{
		to: "/latihan",
		label: "Latihan Mandiri",
		ikon: Calculator,
		lencana: "4 Jalur",
		tepat: false,
	},
	{
		to: "/tugas",
		label: "Tugas dari Guru",
		ikon: ClipboardList,
		lencana: undefined,
		tepat: false,
	},
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
	const siswa = useAuthStore((state) => state.siswa);
	const keluar = useAuthStore((state) => state.keluar);
	const navigate = useNavigate();
	const jalur = useRouterState({ select: (state) => state.location.pathname });
	const [layarPenuh, setLayarPenuh] = useState(false);
	const ukuranTeks = useAksesibilitasStore((state) => state.ukuranTeks);
	const kontrasTinggi = useAksesibilitasStore((state) => state.kontrasTinggi);

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

	const aktif = MENU.find((item) =>
		item.tepat ? jalur === item.to : jalur.startsWith(item.to),
	);
	const inisial = (siswa?.nama ?? "Siswa")
		.split(" ")
		.filter(Boolean)
		.map((kata) => kata[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	function ubahLayarPenuh() {
		if (typeof document === "undefined") return;
		if (!document.fullscreenElement) {
			document.documentElement
				.requestFullscreen?.()
				.then(() => setLayarPenuh(true))
				.catch(() => setLayarPenuh(false));
		} else {
			document
				.exitFullscreen?.()
				.then(() => setLayarPenuh(false))
				.catch(() => setLayarPenuh(true));
		}
	}

	function keluarAkun() {
		keluar();
		navigate({ to: "/masuk", replace: true });
	}

	return (
		<div className="min-h-dvh bg-[#f8f9fb] text-slate-700 antialiased">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-[#8b5cf6] focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none"
			>
				Lompat ke konten utama
			</a>

			<div className="flex min-h-dvh">
				{/* Sidebar menu (tablet dan laptop) */}
				<aside
					aria-label="Menu belajar"
					className="hidden w-60 shrink-0 flex-col border-r border-slate-100 bg-white px-3 py-4 md:sticky md:top-0 md:flex md:h-dvh"
				>
					<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
						<div className="mb-4 flex items-center gap-2.5 px-3">
							<LogoHitungin className="h-7 w-7 shrink-0" />
							<span>
								<span className="block text-[11px] font-bold tracking-wider text-purple-600 uppercase">
									HITUNGIN
								</span>
								<span className="block text-[15px] font-bold tracking-tight text-slate-800">
									Menu Belajar
								</span>
							</span>
						</div>
						<nav
							aria-label="Menu belajar"
							className="min-h-0 flex-1 overflow-y-auto pr-1"
						>
							<ul className="space-y-1.5 text-[13px] font-medium text-slate-600">
								{MENU.map((item) => (
									<li key={item.to}>
										<Link
											to={item.to}
											activeOptions={{ exact: item.tepat }}
											className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50 data-[status=active]:bg-[#8b5cf6] data-[status=active]:font-semibold data-[status=active]:text-white"
										>
											<span className="flex items-center gap-2.5">
												<item.ikon className="h-4 w-4" aria-hidden="true" />
												{item.label}
											</span>
											{item.lencana && (
												<span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-600">
													{item.lencana}
												</span>
											)}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					</div>

					<div className="shrink-0 border-t border-slate-100 pt-3">
						<div className="flex items-center gap-2.5 px-1 py-1">
							<span
								aria-hidden="true"
								className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-xs font-bold text-white"
							>
								{inisial}
							</span>
							<span className="min-w-0">
								<span className="block truncate text-xs font-bold text-slate-800">
									{siswa?.nama ?? "Siswa"}
								</span>
								<span className="block truncate text-[10px] text-slate-400">
									{siswa?.kelas ?? "Belum ada kelas"}
								</span>
							</span>
						</div>
						<button
							type="button"
							onClick={keluarAkun}
							className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
						>
							<LogOut className="h-4 w-4" aria-hidden="true" />
							Keluar
						</button>
					</div>
				</aside>

				<div className="flex min-w-0 flex-1 flex-col">
					<header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 sm:px-6">
						<div className="flex min-w-0 items-center gap-2">
							<span className="flex items-center gap-2 md:hidden">
								<LogoHitungin className="h-6 w-6" />
								<span className="text-sm font-bold tracking-tight text-slate-800">
									HITUNGIN
								</span>
							</span>
							<h1 className="hidden truncate text-sm font-bold text-slate-800 md:block">
								{aktif?.label ?? "HITUNGIN"}
							</h1>
						</div>

						<div className="flex items-center gap-2">
							<MenuAksesibilitas />
							<button
								type="button"
								onClick={ubahLayarPenuh}
								aria-pressed={layarPenuh}
								className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 text-slate-600 transition-colors hover:bg-slate-50"
							>
								{layarPenuh ? (
									<Minimize className="h-4 w-4" aria-hidden="true" />
								) : (
									<Maximize className="h-4 w-4" aria-hidden="true" />
								)}
								<span className="sr-only">
									{layarPenuh
										? "Keluar dari layar penuh"
										: "Tampilkan layar penuh"}
								</span>
							</button>
							<div className="flex items-center gap-2 pl-1 md:hidden">
								<span
									aria-hidden="true"
									className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-gradient-to-tr from-purple-600 to-pink-500 text-xs font-bold text-white"
								>
									{inisial}
								</span>
								<span className="hidden text-left sm:block">
									<span className="block text-xs font-bold leading-none text-slate-800">
										{siswa?.nama ?? "Siswa"}
									</span>
									<span className="block text-[10px] text-slate-400">
										{siswa?.kelas ?? "Belum ada kelas"}
									</span>
								</span>
							</div>
						</div>
					</header>

					<main
						id="main-content"
						className="flex-1 px-4 pt-5 pb-24 sm:px-6 md:pb-8"
					>
						{children}
					</main>
				</div>
			</div>

			{/* Menu bawah untuk HP (PRD bab 6) */}
			<nav
				aria-label="Menu utama"
				className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-100 bg-white md:hidden"
			>
				<ul className="flex">
					{MENU.map((item) => (
						<li key={item.to} className="flex-1">
							<Link
								to={item.to}
								activeOptions={{ exact: item.tepat }}
								className="flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold text-slate-500 data-[status=active]:text-[#8b5cf6]"
							>
								<item.ikon className="h-5 w-5" aria-hidden="true" />
								{item.label.split(" ")[0]}
							</Link>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
}

function LogoHitungin({ className }: { className?: string }) {
	return (
		<svg
			className={cn(className)}
			viewBox="0 0 32 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M8 24C8 15 15 6 25 6C22 13 18 17 12 18C16 19 20 18 23 15C19 22 14 25 8 24Z"
				fill="url(#logoGrad)"
			/>
			<circle cx="11" cy="11" r="3" fill="#8b5cf6" />
			<defs>
				<linearGradient
					id="logoGrad"
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
	);
}
