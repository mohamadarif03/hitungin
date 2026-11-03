import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	BookOpen,
	CalendarClock,
	ClipboardList,
	MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { levelById } from "@/datas/consts/level";
import { TUGAS } from "@/datas/consts/tugas";
import { useLatihanStore } from "@/datas/stores/latihan-store";

export const Route = createFileRoute("/_app/tugas/")({
	component: HalamanTugas,
});

function HalamanTugas() {
	const riwayat = useLatihanStore((state) => state.riwayat);
	const sesi = useLatihanStore((state) => state.sesi);

	return (
		<div className="mx-auto max-w-3xl space-y-4">
			<header>
				<h1 className="text-base font-bold text-slate-800">Tugas dari Guru</h1>
				<p className="mt-0.5 text-xs text-slate-500">
					Kerjakan tugas sesuai pengaturan gurumu: level, jumlah soal, dan batas
					petunjuk.
				</p>
			</header>

			<ul className="space-y-3">
				{TUGAS.map((tugas) => {
					const selesai = riwayat.some((butir) => butir.tugasId === tugas.id);
					const berjalan = !selesai && sesi?.tugasId === tugas.id;
					const level = levelById(tugas.level);

					return (
						<li key={tugas.id}>
							<Card className="p-5">
								<div className="flex flex-wrap items-start justify-between gap-2">
									<div>
										<h2 className="text-sm font-bold text-slate-800">
											{tugas.judul}
										</h2>
										<p className="mt-0.5 text-[11px] text-slate-500">
											{tugas.guru}
										</p>
									</div>
									<Badge
										nada={selesai ? "hijau" : berjalan ? "kuning" : "netral"}
									>
										{selesai
											? "Selesai"
											: berjalan
												? "Berjalan"
												: "Belum dikerjakan"}
									</Badge>
								</div>

								<dl className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
									<div className="rounded-lg bg-slate-50 p-2">
										<dt className="text-slate-500">Level</dt>
										<dd className="font-semibold text-slate-800">
											{tugas.level}
										</dd>
									</div>
									<div className="rounded-lg bg-slate-50 p-2">
										<dt className="text-slate-500">Jumlah soal</dt>
										<dd className="font-semibold text-slate-800">
											{tugas.jumlahSoal}
										</dd>
									</div>
									<div className="rounded-lg bg-slate-50 p-2">
										<dt className="text-slate-500">Batas petunjuk</dt>
										<dd className="font-semibold text-slate-800">
											{tugas.batasPetunjuk}
										</dd>
									</div>
									<div className="rounded-lg bg-slate-50 p-2">
										<dt className="text-slate-500">Tenggat</dt>
										<dd className="font-semibold text-slate-800">
											{tugas.tenggat}
										</dd>
									</div>
								</dl>

								<div className="mt-3 flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
									<MessageSquare
										className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
										aria-hidden="true"
									/>
									<p className="text-[11px] leading-relaxed text-slate-600">
										<span className="font-semibold text-slate-700">
											Catatan guru:{" "}
										</span>
										{tugas.catatanGuru}
									</p>
								</div>

								<div className="mt-3 flex flex-wrap items-center gap-2">
									<Link
										to="/latihan/sesi"
										search={{
											level: tugas.level,
											jumlah: tugas.jumlahSoal,
											tugasId: tugas.id,
											batasPetunjuk: tugas.batasPetunjuk,
										}}
										className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#8b5cf6] px-3 text-xs font-semibold text-white no-underline hover:bg-purple-700"
									>
										{berjalan ? "Lanjutkan tugas" : "Kerjakan tugas"}
										<ArrowRight className="h-3 w-3" aria-hidden="true" />
									</Link>
									<Link
										to="/materi/$levelId"
										params={{ levelId: String(tugas.level) }}
										className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 no-underline hover:bg-slate-50"
									>
										<BookOpen className="h-3 w-3" aria-hidden="true" />
										Materi {level ? `Level ${level.id}` : ""}
									</Link>
								</div>
							</Card>
						</li>
					);
				})}
			</ul>

			<Card className="flex items-start gap-2 p-4">
				<CalendarClock
					className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
					aria-hidden="true"
				/>
				<p className="text-[11px] leading-relaxed text-slate-500">
					Tenggat hanya pengingat, bukan batas waktu pengerjaan soal. Tidak ada
					penghitung waktu tersembunyi di dalam latihan.
				</p>
			</Card>

			<Card className="flex items-start gap-2 p-4">
				<ClipboardList
					className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
					aria-hidden="true"
				/>
				<p className="text-[11px] leading-relaxed text-slate-500">
					Hasil tugas adalah umpan balik latihan untukmu, bukan penilaian final
					atau pengganti rapor guru.
				</p>
			</Card>
		</div>
	);
}
