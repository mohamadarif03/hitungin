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


/** Level 7: Aljabar linear satu variabel (SMP). */
function soalLevel7(): Soal {
	const jenis = Math.random();
	// Variasi 1: ax + b = c  =>  x = (c - b) / a
	if (jenis < 0.5) {
		const a = acak(2, 5);
		const x = acak(2, 9);
		const b = acak(2, 12);
		const c = a * x + b;
		return {
			id: `L7-${a}x+${b}=${c}-${Math.random().toString(36).slice(2, 7)}`,
			level: 7,
			teks: `Tentukan nilai x dari persamaan rumus: ${a}x + ${b} = ${c}`,
			bagian: [
				{ label: "Suku aljabar", nilai: `${a}x`, mathml: math(`<mn>${a}</mn><mi>x</mi>`) },
				{ label: "Operator", nilai: "ditambah", mathml: math("<mo>+</mo>") },
				{ label: "Konstanta kiri", nilai: String(b), mathml: math(`<mn>${b}</mn>`) },
				{ label: "Sama dengan", nilai: "sama dengan", mathml: math("<mo>=</mo>") },
				{ label: "Ruas kanan", nilai: String(c), mathml: math(`<mn>${c}</mn>`) },
				{ label: "Nilai x dicari", nilai: "x = ?", mathml: math("<mo>&rArr;</mo><mi>x</mi><mo>=</mo><mtext>?</mtext>") },
			],
			jawaban: x,
			nilaiA: a,
			nilaiB: b,
		};
	}
	// Variasi 2: ax - b = c  =>  x = (c + b) / a
	const a = acak(2, 4);
	const x = acak(3, 10);
	const b = acak(1, 9);
	const c = a * x - b;
	return {
		id: `L7-${a}x-${b}=${c}-${Math.random().toString(36).slice(2, 7)}`,
		level: 7,
		teks: `Tentukan nilai x dari persamaan rumus: ${a}x - ${b} = ${c}`,
		bagian: [
			{ label: "Suku aljabar", nilai: `${a}x`, mathml: math(`<mn>${a}</mn><mi>x</mi>`) },
			{ label: "Operator", nilai: "dikurangi", mathml: math("<mo>&minus;</mo>") },
			{ label: "Konstanta kiri", nilai: String(b), mathml: math(`<mn>${b}</mn>`) },
			{ label: "Sama dengan", nilai: "sama dengan", mathml: math("<mo>=</mo>") },
			{ label: "Ruas kanan", nilai: String(c), mathml: math(`<mn>${c}</mn>`) },
			{ label: "Nilai x dicari", nilai: "x = ?", mathml: math("<mo>&rArr;</mo><mi>x</mi><mo>=</mo><mtext>?</mtext>") },
		],
		jawaban: x,
		nilaiA: a,
		nilaiB: b,
	};
}

/** Level 8: Rumus Luas & Keliling Bangun Datar SMP. */
function soalLevel8(): Soal {
	const jenis = Math.random();
	// Variasi 1: Luas Segitiga L = (a * t) / 2
	if (jenis < 0.35) {
		const a = acak(2, 6) * 2; // genap
		const t = acak(3, 9);
		const luas = (a * t) / 2;
		return {
			id: `L8-segitiga-${a}x${t}-${Math.random().toString(36).slice(2, 7)}`,
			level: 8,
			teks: `Hitung Luas segitiga (L) dengan rumus L = (a × t) ÷ 2, jika alas a = ${a} cm dan tinggi t = ${t} cm.`,
			bagian: [
				{ label: "Variabel Luas", nilai: "L", mathml: math("<mi>L</mi><mo>=</mo>") },
				{
					label: "Rumus luas",
					nilai: `(${a} × ${t}) / 2`,
					mathml: math(`<mfrac><mrow><mn>${a}</mn><mo>&times;</mo><mn>${t}</mn></mrow><mn>2</mn></mfrac>`),
				},
				{ label: "Jawaban", nilai: "belum diisi", mathml: math("<mo>=</mo><mtext>?</mtext>") },
			],
			jawaban: luas,
			nilaiA: a,
			nilaiB: t,
		};
	}
	// Variasi 2: Keliling Persegi Panjang K = 2 * (p + l)
	if (jenis < 0.7) {
		const p = acak(6, 14);
		const l = acak(2, 8);
		const k = 2 * (p + l);
		return {
			id: `L8-keliling-${p}+${l}-${Math.random().toString(36).slice(2, 7)}`,
			level: 8,
			teks: `Gunakan rumus K = 2 × (p + l). Jika panjang p = ${p} cm dan lebar l = ${l} cm, berapakah kelilingnya (K)?`,
			bagian: [
				{ label: "Variabel Keliling", nilai: "K", mathml: math("<mi>K</mi><mo>=</mo>") },
				{
					label: "Operasi rumus",
					nilai: `2 × (${p} + ${l})`,
					mathml: math(`<mn>2</mn><mo>&times;</mo><mo>(</mo><mn>${p}</mn><mo>+</mo><mn>${l}</mn><mo>)</mo>`),
				},
				{ label: "Jawaban", nilai: "belum diisi", mathml: math("<mo>=</mo><mtext>?</mtext>") },
			],
			jawaban: k,
			nilaiA: p,
			nilaiB: l,
		};
	}
	// Variasi 3: Luas Jajar Genjang L = a * t
	const a = acak(4, 11);
	const t = acak(3, 8);
	const luas = a * t;
	return {
		id: `L8-jajargenjang-${a}x${t}-${Math.random().toString(36).slice(2, 7)}`,
		level: 8,
		teks: `Sebuah jajar genjang memiliki alas a = ${a} cm dan tinggi t = ${t} cm. Gunakan rumus L = a × t untuk menghitung luasnya!`,
		bagian: [
			{ label: "Variabel Luas", nilai: "L", mathml: math("<mi>L</mi><mo>=</mo>") },
			{
				label: "Operasi rumus",
				nilai: `${a} × ${t}`,
				mathml: math(`<mn>${a}</mn><mo>&times;</mo><mn>${t}</mn>`),
			},
			{ label: "Jawaban", nilai: "belum diisi", mathml: math("<mo>=</mo><mtext>?</mtext>") },
		],
		jawaban: luas,
		nilaiA: a,
		nilaiB: t,
	};
}

/** Level 9: Teorema Pythagoras & Pangkat Kuadrat SMP. */
function soalLevel9(): Soal {
	const tripel = [
		{ a: 3, b: 4, c: 5 },
		{ a: 6, b: 8, c: 10 },
		{ a: 5, b: 12, c: 13 },
		{ a: 9, b: 12, c: 15 },
		{ a: 8, b: 15, c: 17 },
	];
	const pilih = tripel[Math.floor(Math.random() * tripel.length)];
	const jenis = Math.random();

	// Variasi 1: Cari sisi miring c = √(a² + b²)
	if (jenis < 0.6) {
		return {
			id: `L9-pythagoras-${pilih.a}-${pilih.b}-${Math.random().toString(36).slice(2, 7)}`,
			level: 9,
			teks: `Segitiga siku-siku memiliki sisi tegak a = ${pilih.a} dan b = ${pilih.b}. Hitung sisi miring c dengan rumus Pythagoras: c = √(a² + b²)!`,
			bagian: [
				{ label: "Sisi miring", nilai: "c", mathml: math("<mi>c</mi><mo>=</mo>") },
				{
					label: "Rumus akar kuadrat",
					nilai: `√(${pilih.a}² + ${pilih.b}²)`,
					mathml: math(`<msqrt><mrow><msup><mn>${pilih.a}</mn><mn>2</mn></msup><mo>+</mo><msup><mn>${pilih.b}</mn><mn>2</mn></msup></mrow></msqrt>`),
				},
				{ label: "Hasil", nilai: "belum diisi", mathml: math("<mo>=</mo><mtext>?</mtext>") },
			],
			jawaban: pilih.c,
			nilaiA: pilih.a,
			nilaiB: pilih.b,
		};
	}

	// Variasi 2: Cari sisi tegak b = √(c² - a²)
	return {
		id: `L9-pythagoras-tegak-${pilih.c}-${pilih.a}-${Math.random().toString(36).slice(2, 7)}`,
		level: 9,
		teks: `Segitiga siku-siku memiliki sisi miring c = ${pilih.c} dan alas a = ${pilih.a}. Hitung sisi tegak b dengan rumus b = √(c² - a²)!`,
		bagian: [
			{ label: "Sisi tegak", nilai: "b", mathml: math("<mi>b</mi><mo>=</mo>") },
			{
				label: "Rumus akar kuadrat",
				nilai: `√(${pilih.c}² - ${pilih.a}²)`,
				mathml: math(`<msqrt><mrow><msup><mn>${pilih.c}</mn><mn>2</mn></msup><mo>&minus;</mo><msup><mn>${pilih.a}</mn><mn>2</mn></msup></mrow></msqrt>`),
			},
			{ label: "Hasil", nilai: "belum diisi", mathml: math("<mo>=</mo><mtext>?</mtext>") },
		],
		jawaban: pilih.b,
		nilaiA: pilih.c,
		nilaiB: pilih.a,
	};
}

const PEMBUAT: Record<number, () => Soal> = {
	1: soalLevel1,
	2: soalLevel2,
	3: soalLevel3,
	4: soalLevel4,
	5: soalLevel5,
	6: soalLevel6,
	7: soalLevel7,
	8: soalLevel8,
	9: soalLevel9,
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
		if (soal.level === 7) {
		if (tingkat <= 1)
			return "Pindahkan konstanta ke ruas kanan dengan operasi kebalikannya.";
		if (tingkat === 2)
			return "Selesaikan pengurangan/penjumlahan di ruas kanan, lalu bagi dengan koefisien di depan x.";
		return `Nilai x yang memenuhi persamaan tersebut adalah ${soal.jawaban}.`;
	}
	if (soal.level === 8) {
		if (tingkat <= 1)
			return "Masukkan angka alas, tinggi, atau panjang ke dalam rumus bangun datar.";
		if (tingkat === 2)
			return "Kerjakan operasi perkalian terlebih dahulu, lalu lakukan pembagian jika ada.";
		return `Hasil perhitungan luas atau keliling tersebut adalah ${soal.jawaban}.`;
	}
	if (soal.level === 9) {
		if (tingkat <= 1)
			return "Hitung nilai kuadrat masing-masing sisi tegak terlebih dahulu.";
		if (tingkat === 2)
			return "Jumlahkan atau kurangkan hasil kuadratnya, lalu tarik akar kuadratnya.";
		return `Hasil perhitungan rumus Pythagoras tersebut adalah ${soal.jawaban}.`;
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
