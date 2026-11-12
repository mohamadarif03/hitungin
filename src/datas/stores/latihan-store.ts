import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Soal } from "@/lib/soal";

export type SesiAktif = {
	level: number;
	soal: Soal[];
	indeks: number;
	tugasId?: string;
	batasPetunjuk?: number;
};

export type Riwayat = {
	id: string;
	level: number;
	benar: number;
	total: number;
	soalSalah: { teks: string; jawaban: number }[];
	waktu: string;
	tugasId?: string;
	/** Jumlah petunjuk yang dipakai sepanjang sesi (S-29). */
	petunjuk?: number;
};

/** Penandaan hasil pengenalan yang keliru (S-35, N-52). */
export type Penandaan = {
	id: string;
	waktu: string;
	soalId: string;
	level: number;
	terbaca: number;
};

type LatihanState = {
	riwayat: Riwayat[];
	sesi: SesiAktif | null;
	penandaan: Penandaan[];
	mulaiSesi: (sesi: SesiAktif) => void;
	perbaruiIndeks: (indeks: number) => void;
	akhiriSesi: (riwayat: Riwayat) => void;
	hapusSesi: () => void;
	catatPenandaan: (penandaan: Penandaan) => void;
};

/**
 * Progres latihan disimpan di perangkat (belum ada backend). Data ini hanya
 * milik siswa yang sedang masuk di perangkat tersebut (N-51).
 */
export const useLatihanStore = create<LatihanState>()(
	persist(
		(set) => ({
			riwayat: [],
			sesi: null,
			penandaan: [],
			mulaiSesi: (sesi) => set({ sesi }),
			perbaruiIndeks: (indeks) =>
				set((state) =>
					state.sesi ? { sesi: { ...state.sesi, indeks } } : state,
				),
			akhiriSesi: (riwayat) =>
				set((state) => ({
					riwayat: [riwayat, ...state.riwayat].slice(0, 50),
					sesi: null,
				})),
			hapusSesi: () => set({ sesi: null }),
			catatPenandaan: (penandaan) =>
				set((state) => ({
					penandaan: [penandaan, ...state.penandaan].slice(0, 100),
				})),
		}),
		{ name: "hitungin-progres-latihan" },
	),
);

export function akurasiLevel(riwayat: Riwayat[], level: number): number | null {
	const sesiLevel = riwayat.filter((sesi) => sesi.level === level);
	if (sesiLevel.length === 0) return null;
	const benar = sesiLevel.reduce((jumlah, sesi) => jumlah + sesi.benar, 0);
	const total = sesiLevel.reduce((jumlah, sesi) => jumlah + sesi.total, 0);
	return total === 0 ? null : Math.round((benar / total) * 100);
}

export type StatusLevel = "selesai" | "terbuka" | "terkunci";

/** Level terbuka bila level sebelumnya sudah tuntas (minimal 80 persen akurasi). */
export function statusLevel(riwayat: Riwayat[], level: number): StatusLevel {
	const akurasi = akurasiLevel(riwayat, level);
	if (akurasi !== null && akurasi >= 80) return "selesai";
	return "terbuka";
}
