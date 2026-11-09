import type { VisualLevel } from "@/datas/consts/level";
import type { Soal } from "@/lib/soal";

/** Blok hitung (titik) dengan padanan teks (N-07). */
export function TitikHitung({ jumlah }: { jumlah: number }) {
	return (
		<figure>
			<div aria-hidden="true" className="flex flex-wrap gap-2">
				{Array.from({ length: jumlah }, (_, urutan) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: titik identik tanpa id.
						key={urutan}
						className="h-4 w-4 rounded-full bg-[#8b5cf6]"
					/>
				))}
			</div>
			<figcaption className="mt-2 text-[11px] text-slate-500">
				Gambar: {jumlah} titik.
			</figcaption>
		</figure>
	);
}

/** Garis bilangan yang dapat dibaca sebagai gambar berlabel. */
export function GarisBilangan({
	mulai,
	akhir,
	tanda,
	keterangan,
}: {
	mulai: number;
	akhir: number;
	tanda: number[];
	keterangan: string;
}) {
	const rentang = akhir - mulai;
	const posisi = (nilai: number) => 20 + ((nilai - mulai) / rentang) * 600;
	const selang = rentang <= 20 ? 1 : 10;
	const garis: number[] = [];
	for (let nilai = mulai; nilai <= akhir; nilai += selang) garis.push(nilai);

	return (
		<figure>
			<svg
				viewBox="0 0 640 100"
				className="w-full"
				role="img"
				aria-label={`Garis bilangan dari ${mulai} sampai ${akhir}. ${keterangan}`}
			>
				<line
					x1="20"
					y1="50"
					x2="620"
					y2="50"
					stroke="#cbd5e1"
					strokeWidth="2"
				/>
				{garis.map((nilai) => (
					<g key={nilai}>
						<line
							x1={posisi(nilai)}
							y1="44"
							x2={posisi(nilai)}
							y2="56"
							stroke="#94a3b8"
						/>
						<text
							x={posisi(nilai)}
							y="76"
							textAnchor="middle"
							fontSize="11"
							fill="#64748b"
							fontFamily="inherit"
						>
							{nilai}
						</text>
					</g>
				))}
				{tanda.map((nilai, urutan) => (
					<g key={`tanda-${nilai}`}>
						<circle
							cx={posisi(nilai)}
							cy="50"
							r="6"
							fill={urutan === 0 ? "#8b5cf6" : "#ec4899"}
						/>
						<text
							x={posisi(nilai)}
							y="30"
							textAnchor="middle"
							fontSize="11"
							fontWeight="700"
							fill={urutan === 0 ? "#7c3aed" : "#db2777"}
							fontFamily="inherit"
						>
							{nilai}
						</text>
					</g>
				))}
			</svg>
			<figcaption className="mt-2 text-[11px] text-slate-500">
				{keterangan}
			</figcaption>
		</figure>
	);
}

export function VisualMateri({
	visual,
	keterangan,
}: {
	visual: VisualLevel;
	keterangan: string;
}) {
	if (visual.tipe === "titik") return <TitikHitung jumlah={visual.jumlah} />;
	return (
		<GarisBilangan
			mulai={visual.mulai}
			akhir={visual.akhir}
			tanda={visual.tanda}
			keterangan={keterangan}
		/>
	);
}

/** Angka sebagai puluhan (batang) dan satuan (titik) dengan penjajaran vertikal presisi. */
function NilaiBlok({ nilai }: { nilai: number }) {
	const puluhan = Math.floor(nilai / 10);
	const satuan = nilai % 10;
	return (
		<span className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-2 shadow-2xs">
			{puluhan > 0 && (
				<span className="flex items-center gap-1" title={`${puluhan} puluhan`}>
					{Array.from({ length: puluhan }, (_, urutan) => (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: batang puluhan identik tanpa id.
							key={urutan}
							className="h-10 w-3.5 rounded-sm bg-[#8b5cf6]"
						/>
					))}
				</span>
			)}
			{satuan > 0 && (
				<span
					className="flex max-w-24 flex-wrap items-center gap-1.5"
					title={`${satuan} satuan`}
				>
					{Array.from({ length: satuan }, (_, urutan) => (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: titik satuan identik tanpa id.
							key={urutan}
							className="h-3.5 w-3.5 rounded-full bg-[#ec4899] shadow-2xs"
						/>
					))}
				</span>
			)}
			{nilai === 0 && (
				<span className="text-xs font-semibold text-slate-400">0</span>
			)}
		</span>
	);
}

/** Tiga kotak urutan: bilangan sebelum, bilangan yang diketahui, dan sesudahnya. */
function StripUrutan({
	nilai,
	arah,
}: {
	nilai: number;
	arah: "sebelum" | "sesudah";
}) {
	const kotak = [
		{
			kunci: "sebelum" as const,
			isi: arah === "sebelum" ? "?" : String(nilai - 1),
		},
		{ kunci: "kini" as const, isi: String(nilai) },
		{
			kunci: "sesudah" as const,
			isi: arah === "sesudah" ? "?" : String(nilai + 1),
		},
	];

	return (
		<figure>
			<div aria-hidden="true" className="flex items-center gap-2">
				{kotak.map((butir) => {
					const ditanya = butir.kunci === arah;
					return (
						<span
							key={butir.kunci}
							className={
								ditanya
									? "flex h-12 min-w-16 items-center justify-center rounded-lg border-2 border-dashed border-[#8b5cf6] bg-purple-50 text-lg font-bold text-[#8b5cf6]"
									: "flex h-12 min-w-16 items-center justify-center rounded-lg bg-slate-50 text-lg font-bold text-slate-800"
							}
						>
							{butir.isi}
						</span>
					);
				})}
			</div>
			<figcaption className="mt-2 text-[11px] leading-relaxed text-slate-500">
				Gambar: tiga kotak berurutan berisi bilangan sebelum {nilai}, bilangan{" "}
				{nilai}, dan bilangan sesudah {nilai}. Kotak bergaris putus-putus adalah
				bilangan yang ditanyakan.
			</figcaption>
		</figure>
	);
}

/** Dua bilangan sebagai blok nilai tempat, dengan titik dan simbol sejajar presisi. */
function BlokOperasi({
	a,
	b,
	operator,
}: {
	a: number;
	b: number;
	operator: "+" | "-";
}) {
	return (
		<figure>
			<div
				aria-hidden="true"
				className="flex flex-wrap items-center gap-2.5 py-1"
			>
				<NilaiBlok nilai={a} />
				<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-2xl font-bold text-slate-700 shadow-2xs">
					{operator}
				</span>
				<NilaiBlok nilai={b} />
				<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-2xl font-bold text-slate-700 shadow-2xs">
					=
				</span>
				<span className="flex h-12 min-w-14 items-center justify-center rounded-xl border-2 border-dashed border-[#8b5cf6] bg-purple-50 px-3 text-2xl font-bold text-[#8b5cf6]">
					?
				</span>
			</div>
			<figcaption className="mt-2 text-[11px] leading-relaxed text-slate-500">
				Gambar: {a} adalah {Math.floor(a / 10)} batang puluhan dan {a % 10}{" "}
				titik satuan, {operator === "+" ? "ditambah" : "dikurangi"} {b} yang
				berupa {Math.floor(b / 10)} batang puluhan dan {b % 10} titik satuan.
				Satu batang bernilai 10 dan satu titik bernilai 1.
			</figcaption>
		</figure>
	);
}

/** Visual soal latihan untuk semua level (S-21), tanpa membocorkan jawaban. */
export function VisualSoal({ soal }: { soal: Soal }) {
	if (soal.visual?.tipe === "titik") {
		return <TitikHitung jumlah={soal.visual.jumlah} />;
	}
	if (soal.level === 2 && soal.nilaiA !== undefined) {
		return (
			<StripUrutan
				nilai={soal.nilaiA}
				arah={soal.jawaban < soal.nilaiA ? "sebelum" : "sesudah"}
			/>
		);
	}
	if (soal.operator && soal.nilaiA !== undefined && soal.nilaiB !== undefined) {
		return (
			<BlokOperasi a={soal.nilaiA} b={soal.nilaiB} operator={soal.operator} />
		);
	}
	return null;
}
