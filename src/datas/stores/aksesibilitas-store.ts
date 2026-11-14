import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UkuranTeks = "normal" | "besar" | "sangat-besar";

type AksesibilitasState = {
	ukuranTeks: UkuranTeks;
	kontrasTinggi: boolean;
	suaraOtomatis: boolean;
	setUkuranTeks: (ukuran: UkuranTeks) => void;
	setKontrasTinggi: (aktif: boolean) => void;
	toggleKontrasTinggi: () => void;
	toggleSuaraOtomatis: () => void;
};

export const useAksesibilitasStore = create<AksesibilitasState>()(
	persist(
		(set) => ({
			ukuranTeks: "normal",
			kontrasTinggi: false,
			suaraOtomatis: false,
			setUkuranTeks: (ukuranTeks) => set({ ukuranTeks }),
			setKontrasTinggi: (kontrasTinggi) => set({ kontrasTinggi }),
			toggleKontrasTinggi: () =>
				set((state) => ({ kontrasTinggi: !state.kontrasTinggi })),
			toggleSuaraOtomatis: () =>
				set((state) => ({ suaraOtomatis: !state.suaraOtomatis })),
		}),
		{
			name: "hitungin-aksesibilitas",
		},
	),
);
