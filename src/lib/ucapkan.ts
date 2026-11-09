/**
 * Pembaca teks untuk soal dan penjelasan (S-11, S-21). Audio hanya diputar
 * setelah siswa menekan tombol, tidak pernah otomatis.
 */
/** Variabel penampung agar objek utterance tidak dibersihkan oleh Garbage Collector di Chrome. */
let _utteranceAktif: SpeechSynthesisUtterance | null = null;

/** Suara nada singkat (beep ramah) sebagai umpan balik pendengaran instan. */
function bunyikanNadaNotifikasi() {
	if (typeof window === "undefined") return;
	try {
		const AudioCtx =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext })
				.webkitAudioContext;
		if (!AudioCtx) return;
		const ctx = new AudioCtx();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
		osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
		gain.gain.setValueAtTime(0.08, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + 0.22);
	} catch {
		// Abaikan jika audio context dibatasi kebijakan browser
	}
}

/**
 * Pembaca teks untuk soal dan penjelasan (S-11, S-21) dan aksesibilitas disabilitas (WCAG).
 * Mendukung pemulihan status paused dan pemilihan voice id-ID yang tangguh.
 */
export function ucapkan(teks: string, selesai?: () => void) {
	if (typeof window === "undefined" || !("speechSynthesis" in window)) {
		bunyikanNadaNotifikasi();
		selesai?.();
		return;
	}

	try {
		window.speechSynthesis.cancel();
		window.speechSynthesis.resume();

		const suara = new SpeechSynthesisUtterance(teks);
		suara.lang = "id-ID";
		suara.rate = 0.95;
		suara.pitch = 1.0;

		// Pilih suara bahasa Indonesia jika tersedia di daftar voice browser
		const voices = window.speechSynthesis.getVoices();
		const suaraId = voices.find(
			(v) =>
				v.lang.toLowerCase().startsWith("id") ||
				v.lang.toLowerCase().startsWith("in"),
		);
		if (suaraId) {
			suara.voice = suaraId;
		}

		suara.onend = () => {
			_utteranceAktif = null;
			selesai?.();
		};

		suara.onerror = () => {
			bunyikanNadaNotifikasi();
			_utteranceAktif = null;
			selesai?.();
		};

		_utteranceAktif = suara;
		window.speechSynthesis.speak(suara);
	} catch {
		bunyikanNadaNotifikasi();
		selesai?.();
	}
}

export function berhentiUcapkan() {
	if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
	try {
		window.speechSynthesis.cancel();
		_utteranceAktif = null;
	} catch {
		// Tangani jika terjadi error browser
	}
}

/** Apakah browser punya fitur pembaca teks. */
export function bisaUcapkan(): boolean {
	return typeof window !== "undefined" && "speechSynthesis" in window;
}
