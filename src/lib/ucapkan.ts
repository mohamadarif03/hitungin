/**
 * Pembaca teks untuk soal dan penjelasan (S-11, S-21). Audio hanya diputar
 * setelah siswa menekan tombol, tidak pernah otomatis.
 */
export function ucapkan(teks: string, selesai?: () => void) {
	if (typeof window === "undefined" || !("speechSynthesis" in window)) {
		selesai?.();
		return;
	}
	window.speechSynthesis.cancel();
	const suara = new SpeechSynthesisUtterance(teks);
	suara.lang = "id-ID";
	suara.rate = 0.95;
	if (selesai) {
		suara.onend = () => selesai();
		suara.onerror = () => selesai();
	}
	window.speechSynthesis.speak(suara);
}

export function berhentiUcapkan() {
	if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
	window.speechSynthesis.cancel();
}

/** Apakah browser punya fitur pembaca teks. */
export function bisaUcapkan(): boolean {
	return typeof window !== "undefined" && "speechSynthesis" in window;
}
