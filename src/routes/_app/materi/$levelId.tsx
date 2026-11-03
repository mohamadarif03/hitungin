import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { useState } from "react";
import { MathRumus } from "@/components/math-rumus";
import { TombolDengar } from "@/components/tombol-dengar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VisualMateri } from "@/components/visual-bilangan";
import { type LangkahContoh, LEVEL, levelById } from "@/datas/consts/level";
import {
	akurasiLevel,
	statusLevel,
	useLatihanStore,
} from "@/datas/stores/latihan-store";

export const Route = createFileRoute("/_app/materi/$levelId")({
	component: HalamanPelajaran,
});

function HalamanPelajaran() {
	const { levelId } = Route.useParams();
	const riwayat = useLatihanStore((state) => state.riwayat);
	const level = levelById(Number(levelId));

	if (!level) {
		return (
			<div className="mx-auto max-w-2xl">
				<Card className="p-6">
					<h1 className="text-sm font-bold text-slate-800">
						Level tidak ditemukan
					</h1>
					<p className="mt-1 text-xs text-slate-500">
						Pilih level 1 sampai {LEVEL.length} pada peta materi.
					</p>
					<Link
						to="/materi"
						className="mt-3 inline-flex h-11 items-center gap-1.5 rounded-lg bg-[#8b5cf6] px-4 text-xs font-semibold text-white no-underline"
					>
						<ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
						Kembali ke peta materi
					</Link>
				</Card>
			</div>
		);
	}

	const status = statusLevel(riwayat, level.id);
	const akurasi = akurasiLevel(riwayat, level.id);

	if (status === "terkunci") {
		return (
			<div className="mx-auto max-w-2xl">
				<Card className="p-6">
					<div className="flex items-center gap-2">
						<Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
						<h1 className="text-sm font-bold text-slate-800">
							Level {level.id} masih terkunci
						</h1>
					</div>
					<p className="mt-1 text-xs leading-relaxed text-slate-500">
						Level ini terbuka setelah Level {level.id - 1} mencapai akurasi
						minimal 80 persen. Kamu bisa melihat materi level sebelumnya lebih
						dulu.
					</p>
					<Link
						to="/materi"
						className="mt-3 inline-flex h-11 items-center gap-1.5 rounded-lg bg-[#8b5cf6] px-4 text-xs font-semibold text-white no-underline"
					>
						<ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
						Kembali ke peta materi
					</Link>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl space-y-4">
			<div>
				<Link
					to="/materi"
					className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 no-underline hover:text-[#8b5cf6]"
				>
					<ArrowLeft className="h-3 w-3" aria-hidden="true" />
					Peta materi
				</Link>
				<div className="mt-2 flex flex-wrap items-center gap-2">
					<Badge nada="ungu">Level {level.id}</Badge>
					<Badge nada={status === "selesai" ? "hijau" : "netral"}>
						{status === "selesai" ? `Selesai, akurasi ${akurasi}%` : "Terbuka"}
					</Badge>
				</div>
				<h1 className="mt-2 text-lg font-bold text-slate-800">{level.judul}</h1>
				<p className="mt-0.5 text-xs text-slate-500">
					Contoh soal level ini: {level.contoh}
				</p>
			</div>

			<Card className="p-5">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h2 className="text-sm font-bold text-slate-800">Penjelasan</h2>
					<TombolDengar
						teks={`${level.judul}. ${level.penjelasan.join(" ")}`}
						label="Dengarkan penjelasan"
					/>
				</div>
				<div className="mt-2 space-y-2">
					{level.penjelasan.map((paragraf) => (
						<p
							key={paragraf}
							className="text-xs leading-relaxed text-slate-600"
						>
							{paragraf}
						</p>
					))}
				</div>
			</Card>

			<Card className="p-5">
				<h2 className="text-sm font-bold text-slate-800">Rumus</h2>
				<p className="mt-0.5 text-[11px] text-slate-500">
					{level.rumus.keterangan}. Tekan Tab untuk berpindah antarbagian rumus:
					bilangan, operator, lalu hasil.
				</p>
				<MathRumus
					bagian={level.rumus.bagian}
					label={`Rumus level ${level.id}: ${level.rumus.keterangan}`}
					className="mt-3"
				/>
				<p className="mt-3 rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
					Rumus ditulis dalam MathML sehingga dapat dibacakan pembaca layar
					sebagai &quot;
					{level.rumus.bagian.map((potongan) => potongan.nilai).join(" ")}
					&quot;.
				</p>
			</Card>

			<Card className="p-5">
				<h2 className="text-sm font-bold text-slate-800">Lihat</h2>
				<div className="mt-3">
					<VisualMateri
						visual={level.visual}
						keterangan={level.alternatifVisual}
					/>
				</div>
			</Card>

			<Card className="p-5">
				<h2 className="text-sm font-bold text-slate-800">Contoh terpandu</h2>
				<p className="mt-0.5 text-[11px] text-slate-500">
					Ikuti langkah satu per satu. Setiap langkah dibacakan sebagai penanda
					posisi.
				</p>
				<div className="mt-3">
					<ContohTerpandu langkah={level.langkah} />
				</div>
			</Card>

			<div className="flex flex-wrap gap-2 pb-2">
				<Link
					to="/latihan"
					search={{ level: level.id }}
					className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-[#8b5cf6] px-4 text-sm font-semibold text-white no-underline shadow-xs hover:bg-purple-700"
				>
					Latihan level ini
					<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
				</Link>
			</div>
		</div>
	);
}

function ContohTerpandu({ langkah }: { langkah: LangkahContoh[] }) {
	const [posisi, setPosisi] = useState(0);
	const aktif = langkah[posisi];

	if (!aktif) return null;

	return (
		<div>
			<output
				aria-live="polite"
				className="block text-[11px] font-semibold text-purple-600"
			>
				Langkah {posisi + 1} dari {langkah.length}
			</output>
			<h3 className="mt-1 text-sm font-bold text-slate-800">{aktif.judul}</h3>
			<p className="mt-1 text-xs leading-relaxed text-slate-600">{aktif.isi}</p>
			<div className="mt-3 flex flex-wrap items-center gap-2">
				<Button
					varian="kedua"
					ukuran="sm"
					onClick={() => setPosisi((sebelumnya) => Math.max(0, sebelumnya - 1))}
					disabled={posisi === 0}
				>
					Sebelumnya
				</Button>
				<Button
					ukuran="sm"
					onClick={() =>
						setPosisi((sebelumnya) =>
							Math.min(langkah.length - 1, sebelumnya + 1),
						)
					}
					disabled={posisi === langkah.length - 1}
				>
					Berikutnya
				</Button>
			</div>
		</div>
	);
}
