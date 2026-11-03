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
];

export function levelById(id: number): Level | undefined {
	return LEVEL.find((level) => level.id === id);
}
