import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	Hand,
	Keyboard,
	Mic,
	PenTool,
	ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { useAuthStore } from "@/datas/stores/auth-store";

export const Route = createFileRoute("/masuk")({
	component: HalamanMasuk,
});

type Mode = "masuk" | "daftar" | "pulihkan";

const JALUR = [
	{
		ikon: Mic,
		label: "Suara",
		cara: "Ucapkan angkanya, tanpa menyentuh layar.",
	},
	{
		ikon: Hand,
		label: "Isyarat angka",
		cara: "Tunjukkan jumlahnya dengan jari di depan kamera.",
	},
	{
		ikon: PenTool,
		label: "Tulisan",
		cara: "Tulis jawaban dengan jari pada kanvas.",
	},
	{
		ikon: Keyboard,
		label: "Papan ketik",
		cara: "Ketik angkanya bila kamera atau mikrofon tidak ada.",
	},
];

const JUDUL: Record<Mode, string> = {
	masuk: "Masuk",
	daftar: "Buat akun",
	pulihkan: "Pulihkan PIN",
};

const KETERANGAN: Record<Mode, string> = {
	masuk: "Progres materi, latihan, dan tugasmu tersimpan di akun ini.",
	daftar:
		"Tentukan nama dan PIN yang mudah kamu ingat. Kode pemulihan muncul sekali, jadi catat.",
	pulihkan:
		"Masukkan kode pemulihan yang kamu catat saat mendaftar, lalu buat PIN baru.",
};

function HalamanMasuk() {
	const siswa = useAuthStore((state) => state.siswa);
	const masuk = useAuthStore((state) => state.masuk);
	const daftarAkun = useAuthStore((state) => state.daftar);
	const pulihkanPin = useAuthStore((state) => state.pulihkan);
	const navigate = useNavigate();
	const [mode, setMode] = useState<Mode>("masuk");
	const [nama, setNama] = useState("");
	const [kelas, setKelas] = useState("");
	const [kodeKelas, setKodeKelas] = useState("");
	const [pin, setPin] = useState("");
	const [kode, setKode] = useState("");
	const [galat, setGalat] = useState<Record<string, string>>({});
	const [kodePemulihan, setKodePemulihan] = useState("");
	const judulRef = useRef<HTMLHeadingElement>(null);

	useEffect(() => {
		if (siswa && kodePemulihan === "")
			navigate({ to: "/beranda", replace: true });
	}, [siswa, kodePemulihan, navigate]);

	// Kode pemulihan hanya tampil sekali: pindahkan fokus ke judul agar pembaca
	// layar langsung membacakan hasil pembuatan akun.
	useEffect(() => {
		if (kodePemulihan) judulRef.current?.focus();
	}, [kodePemulihan]);

	function gantiMode(berikutnya: Mode) {
		setMode(berikutnya);
		setGalat({});
		setPin("");
		setKode("");
	}

	function kirim(peristiwa: React.FormEvent<HTMLFormElement>) {
		peristiwa.preventDefault();

		if (mode === "masuk") {
			setGalat({});
			masuk(nama.trim() || "Siswa", pin, kodeKelas.trim());
			navigate({ to: "/", replace: true });
			return;
		}

		const kesalahan: Record<string, string> = {};
		if (nama.trim().length < 2) kesalahan.nama = "Tulis nama minimal 2 huruf.";
		if (mode === "daftar" && kelas.trim().length < 2)
			kesalahan.kelas = "Tulis kelas, misalnya 4 SD Inklusif.";
		if (mode === "pulihkan" && kode.trim().length < 12)
			kesalahan.kode = "Tulis kode pemulihan lengkap, misalnya ABCD-EFGH-JKLM.";
		if (!/^\d{4,6}$/.test(pin))
			kesalahan.pin =
				mode === "pulihkan"
					? "PIN baru harus 4 sampai 6 angka."
					: "PIN harus 4 sampai 6 angka.";
		setGalat(kesalahan);
		if (Object.keys(kesalahan).length > 0) return;

		if (mode === "daftar") {
			const hasil = daftarAkun({
				nama: nama.trim(),
				kelas: kelas.trim(),
				pin,
				kodeKelas: kodeKelas.trim(),
			});
			if (!hasil.ok) {
				setGalat({ umum: hasil.pesan ?? "Belum bisa membuat akun." });
				return;
			}
			if (hasil.kode) setKodePemulihan(hasil.kode);
			return;
		}
		const hasil = pulihkanPin({ nama: nama.trim(), kode, pin });
		if (!hasil.ok)
			setGalat({ umum: hasil.pesan ?? "Belum bisa memulihkan PIN." });
	}

	return (
		<div className="min-h-dvh bg-[#f8f9fb] px-4 py-10 text-slate-700 antialiased sm:px-6 lg:flex lg:flex-col lg:justify-center lg:py-6">
			<div className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[1.1fr_400px] lg:items-start lg:gap-5">
				<Card className="p-6">
					<div className="flex items-center justify-between">
						<Link
							to="/"
							className="inline-flex items-center gap-2.5 hover:opacity-85 transition group"
							title="Kembali ke Halaman Utama"
						>
							<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 group-hover:scale-105 transition">
								<LogoHitungin className="h-6 w-6" />
							</span>
							<span className="text-[15px] font-bold tracking-tight text-slate-800">
								HITUNGIN
							</span>
						</Link>
						<Link
							to="/"
							className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
						>
							&larr; Halaman Utama
						</Link>
					</div>

					<p className="mt-6 max-w-[20ch] text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-slate-800 sm:text-[30px]">
						Matematika, dengan caramu sendiri.
					</p>
					<p className="mt-3 max-w-[44ch] text-[14px] leading-relaxed text-slate-500">
						Satu soal bisa dijawab lewat suara, isyarat angka, tulisan, atau
						papan ketik. Jawaban diperiksa aturan matematika, bukan tebakan.
					</p>

					<div className="mt-5 hidden rounded-xl bg-slate-50 p-4 sm:block">
						<p className="text-[12px] font-semibold text-slate-500">
							Contoh soal, level 3
						</p>
						<p
							role="img"
							aria-label="Dua belas ditambah delapan sama dengan berapa"
							className="mt-1.5 flex items-baseline gap-2.5 text-[28px] font-bold leading-none tracking-[-0.01em] tabular-nums text-slate-800"
						>
							<span>12</span>
							<span className="text-slate-400">+</span>
							<span>8</span>
							<span className="text-slate-400">=</span>
							<span className="text-[#8b5cf6]">?</span>
						</p>
					</div>

					<p className="mt-5 text-[13px] text-slate-500 sm:hidden">
						Suara · Isyarat angka · Tulisan · Papan ketik
					</p>

					<ul className="mt-5 hidden gap-3 sm:grid sm:grid-cols-2">
						{JALUR.map((jalur) => (
							<li key={jalur.label} className="flex gap-2.5">
								<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#8b5cf6]">
									<jalur.ikon className="h-4 w-4" aria-hidden="true" />
								</span>
								<span>
									<span className="block text-[13px] font-bold text-slate-800">
										{jalur.label}
									</span>
									<span className="mt-0.5 block text-[13px] leading-relaxed text-slate-500">
										{jalur.cara}
									</span>
								</span>
							</li>
						))}
					</ul>

					<p className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-4 text-[13px] leading-relaxed text-slate-500">
						<ShieldCheck
							className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
							aria-hidden="true"
						/>
						Tidak ada rekaman yang disimpan, dan progresmu hanya bisa dilihat
						oleh akunmu sendiri.
					</p>
				</Card>

				<Card className="p-6">
					{kodePemulihan ? (
						<div>
							<h1
								ref={judulRef}
								tabIndex={-1}
								className="text-[24px] font-bold leading-tight tracking-[-0.02em] text-slate-800 focus:outline-none"
							>
								Akunmu sudah dibuat
							</h1>
							<p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
								Catat kode ini sekarang. Kode hanya ditampilkan sekali dan
								dipakai untuk membuat PIN baru bila kamu lupa PIN.
							</p>
							<div className="mt-4 rounded-xl bg-purple-50 px-4 py-3.5">
								<p className="text-[12px] font-semibold text-purple-700">
									Kode pemulihan
								</p>
								<p className="mt-1 text-[22px] font-bold tracking-[0.12em] tabular-nums text-slate-800">
									{kodePemulihan}
								</p>
							</div>
							<Button
								ukuran="lg"
								className="mt-5 w-full"
								onClick={() => setKodePemulihan("")}
							>
								Mulai belajar
								<ArrowRight className="h-4 w-4" aria-hidden="true" />
							</Button>
						</div>
					) : (
						<>
							<h1 className="text-[24px] font-bold leading-tight tracking-[-0.02em] text-slate-800">
								{JUDUL[mode]}
							</h1>
							<p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
								{KETERANGAN[mode]}
							</p>

							<form onSubmit={kirim} className="mt-5 space-y-3.5">
								<Field
									id="nama"
									label="Nama"
									placeholder="Contoh: Budi Pratama"
									autoComplete="username"
									value={nama}
									onChange={(peristiwa) => setNama(peristiwa.target.value)}
									galat={galat.nama}
								/>
								{mode !== "pulihkan" && (
									<Field
										id="kodeKelas"
										label="Kode kelas (opsional)"
										placeholder="Contoh: KLS-4A"
										value={kodeKelas}
										onChange={(peristiwa) =>
											setKodeKelas(peristiwa.target.value.toUpperCase())
										}
										petunjuk="Diberikan oleh guru kelas; kosongkan jika berlatih mandiri."
										galat={galat.kodeKelas}
									/>
								)}
								{mode === "daftar" && (
									<Field
										id="kelas"
										label="Kelas"
										placeholder="Contoh: 4 SD Inklusif"
										value={kelas}
										onChange={(peristiwa) => setKelas(peristiwa.target.value)}
										galat={galat.kelas}
									/>
								)}
								{mode === "pulihkan" && (
									<Field
										id="kode"
										label="Kode pemulihan"
										placeholder="ABCD-EFGH-JKLM"
										autoComplete="off"
										value={kode}
										onChange={(peristiwa) =>
											setKode(
												peristiwa.target.value
													.toUpperCase()
													.replace(/[^A-Z0-9-]/g, ""),
											)
										}
										petunjuk="Kode ini kamu catat saat mendaftar, berisi 12 huruf dan angka."
										galat={galat.kode}
									/>
								)}
								<Field
									id="pin"
									label={mode === "pulihkan" ? "PIN baru" : "PIN numerik"}
									type="password"
									inputMode="numeric"
									autoComplete={
										mode === "masuk" ? "current-password" : "new-password"
									}
									placeholder={
										mode === "masuk" ? "Bebas / opsional" : "4 sampai 6 angka"
									}
									value={pin}
									onChange={(peristiwa) =>
										setPin(
											mode === "masuk"
												? peristiwa.target.value
												: peristiwa.target.value.replace(/[^0-9]/g, ""),
										)
									}
									galat={galat.pin}
								/>

								{galat.umum && (
									<p
										role="alert"
										className="rounded-lg bg-rose-50 px-3 py-2 text-[13px] font-medium leading-relaxed text-rose-700"
									>
										{galat.umum}
									</p>
								)}

								<Button type="submit" ukuran="lg" className="w-full">
									{mode === "masuk"
										? "Masuk ke HITUNGIN"
										: mode === "daftar"
											? "Buat akun siswa"
											: "Simpan PIN baru"}
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</Button>
							</form>

							<p className="mt-3.5 text-[13px] text-slate-500">
								{mode === "masuk" ? (
									<>
										Belum punya akun?{" "}
										<TombolTautan onClick={() => gantiMode("daftar")}>
											Buat akun baru
										</TombolTautan>
										{" · "}
										<TombolTautan onClick={() => gantiMode("pulihkan")}>
											Lupa PIN
										</TombolTautan>
									</>
								) : (
									<TombolTautan onClick={() => gantiMode("masuk")}>
										{mode === "daftar"
											? "Sudah punya akun? Masuk"
											: "Kembali ke halaman masuk"}
									</TombolTautan>
								)}
							</p>

							<div className="mt-5 rounded-xl border border-purple-100 bg-purple-50/60 p-4">
								<p className="text-[13px] font-bold text-slate-800">
									Coba dulu tanpa akun
								</p>
								<p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">
									Satu soal contoh, tanpa progres dan tanpa rekaman.
								</p>
								<Link
									to="/tamu"
									className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-[#8b5cf6] no-underline hover:text-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b5cf6]"
								>
									Mulai soal contoh
									<ArrowRight className="h-3 w-3" aria-hidden="true" />
								</Link>
							</div>
						</>
					)}
				</Card>
			</div>
		</div>
	);
}

function TombolTautan({
	children,
	onClick,
}: {
	children: React.ReactNode;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="font-semibold text-[#8b5cf6] underline decoration-purple-200 underline-offset-4 hover:text-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b5cf6]"
		>
			{children}
		</button>
	);
}

function LogoHitungin({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 32 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M8 24C8 15 15 6 25 6C22 13 18 17 12 18C16 19 20 18 23 15C19 22 14 25 8 24Z"
				fill="#8b5cf6"
			/>
			<circle cx="11" cy="11" r="3" fill="#f8f9fb" />
		</svg>
	);
}
