import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Hand, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LEVEL } from "@/datas/consts/level";
import {
	akurasiLevel,
	statusLevel,
	useLatihanStore,
} from "@/datas/stores/latihan-store";

export const Route = createFileRoute("/_app/materi/")({
	component: PetaMateri,
});

function PetaMateri() {
	const riwayat = useLatihanStore((state) => state.riwayat);

	return (
		<div className="mx-auto max-w-5xl space-y-5">
			<header>
				<h1 className="text-base font-bold text-slate-800">Peta Materi</h1>
				<p className="mt-0.5 text-xs text-slate-500">
					Enam level aritmetika dasar. Level terbuka setelah level sebelumnya
					mencapai akurasi minimal 80 persen.
				</p>
			</header>

			<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{LEVEL.map((level) => {
					const status = statusLevel(riwayat, level.id);
					const akurasi = akurasiLevel(riwayat, level.id);
					const keteranganStatus =
						status === "selesai"
							? "selesai"
							: status === "terbuka"
								? "terbuka"
								: "terkunci";

					return (
						<li key={level.id}>
							{status === "terkunci" ? (
								<Card className="h-full border-dashed p-4">
									<div className="flex items-center justify-between">
										<p className="text-[11px] font-bold text-slate-400">
											Level {level.id}
										</p>
										<Badge nada="netral">
											<Lock className="h-3 w-3" aria-hidden="true" />
											Terkunci
										</Badge>
									</div>
									<h2 className="mt-2 text-sm font-bold text-slate-600">
										{level.topik}
									</h2>
									<p className="mt-1 text-[11px] leading-relaxed text-slate-500">
										Terbuka setelah Level {level.id - 1} mencapai akurasi
										minimal 80 persen.
									</p>
									<p className="sr-only">
										Level {level.id}, terkunci. Level {level.id - 1} belum
										tuntas.
									</p>
								</Card>
							) : (
								<Link
									to="/materi/$levelId"
									params={{ levelId: String(level.id) }}
									className="block h-full no-underline"
								>
									<Card className="h-full p-4 transition-colors hover:border-purple-200">
										<div className="flex items-center justify-between">
											<p className="text-[11px] font-bold text-purple-600">
												Level {level.id}
											</p>
											<Badge nada={status === "selesai" ? "hijau" : "ungu"}>
												{status === "selesai" ? "Selesai" : "Terbuka"}
											</Badge>
										</div>
										<h2 className="mt-2 text-sm font-bold text-slate-800">
											{level.topik}
										</h2>
										<p className="mt-1 text-[11px] text-slate-500">
											Contoh: {level.contoh}
										</p>
										<div className="mt-3 flex items-center justify-between text-[11px]">
											<span className="font-semibold text-slate-600">
												{akurasi === null
													? "Belum ada latihan"
													: `Akurasi ${akurasi}%`}
											</span>
											<span className="inline-flex items-center gap-1 font-semibold text-[#8b5cf6]">
												Buka pelajaran
												<ArrowRight className="h-3 w-3" aria-hidden="true" />
											</span>
										</div>
										<p className="sr-only">
											Level {level.id}, {keteranganStatus}
											{akurasi !== null ? `, akurasi ${akurasi} persen` : ""}.
										</p>
									</Card>
								</Link>
							)}
						</li>
					);
				})}
			</ul>

			<Card className="p-5">
				<div className="flex items-start gap-3">
					<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
						<Hand className="h-4 w-4" aria-hidden="true" />
					</span>
					<div>
						<h2 className="text-xs font-bold text-slate-800">
							Isyarat angka 0-9 (SIBI)
						</h2>
						<p className="mt-1 text-[11px] leading-relaxed text-slate-600">
							Isyarat angka dijelaskan dengan teks. Saat menjawab soal, gunakan
							papan ketik, suara, atau tulisan.
						</p>
					</div>
				</div>
			</Card>

			<Card className="p-5">
				<div className="flex items-start gap-3">
					<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#8b5cf6]">
						<Sparkles className="h-4 w-4" aria-hidden="true" />
					</span>
					<div>
						<h2 className="text-xs font-bold text-slate-800">
							Sudah paham materinya?
						</h2>
						<p className="mt-1 text-[11px] leading-relaxed text-slate-600">
							Uji pemahaman lewat latihan mandiri. Semua soal bisa dijawab
							dengan papan ketik, suara, isyarat angka, atau tulisan.
						</p>
						<Link
							to="/latihan"
							className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#8b5cf6] px-3 text-xs font-semibold text-white no-underline hover:bg-purple-700"
						>
							Buka latihan
							<ArrowRight className="h-3 w-3" aria-hidden="true" />
						</Link>
					</div>
				</div>
			</Card>
		</div>
	);
}
