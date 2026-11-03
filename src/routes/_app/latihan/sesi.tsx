import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SesiLatihan } from "@/components/latihan/sesi-latihan";
import { LEVEL } from "@/datas/consts/level";
import { useLatihanStore } from "@/datas/stores/latihan-store";
import { buatSoal } from "@/lib/soal";

export const Route = createFileRoute("/_app/latihan/sesi")({
	validateSearch: (
		search: Record<string, unknown>,
	): {
		level: number;
		jumlah: number;
		tugasId?: string;
		batasPetunjuk?: number;
	} => {
		const level = Number(search.level);
		const jumlah = Number(search.jumlah);
		const batasPetunjuk = Number(search.batasPetunjuk);
		return {
			level:
				Number.isInteger(level) && level >= 1 && level <= LEVEL.length
					? level
					: 3,
			jumlah:
				Number.isInteger(jumlah) && jumlah > 0 && jumlah <= 20 ? jumlah : 10,
			tugasId: typeof search.tugasId === "string" ? search.tugasId : undefined,
			batasPetunjuk:
				Number.isInteger(batasPetunjuk) && batasPetunjuk > 0
					? batasPetunjuk
					: undefined,
		};
	},
	component: HalamanSesi,
});

function HalamanSesi() {
	const { level, jumlah, tugasId, batasPetunjuk } = Route.useSearch();
	const mulaiSesi = useLatihanStore((state) => state.mulaiSesi);

	// Sesi yang sudah tersimpan dilanjutkan dari soal terakhir (S-20).
	const [data] = useState(() => {
		const tersimpan = useLatihanStore.getState().sesi;
		const cocok =
			tersimpan !== null &&
			tersimpan.level === level &&
			tersimpan.soal.length === jumlah &&
			(tersimpan.tugasId ?? undefined) === tugasId;
		if (cocok && tersimpan) {
			return { daftar: tersimpan.soal, awal: tersimpan.indeks };
		}
		return { daftar: buatSoal(level, jumlah), awal: 0 };
	});

	useEffect(() => {
		mulaiSesi({
			level,
			soal: data.daftar,
			indeks: data.awal,
			tugasId,
			batasPetunjuk,
		});
	}, [data, level, mulaiSesi, tugasId, batasPetunjuk]);

	return (
		<SesiLatihan
			soal={data.daftar}
			level={level}
			indeksAwal={data.awal}
			batasPetunjuk={batasPetunjuk}
			tugasId={tugasId}
			simpan
		/>
	);
}
