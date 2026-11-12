/**
 * Isi materi Level 1-6 sesuai PRD bab 4. Setiap rumus dipecah menjadi beberapa
 * bagian agar dapat dinavigasi satu per satu (S-13) dan dirender sebagai
 * MathML (S-12), bukan gambar.
 */
export type BagianRumus = {
	/** Nama bagian yang dibacakan pembaca layar, mis. "Bilangan pertama". */
	label: string;
	/** Teks setara, mis. "8". */
	nilai: string;
	/** Potongan MathML untuk bagian ini. */
	mathml: string;
};

export type LangkahContoh = {
	judul: string;
	isi: string;
};

export type VisualLevel =
	| { tipe: "titik"; jumlah: number }
	| { tipe: "garis"; mulai: number; akhir: number; tanda: number[] };

export type Level = {
	id: number;
	judul: string;
	topik: string;
	contoh: string;
	penjelasan: string[];
	rumus: { keterangan: string; bagian: BagianRumus[] };
	visual: VisualLevel;
	/** Padanan teks untuk visual (N-07). */
	alternatifVisual: string;
	langkah: LangkahContoh[];
};

const math = (isi: string) => `<math display="inline">${isi}</math>`;

export const LEVEL: Level[] = [
	{
		id: 1,
		judul: "Mengenal dan menyebut bilangan 0-10",
		topik: "Bilangan 0 sampai 10",
		contoh: "Tunjukkan angka 7",
		penjelasan: [
			"Setiap bilangan punya lambang dan jumlah benda. Angka 1 berarti satu benda, angka 2 berarti dua benda, dan seterusnya sampai 10.",
			"Menghitung berarti menyebut bilangan satu per satu untuk setiap benda. Hitung dari kiri ke kanan dan berhenti setelah benda terakhir.",
		],
		rumus: {
			keterangan: "Contoh lambang bilangan dan jumlah benda",
			bagian: [
				{ label: "Lambang bilangan", nilai: "7", mathml: math("<mn>7</mn>") },
				{ label: "Jumlah benda", nilai: "7 benda", mathml: math("<mn>7</mn>") },
			],
		},
		visual: { tipe: "titik", jumlah: 7 },
		alternatifVisual:
			"Tujuh titik tersusun dua baris: empat titik di baris atas dan tiga titik di baris bawah.",
		langkah: [
			{
				judul: "Lihat bendanya",
				isi: "Ada deretan titik. Hitung satu per satu dari kiri ke kanan.",
			},
			{
				judul: "Sebut bilangannya",
				isi: "Titik pertama disebut satu, titik kedua disebut dua, lalu lanjutkan.",
			},
			{
				judul: "Berhenti di benda terakhir",
				isi: "Setelah titik terakhir, bilangan yang terakhir disebut adalah jumlah benda.",
			},
			{
				judul: "Cocokkan dengan lambang",
				isi: "Tujuh benda ditulis dengan lambang angka 7.",
			},
		],
	},
	{
		id: 2,
		judul: "Bilangan 11-100 dan urutannya",
		topik: "Bilangan 11 sampai 100",
		contoh: "Angka setelah 49",
		penjelasan: [
			"Bilangan 11 sampai 100 dibentuk dari puluhan dan satuan. Pada 49, angka 4 adalah puluhan (empat puluh) dan angka 9 adalah satuan (sembilan).",
			"Urutan bilangan naik satu setiap langkah, kecuali saat satuan berubah dari 9 menjadi 0 lalu puluhannya bertambah. Karena itu angka setelah 49 adalah 50.",
		],
		rumus: {
			keterangan: "Sifat urutan bilangan",
			bagian: [
				{
					label: "Bilangan sepuluh kurangnya",
					nilai: "49",
					mathml: math("<mn>49</mn>"),
				},
				{
					label: "Tanda urutan",
					nilai: "kurang dari",
					mathml: math("<mo>&lt;</mo>"),
				},
				{
					label: "Bilangan setelahnya",
					nilai: "50",
					mathml: math("<mn>50</mn>"),
				},
			],
		},
		visual: { tipe: "garis", mulai: 40, akhir: 60, tanda: [49, 50] },
		alternatifVisual:
			"Garis bilangan 40 sampai 60. Dua bilangan ditandai: 49 dan 50.",
		langkah: [
			{
				judul: "Baca puluhannya",
				isi: "49 berarti empat puluhan dan sembilan satuan.",
			},
			{
				judul: "Periksa satuannya",
				isi: "Satuannya 9, yaitu satuan terbesar sebelum berubah.",
			},
			{
				judul: "Naik satu satuan",
				isi: "Setelah satuan 9, satuan kembali ke 0 dan puluhan bertambah satu.",
			},
			{
				judul: "Tulis hasilnya",
				isi: "4 puluhan menjadi 5 puluhan, jadi bilangan setelah 49 adalah 50.",
			},
		],
	},
	{
		id: 3,
		judul: "Penjumlahan sampai 20",
		topik: "Penjumlahan hasil maksimal 20",
		contoh: "8 + 7",
		penjelasan: [
			"Menjumlahkan berarti menggabungkan dua kelompok benda, lalu menghitung seluruhnya. Hasil penjumlahan pada level ini tidak lebih dari 20.",
			"Cara termudah adalah mulai dari bilangan yang lebih besar, lalu tambahkan bilangan kedua satu per satu di garis bilangan.",
		],
		rumus: {
			keterangan: "Penjumlahan delapan ditambah tujuh",
			bagian: [
				{ label: "Bilangan pertama", nilai: "8", mathml: math("<mn>8</mn>") },
				{ label: "Operator", nilai: "tambah", mathml: math("<mo>+</mo>") },
				{ label: "Bilangan kedua", nilai: "7", mathml: math("<mn>7</mn>") },
				{ label: "Hasil", nilai: "15", mathml: math("<mn>15</mn>") },
			],
		},
		visual: { tipe: "garis", mulai: 0, akhir: 20, tanda: [8, 15] },
		alternatifVisual:
			"Garis bilangan 0 sampai 20. Penanda di 8 adalah titik awal, penanda di 15 adalah hasil.",
		langkah: [
			{
				judul: "Mulai dari bilangan besar",
				isi: "Mulai di 8 pada garis bilangan.",
			},
			{
				judul: "Lompat satu per satu",
				isi: "Lompat tujuh kali ke kanan: 9, 10, 11, 12, 13, 14, 15.",
			},
			{
				judul: "Berhenti di lompatan terakhir",
				isi: "Lompatan ketujuh berhenti di 15.",
			},
			{ judul: "Baca hasilnya", isi: "8 + 7 = 15." },
		],
	},
	{
		id: 4,
		judul: "Pengurangan sampai 20",
		topik: "Pengurangan bilangan sampai 20",
		contoh: "15 - 6",
		penjelasan: [
			"Mengurangi berarti mengambil sebagian benda dari satu kelompok, lalu menghitung sisanya.",
			"Pada garis bilangan, pengurangan bergerak ke kiri. Mulai dari bilangan pertama, lalu melompat ke kiri sebanyak bilangan kedua.",
		],
		rumus: {
			keterangan: "Pengurangan lima belas dikurangi enam",
			bagian: [
				{ label: "Bilangan pertama", nilai: "15", mathml: math("<mn>15</mn>") },
				{
					label: "Operator",
					nilai: "kurang",
					mathml: math("<mo>&minus;</mo>"),
				},
				{ label: "Bilangan kedua", nilai: "6", mathml: math("<mn>6</mn>") },
				{ label: "Hasil", nilai: "9", mathml: math("<mn>9</mn>") },
			],
		},
		visual: { tipe: "garis", mulai: 0, akhir: 20, tanda: [9, 15] },
		alternatifVisual:
			"Garis bilangan 0 sampai 20. Penanda di 15 adalah titik awal, penanda di 9 adalah hasil.",
		langkah: [
			{
				judul: "Mulai dari bilangan pertama",
				isi: "Berdiri di 15 pada garis bilangan.",
			},
			{
				judul: "Melompat ke kiri",
				isi: "Lompat enam kali ke kiri: 14, 13, 12, 11, 10, 9.",
			},
			{
				judul: "Berhenti di lompatan terakhir",
				isi: "Lompatan keenam berhenti di 9.",
			},
			{ judul: "Baca hasilnya", isi: "15 - 6 = 9." },
		],
	},
	{
		id: 5,
		judul: "Penjumlahan dan pengurangan sampai 100 tanpa menyimpan",
		topik: "Bilangan sampai 100 tanpa menyimpan atau meminjam",
		contoh: "45 + 32",
		penjelasan: [
			"Untuk bilangan dua angka, hitung satuan lebih dulu, lalu puluhan. Pada 45 + 32, satuan 5 + 2 = 7 dan puluhan 4 + 3 = 7.",
			"Disebut tanpa menyimpan karena hasil satuan tidak lebih dari 9, sehingga tidak ada tambahan ke puluhan.",
		],
		rumus: {
			keterangan:
				"Penjumlahan bersusun empat puluh lima ditambah tiga puluh dua",
			bagian: [
				{ label: "Bilangan pertama", nilai: "45", mathml: math("<mn>45</mn>") },
				{ label: "Operator", nilai: "tambah", mathml: math("<mo>+</mo>") },
				{ label: "Bilangan kedua", nilai: "32", mathml: math("<mn>32</mn>") },
				{ label: "Hasil", nilai: "77", mathml: math("<mn>77</mn>") },
			],
		},
		visual: { tipe: "garis", mulai: 40, akhir: 80, tanda: [45, 77] },
		alternatifVisual:
			"Garis bilangan 40 sampai 80. Penanda di 45 adalah titik awal, penanda di 77 adalah hasil.",
		langkah: [
			{ judul: "Hitung satuan", isi: "5 + 2 = 7. Tulis 7 pada tempat satuan." },
			{
				judul: "Hitung puluhan",
				isi: "4 + 3 = 7. Tulis 7 pada tempat puluhan.",
			},
			{ judul: "Gabungkan", isi: "7 puluhan dan 7 satuan menjadi 77." },
			{
				judul: "Periksa",
				isi: "45 + 32 = 77. Tidak ada angka yang disimpan karena satuan tidak melewati 9.",
			},
		],
	},
	{
		id: 6,
		judul:
			"Penjumlahan dan pengurangan sampai 100 dengan menyimpan atau meminjam",
		topik: "Menyimpan dan meminjam pada bilangan sampai 100",
		contoh: "38 + 27",
		penjelasan: [
			"Saat satuan berjumlah 10 atau lebih, kita menyimpan satu puluhan ke tempat puluhan. Pada 38 + 27, satuan 8 + 7 = 15.",
			"Tulis 5 pada satuan dan simpan 1 puluhan. Lalu jumlahkan puluhan beserta simpanan: 3 + 2 + 1 = 6.",
		],
		rumus: {
			keterangan:
				"Penjumlahan bersusun tiga puluh delapan ditambah dua puluh tujuh",
			bagian: [
				{ label: "Bilangan pertama", nilai: "38", mathml: math("<mn>38</mn>") },
				{ label: "Operator", nilai: "tambah", mathml: math("<mo>+</mo>") },
				{ label: "Bilangan kedua", nilai: "27", mathml: math("<mn>27</mn>") },
				{ label: "Hasil", nilai: "65", mathml: math("<mn>65</mn>") },
			],
		},
		visual: { tipe: "garis", mulai: 30, akhir: 70, tanda: [38, 65] },
		alternatifVisual:
			"Garis bilangan 30 sampai 70. Penanda di 38 adalah titik awal, penanda di 65 adalah hasil.",
		langkah: [
			{
				judul: "Jumlahkan satuan",
				isi: "8 + 7 = 15. Tulis 5, simpan 1 puluhan.",
			},
			{
				judul: "Jumlahkan puluhan",
				isi: "3 + 2 = 5, lalu tambahkan 1 simpanan menjadi 6.",
			},
			{ judul: "Gabungkan", isi: "6 puluhan dan 5 satuan menjadi 65." },
			{
				judul: "Periksa",
				isi: "38 + 27 = 65. Hasil masuk akal karena mendekati 40 + 30 = 70.",
			},
		],
	},
	{
		id: 7,
		judul: "Aljabar Sederhana (Persamaan Satu Variabel)",
		topik: "Aljabar & Persamaan Linear (SMP)",
		contoh: "2x + 6 = 16",
		penjelasan: [
			"Persamaan linear satu variabel adalah persamaan dengan satu variabel berpangkat satu yang dihubungkan tanda sama dengan (=).",
			"Untuk mencari nilai x, lakukan operasi berkebalikan: kurangkan atau tambahkan konstanta pada kedua ruas, lalu bagi dengan koefisien di depan x.",
		],
		rumus: {
			keterangan: "Penyelesaian persamaan linear 2x + 6 = 16",
			bagian: [
				{ label: "Suku aljabar", nilai: "2x", mathml: math("<mn>2</mn><mi>x</mi>") },
				{ label: "Operator", nilai: "tambah", mathml: math("<mo>+</mo>") },
				{ label: "Konstanta", nilai: "6", mathml: math("<mn>6</mn>") },
				{ label: "Sama dengan", nilai: "sama dengan", mathml: math("<mo>=</mo>") },
				{ label: "Ruas kanan", nilai: "16", mathml: math("<mn>16</mn>") },
				{ label: "Nilai x", nilai: "x = 5", mathml: math("<mo>&rArr;</mo><mi>x</mi><mo>=</mo><mn>5</mn>") },
			],
		},
		visual: { tipe: "garis", mulai: 0, akhir: 20, tanda: [6, 16] },
		alternatifVisual:
			"Garis bilangan 0 sampai 20 dengan penanda pada angka 6 dan 16.",
		langkah: [
			{
				judul: "Kurangkan konstanta",
				isi: "Kurangkan kedua ruas dengan 6: 2x = 16 - 6, maka 2x = 10.",
			},
			{
				judul: "Bagi koefisien",
				isi: "Bagi kedua ruas dengan 2: x = 10 ÷ 2.",
			},
			{
				judul: "Dapatkan hasil",
				isi: "x = 5.",
			},
			{
				judul: "Uji jawaban",
				isi: "Masukkan x = 5 ke persamaan: 2(5) + 6 = 10 + 6 = 16 (Tepat).",
			},
		],
	},
	{
		id: 8,
		judul: "Rumus Bangun Datar (Luas & Keliling)",
		topik: "Geometri Datar SMP (Segitiga & Segiempat)",
		contoh: "L = (a × t) ÷ 2",
		penjelasan: [
			"Bangun datar memiliki rumus baku. Luas mengukur luas bidang, sedangkan keliling mengukur jumlah panjang sisi-sisinya.",
			"Contoh rumus penting SMP: Luas Segitiga L = (a × t) ÷ 2, Keliling Persegi Panjang K = 2 × (p + l), dan Luas Jajar Genjang L = a × t.",
		],
		rumus: {
			keterangan: "Rumus luas segitiga dengan alas 8 cm dan tinggi 5 cm",
			bagian: [
				{ label: "Variabel Luas", nilai: "L", mathml: math("<mi>L</mi><mo>=</mo>") },
				{ label: "Operasi rumus", nilai: "(8 × 5) / 2", mathml: math("<mfrac><mrow><mn>8</mn><mo>&times;</mo><mn>5</mn></mrow><mn>2</mn></mfrac>") },
				{ label: "Hasil", nilai: "20", mathml: math("<mo>=</mo><mn>20</mn>") },
			],
		},
		visual: { tipe: "garis", mulai: 0, akhir: 40, tanda: [8, 20, 40] },
		alternatifVisual:
			"Garis bilangan 0 sampai 40 dengan penanda pada hasil luas 20.",
		langkah: [
			{
				judul: "Perhatikan rumus",
				isi: "Luas segitiga L = (a × t) ÷ 2.",
			},
			{
				judul: "Substitusi angka",
				isi: "Masukkan alas a = 8 dan tinggi t = 5.",
			},
			{
				judul: "Hitung perkalian",
				isi: "8 × 5 = 40.",
			},
			{
				judul: "Bagi dua",
				isi: "40 ÷ 2 = 20. Luas segitiga adalah 20 cm².",
			},
		],
	},
	{
		id: 9,
		judul: "Teorema Pythagoras & Pangkat Kuadrat",
		topik: "Pythagoras & Kuadrat SMP",
		contoh: "c = √(a² + b²)",
		penjelasan: [
			"Teorema Pythagoras menyatakan pada segitiga siku-siku, kuadrat sisi miring sama dengan jumlah kuadrat sisi tegak: c² = a² + b².",
			"Panjang sisi miring dihitung dengan menarik akar: c = √(a² + b²). Pasangan tripel umum: (3, 4, 5) dan (6, 8, 10).",
		],
		rumus: {
			keterangan: "Mencari sisi miring segitiga siku-siku berukuran 6 dan 8",
			bagian: [
				{ label: "Sisi miring", nilai: "c", mathml: math("<mi>c</mi><mo>=</mo>") },
				{ label: "Operasi akar", nilai: "√(6² + 8²)", mathml: math("<msqrt><mrow><msup><mn>6</mn><mn>2</mn></msup><mo>+</mo><msup><mn>8</mn><mn>2</mn></msup></mrow></msqrt>") },
				{ label: "Jumlah kuadrat", nilai: "√100", mathml: math("<mo>=</mo><msqrt><mn>100</mn></msqrt>") },
				{ label: "Hasil akhir", nilai: "10", mathml: math("<mo>=</mo><mn>10</mn>") },
			],
		},
		visual: { tipe: "garis", mulai: 0, akhir: 20, tanda: [6, 8, 10] },
		alternatifVisual:
			"Garis bilangan 0 sampai 20 dengan tripel Pythagoras 6, 8, dan 10.",
		langkah: [
			{
				judul: "Kuadratkan sisi-sisi tegak",
				isi: "6² = 36 dan 8² = 64.",
			},
			{
				judul: "Jumlahkan hasil kuadrat",
				isi: "36 + 64 = 100.",
			},
			{
				judul: "Tarik akar kuadrat",
				isi: "c = √100 = 10.",
			},
			{
				judul: "Hasil",
				isi: "Panjang sisi miring segitiga siku-siku adalah 10.",
			},
		],
	},
];

export function levelById(id: number): Level | undefined {
	return LEVEL.find((level) => level?.id === id);
}
