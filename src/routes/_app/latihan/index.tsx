import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Hand, Keyboard, Mic, PenTool } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LEVEL } from "@/datas/consts/level";
import { statusLevel, useLatihanStore } from "@/datas/stores/latihan-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/latihan/")({
	validateSearch: (search: Record<string, unknown>): { level?: number } => {
		const level = Number(search.level);
		return Number.isInteger(level) && level >= 1 && level <= LEVEL.length
			? { level }
			: {};
	},
	component: HalamanLatihan,
});

const JUMLAH_PILIHAN = [5, 10, 15] as const;

const JALUR = [
	{
		ikon: Keyboard,
		label: "Papan ketik",
		catatan: "Selalu tersedia, tanpa izin perangkat.",
	},
	{
		ikon: Mic,
		label: "Suara",
		catatan: "Butuh izin mikrofon, angka dikonfirmasi sebelum dinilai.",
	},
	{
		ikon: Hand,
		label: "Isyarat angka",
		catatan: "Butuh kamera, diproses di browser.",
	},
	{
		ikon: PenTool,
		label: "Tulisan",
		catatan: "Kanvas angka, bisa jari atau mouse.",
	},
];

function HalamanLatihan() {
	const { level: levelAwal } = Route.useSearch();
	const navigate = useNavigate();
	const riwayat = useLatihanStore((state) => state.riwayat);
	const sesi = useLatihanStore((state) => state.sesi);
	const hapusSesi = useLatihanStore((state) => state.hapusSesi);
	const [level, setLevel] = useState(levelAwal ?? 1);
	const [jumlah, setJumlah] = useState<number>(10);

	function mulaiBaru() {
		hapusSesi();
		navigate({ to: "/latihan/sesi", search: { level, jumlah } });
	}

	return (
		<div className="mx-auto max-w-3xl space-y-4">
			<header>
				<h1 className="text-base font-bold text-slate-800">Latihan Mandiri</h1>
				<p className="mt-0.5 text-xs text-slate-500">
					Pilih level dan jumlah soal. Setiap soal bisa dijawab dengan cara yang
					paling nyaman, dan cara boleh diganti di tengah sesi.
				</p>
			</header>

			{sesi && (
				<Card className="flex flex-wrap items-center justify-between gap-3 border-purple-100 bg-purple-50/60 p-4">
					<div>
						<p className="text-xs font-bold text-slate-800">
							Ada sesi yang belum selesai
						</p>
						<p className="mt-0.5 text-[11px] text-slate-600">
							Level {sesi.level}, soal{" "}
							{Math.min(sesi.indeks + 1, sesi.soal.length)} dari{" "}
							{sesi.soal.length}.
						</p>
					</div>
					<Link
						to="/latihan/sesi"
						search={{
							level: sesi.level,
							jumlah: sesi.soal.length,
							tugasId: sesi.tugasId,
							batasPetunjuk: sesi.batasPetunjuk,
						}}
						className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#8b5cf6] px-3 text-xs font-semibold text-white no-underline hover:bg-purple-700"
					>
						Lanjutkan sesi
						<ArrowRight className="h-3 w-3" aria-hidden="true" />
					</Link>
				</Card>
			)}

			<Card className="p-5">
				<fieldset>
					<legend className="text-xs font-semibold text-slate-700">
						Pilih level
					</legend>
					<div className="mt-2 grid gap-2 sm:grid-cols-2">
						{LEVEL.map((butir) => {
							const status = statusLevel(riwayat, butir.id);
							const terkunci = status === "terkunci" && butir.id !== level;
							return (
								<label
									key={butir.id}
									className={cn(
										"flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-[11px] transition-colors",
										level === butir.id
											? "border-[#8b5cf6] bg-purple-50"
											: "border-slate-200 hover:bg-slate-50",
										terkunci && "cursor-not-allowed opacity-60",
									)}
								>
									<input
										type="radio"
										name="level"
										value={butir.id}
										checked={level === butir.id}
										onChange={() => setLevel(butir.id)}
										className="mt-0.5 h-4 w-4 accent-[#8b5cf6]"
									/>
									<span>
										<span className="block text-xs font-bold text-slate-800">
											Level {butir.id}
										</span>
										<span className="block text-slate-500">{butir.topik}</span>
										{status === "terkunci" && (
											<span className="mt-0.5 block font-semibold text-slate-400">
												Belum dibuka di peta materi
											</span>
										)}
									</span>
								</label>
							);
						})}
					</div>
					{statusLevel(riwayat, level) === "terkunci" && (
						<output className="block mt-2 text-[11px] font-medium text-amber-700">
							Level ini masih terkunci di peta materi, tetapi latihan bebas
							tetap boleh dicoba.
						</output>
					)}
				</fieldset>
			</Card>

			<Card className="p-5">
				<fieldset>
					<legend className="text-xs font-semibold text-slate-700">
						Jumlah soal
					</legend>
					<div className="mt-2 flex flex-wrap gap-2">
						{JUMLAH_PILIHAN.map((nilai) => (
							<label
								key={nilai}
								className={cn(
									"flex h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-semibold",
									jumlah === nilai
										? "border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]"
										: "border-slate-200 text-slate-600 hover:bg-slate-50",
								)}
							>
								<input
									type="radio"
									name="jumlah"
									value={nilai}
									checked={jumlah === nilai}
									onChange={() => setJumlah(nilai)}
									className="h-4 w-4 accent-[#8b5cf6]"
								/>
								{nilai} soal
							</label>
						))}
					</div>
					<p className="mt-2 text-[11px] text-slate-500">
						Tidak ada batas waktu. Sesi bisa dijeda, dan jawaban tersimpan di
						soal terakhir.
					</p>
				</fieldset>
			</Card>

			<Card className="p-5">
				<h2 className="text-xs font-semibold text-slate-700">
					Cara menjawab yang tersedia
				</h2>
				<ul className="mt-2 space-y-1.5">
					{JALUR.map((jalur) => (
						<li
							key={jalur.label}
							className="flex items-start gap-2 rounded-lg bg-slate-50/80 px-3 py-2"
						>
							<jalur.ikon
								className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500"
								aria-hidden="true"
							/>
							<span className="text-[11px]">
								<span className="block font-semibold text-slate-700">
									{jalur.label}
								</span>
								<span className="block text-slate-500">{jalur.catatan}</span>
							</span>
						</li>
					))}
				</ul>
			</Card>

			<div className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-center">
				<Button onClick={mulaiBaru} className="w-full sm:w-auto">
					Mulai latihan
					<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
				</Button>
				<Link
					to="/materi"
					className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 no-underline shadow-2xs hover:bg-slate-50 sm:w-auto"
				>
					Belajar materi dulu
				</Link>
			</div>
		</div>
	);
}
