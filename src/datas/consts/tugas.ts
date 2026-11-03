/**
 * Tugas dari guru masih berupa data contoh karena peran guru belum masuk versi
 * pertama PRD. Struktur ini mengikuti pengaturan yang dipakai menu Latihan:
 * level, jumlah soal, dan batas petunjuk.
 */
export type Tugas = {
	id: string;
	judul: string;
	guru: string;
	level: number;
	jumlahSoal: number;
	batasPetunjuk: number;
	tenggat: string;
	catatanGuru: string;
};

export const TUGAS: Tugas[] = [
	{
		id: "tugas-penjumlahan-20",
		judul: "Latihan Penjumlahan sampai 20",
		guru: "Bu Ratna, SLB Negeri 1",
		level: 3,
		jumlahSoal: 10,
		batasPetunjuk: 3,
		tenggat: "7 November 2026",
		catatanGuru:
			"Kerjakan tanpa terburu-buru. Kalau perlu, pakai garis bilangan di halaman materi sebelum menjawab.",
	},
	{
		id: "tugas-pengurangan-20",
		judul: "Pengurangan sampai 20",
		guru: "Bu Ratna, SLB Negeri 1",
		level: 4,
		jumlahSoal: 5,
		batasPetunjuk: 1,
		tenggat: "7 November 2026",
		catatanGuru:
			"Coba jawab tanpa petunjuk dulu. Petunjuk hanya boleh dipakai satu kali per soal.",
	},
	{
		id: "tugas-bilangan-11-100",
		judul: "Urutan Bilangan 11-100",
		guru: "Pak Dedi, Kelas Inklusif 4",
		level: 2,
		jumlahSoal: 8,
		batasPetunjuk: 3,
		tenggat: "10 November 2026",
		catatanGuru:
			"Bacakan soalnya dengan tombol Dengarkan bila lebih nyaman. Tidak ada batas waktu.",
	},
];

export function tugasById(id: string): Tugas | undefined {
	return TUGAS.find((tugas) => tugas.id === id);
}
