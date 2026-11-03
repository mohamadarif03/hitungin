import type { BagianRumus } from "@/datas/consts/level";

export type Soal = {
	id: string;
	level: number;
	teks: string;
	bagian: BagianRumus[];
	jawaban: number;
	operator?: "+" | "-";
	nilaiA?: number;
	nilaiB?: number;
	visual?: { tipe: "titik"; jumlah: number };
};

const math = (isi: string) => `<math display="inline">${isi}</math>`;
const acak = (min: number, maks: number) =>
	Math.floor(Math.random() * (maks - min + 1)) + min;

function angka(nilai: number, label: string): BagianRumus {
	return { label, nilai: String(nilai), mathml: math(`<mn>${nilai}</mn>`) };
}

function soalHitung(
	level: number,
	a: number,
	b: number,
	operator: "+" | "-",
): Soal {
	const jawaban = operator === "+" ? a + b : a - b;
	const kata = operator === "+" ? "ditambah" : "dikurangi";
	const simbol = operator === "+" ? "+" : "&minus;";
	return {
		id: `L${level}-${a}${operator}${b}-${Math.random().toString(36).slice(2, 7)}`,
		level,
		teks: `Berapa hasil dari ${a} ${kata} ${b}?`,
		bagian: [
			angka(a, "Bilangan pertama"),
			{ label: "Operator", nilai: kata, mathml: math(`<mo>${simbol}</mo>`) },
			angka(b, "Bilangan kedua"),
			{
				label: "Hasil",
				nilai: "belum diisi",
				mathml: math("<mo>=</mo><mtext>?</mtext>"),
			},
		],
		jawaban,
		operator,
		nilaiA: a,
		nilaiB: b,
	};
}

function soalLevel1(): Soal {
	const jumlah = acak(1, 10);
	return {
		id: `L1-${jumlah}-${Math.random().toString(36).slice(2, 7)}`,
		level: 1,
		teks: `Ada ${jumlah} titik. Berapa jumlah titiknya?`,
		bagian: [],
		jawaban: jumlah,
		visual: { tipe: "titik", jumlah },
	};
}

function soalLevel2(): Soal {
	// Dua variasi: bilangan setelah dan bilangan sebelum.
	if (Math.random() < 0.5) {
		const n = acak(9, 99);
		return {
			id: `L2-${n}-${Math.random().toString(36).slice(2, 7)}`,
			level: 2,
			teks: `Bilangan berapa yang datang setelah ${n}?`,
			bagian: [
				angka(n, "Bilangan yang diketahui"),
				{ label: "Urutan", nilai: "setelah", mathml: math("<mo>&rarr;</mo>") },
				{
					label: "Jawaban",
					nilai: "belum diisi",
					mathml: math("<mtext>?</mtext>"),
				},
			],
			jawaban: n + 1,
			nilaiA: n,
		};
	}
	const n = acak(2, 100);
	return {
		id: `L2-${n}-${Math.random().toString(36).slice(2, 7)}`,
		level: 2,
		teks: `Bilangan berapa yang datang sebelum ${n}?`,
		bagian: [
			angka(n, "Bilangan yang diketahui"),
			{ label: "Urutan", nilai: "sebelum", mathml: math("<mo>&larr;</mo>") },
			{
				label: "Jawaban",
				nilai: "belum diisi",
				mathml: math("<mtext>?</mtext>"),
			},
		],
		jawaban: n - 1,
		nilaiA: n,
	};
}

/** Penjumlahan sampai 20 (level 3). */
function soalLevel3(): Soal {
	const a = acak(2, 13);
	const b = acak(1, Math.max(1, 20 - a));
	return soalHitung(3, a, b, "+");
}

/** Pengurangan sampai 20 (level 4). */
function soalLevel4(): Soal {
	const a = acak(6, 20);
	const b = acak(1, a - 1);
	return soalHitung(4, a, b, "-");
}

/** Level 5: tanpa menyimpan atau meminjam. */
function soalLevel5(): Soal {
	if (Math.random() < 0.5) {
		const satuanA = acak(0, 5);
		const satuanB = acak(0, 9 - satuanA);
		const puluhanA = acak(1, 4);
		const puluhanB = acak(1, 5 - puluhanA);
		const a = puluhanA * 10 + satuanA;
		const b = puluhanB * 10 + satuanB;
		return soalHitung(5, a, b, "+");
	}
	const satuanA = acak(2, 9);
	const satuanB = acak(0, satuanA);
	const puluhanA = acak(2, 9);
	const puluhanB = acak(1, puluhanA - 1);
	const a = puluhanA * 10 + satuanA;
	const b = puluhanB * 10 + satuanB;
	return soalHitung(5, a, b, "-");
}

/** Level 6: penjumlahan dengan menyimpan atau pengurangan dengan meminjam. */
function soalLevel6(): Soal {
	if (Math.random() < 0.5) {
		const satuanA = acak(3, 9);
		const satuanB = acak(10 - satuanA, 9);
		const puluhanA = acak(1, 5);
		const puluhanB = acak(1, 8 - puluhanA);
		const a = puluhanA * 10 + satuanA;
		const b = puluhanB * 10 + satuanB;
		return soalHitung(6, a, b, "+");
	}
	const satuanA = acak(0, 4);
	const satuanB = acak(satuanA + 1, 9);
	const puluhanA = acak(3, 8);
	const puluhanB = acak(1, puluhanA - 1);
	const a = puluhanA * 10 + satuanA;
	const b = puluhanB * 10 + satuanB;
	return soalHitung(6, a, b, "-");
}

const PEMBUAT: Record<number, () => Soal> = {
	1: soalLevel1,
	2: soalLevel2,
	3: soalLevel3,
	4: soalLevel4,
	5: soalLevel5,
	6: soalLevel6,
};

export function buatSoal(level: number, jumlah: number): Soal[] {
	const pembuat = PEMBUAT[level] ?? soalLevel3;
	return Array.from({ length: jumlah }, () => pembuat());
}

/** Penilaian berbasis aturan matematika, bukan model AI (S-28). */
export function nilaiJawaban(soal: Soal, jawaban: number): boolean {
	return Number.isFinite(jawaban) && jawaban === soal.jawaban;
}

/** Petunjuk bertingkat; tingkat 1 dan 2 tidak membocorkan jawaban (S-29). */
export function petunjuk(soal: Soal, tingkat: number): string {
	if (soal.level === 1) {
		if (tingkat <= 1)
			return "Hitung setiap titik satu per satu dari kiri ke kanan.";
		if (tingkat === 2)
			return "Mulai dari satu, lalu naik satu angka setiap titik.";
		return `Jumlah titiknya ${soal.jawaban}. Coba hitung ulang untuk memastikan.`;
	}
	if (soal.level === 2) {
		if (tingkat <= 1)
			return "Perhatikan angka satuannya, lalu ingat urutan bilangan.";
		if (tingkat === 2)
			return `Hitung satu langkah dari ${soal.nilaiA}, ke arah bilangan yang lebih ${soal.teks.includes("sebelum") ? "kecil" : "besar"}.`;
		return `Jawabannya ${soal.jawaban}.`;
	}
	if (soal.operator === "+") {
		if (tingkat <= 1)
			return "Mulai dari bilangan yang lebih besar supaya lebih sedikit melompat.";
		if (tingkat === 2)
			return `Tambahkan ${soal.nilaiB} satu per satu, mulai dari ${soal.nilaiA}. Hitung maju di garis bilangan.`;
		return `${soal.nilaiA} + ${soal.nilaiB} = ${soal.jawaban}. Jawabannya ${soal.jawaban}.`;
	}
	if (tingkat <= 1)
		return "Mulai dari bilangan pertama, karena pengurangan bergerak mundur.";
	if (tingkat === 2)
		return `Kurangi ${soal.nilaiB} satu per satu, mulai dari ${soal.nilaiA}. Hitung mundur di garis bilangan.`;
	return `${soal.nilaiA} - ${soal.nilaiB} = ${soal.jawaban}. Jawabannya ${soal.jawaban}.`;
}
