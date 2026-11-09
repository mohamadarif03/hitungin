import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Siswa = {
	nama: string;
	kelas: string;
	kodeKelas?: string;
};

export type Akun = Siswa & {
	pin: string;
	kodePemulihan: string;
};

type Hasil = { ok: boolean; pesan?: string };

type AuthState = {
	siswa: Siswa | null;
	akun: Record<string, Akun>;
	gagal: Record<string, number>;
	masuk: (nama: string, pin: string, kodeKelas?: string) => Hasil;
	daftar: (data: {
		nama: string;
		kelas: string;
		pin: string;
		kodeKelas?: string;
	}) => Hasil & {
		kode?: string;
	};
	pulihkan: (data: { nama: string; kode: string; pin: string }) => Hasil;
	keluar: () => void;
};

/** Setelah lima PIN salah, akun dikunci sampai PIN dipulihkan (N-50). */
const MAKS_GAGAL = 5;
const kunci = (nama: string) => nama.trim().toLowerCase();

export function buatKodePemulihan() {
	const huruf = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	const blok = Array.from({ length: 3 }, () =>
		Array.from(
			{ length: 4 },
			() => huruf[Math.floor(Math.random() * huruf.length)],
		).join(""),
	);
	return blok.join("-");
}

/**
 * Akun siswa disimpan di perangkat untuk pengembangan antarmuka. Verifikasi PIN
 * di server, hash PIN, dan pembatasan percobaan lintas perangkat dikerjakan
 * backend sesuai N-50.
 */
export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			siswa: null,
			akun: {},
			gagal: {},
			masuk: (nama, pin, kodeKelas) => {
				const id = kunci(nama);
				const akun = get().akun[id];
				if (!akun) {
					return {
						ok: false,
						pesan:
							"Nama ini belum terdaftar di perangkat ini. Pilih Buat akun baru.",
					};
				}
				if ((get().gagal[id] ?? 0) >= MAKS_GAGAL) {
					return {
						ok: false,
						pesan:
							"Percobaan masuk terlalu sering. Buat PIN baru dengan kode pemulihan.",
					};
				}
				if (akun.pin !== pin) {
					const sisa = MAKS_GAGAL - ((get().gagal[id] ?? 0) + 1);
					set((state) => ({
						gagal: { ...state.gagal, [id]: (state.gagal[id] ?? 0) + 1 },
					}));
					return {
						ok: false,
						pesan:
							sisa > 0
								? `PIN belum cocok. Sisa ${sisa} percobaan sebelum akun dikunci sementara.`
								: "PIN belum cocok. Akun dikunci sementara; buat PIN baru dengan kode pemulihan.",
					};
				}
				set((state) => ({
					siswa: {
						nama: akun.nama,
						kelas: akun.kelas,
						kodeKelas: kodeKelas ? kodeKelas.trim() : akun.kodeKelas,
					},
					gagal: { ...state.gagal, [id]: 0 },
				}));
				return { ok: true };
			},
			daftar: ({ nama, kelas, pin, kodeKelas }) => {
				const id = kunci(nama);
				if (get().akun[id]) {
					return {
						ok: false,
						pesan:
							"Nama ini sudah terdaftar. Masuk dengan PIN, atau pilih Lupa PIN.",
					};
				}
				const kode = buatKodePemulihan();
				const siswa = {
					nama: nama.trim(),
					kelas: kelas.trim(),
					kodeKelas: kodeKelas?.trim(),
				};
				set((state) => ({
					akun: {
						...state.akun,
						[id]: { ...siswa, pin, kodePemulihan: kode },
					},
					siswa,
					gagal: { ...state.gagal, [id]: 0 },
				}));
				return { ok: true, kode };
			},
			pulihkan: ({ nama, kode, pin }) => {
				const id = kunci(nama);
				const akun = get().akun[id];
				if (!akun) {
					return {
						ok: false,
						pesan: "Nama ini belum terdaftar di perangkat ini.",
					};
				}
				if (akun.kodePemulihan !== kode.trim().toUpperCase()) {
					return {
						ok: false,
						pesan:
							"Kode pemulihan tidak cocok. Periksa kembali huruf dan tanda hubungnya.",
					};
				}
				set((state) => ({
					akun: { ...state.akun, [id]: { ...akun, pin } },
					siswa: { nama: akun.nama, kelas: akun.kelas },
					gagal: { ...state.gagal, [id]: 0 },
				}));
				return { ok: true };
			},
			keluar: () => set({ siswa: null }),
		}),
		{
			name: "hitungin-sesi-siswa",
			version: 2,
			migrate: (persisted, versi) =>
				versi < 2
					? { ...(persisted as AuthState), siswa: null, akun: {}, gagal: {} }
					: (persisted as AuthState),
		},
	),
);
