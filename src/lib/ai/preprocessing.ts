/** Kontrak preprocessing yang sama dengan notebook. Tidak menerima kunci jawaban. */
export type Landmark = { x: number; y: number; z?: number };
export type Recognition = {
	value: number | null;
	text: string;
	confidence: number | null;
	landmarks?: Landmark[][];
};

export function normalizeLandmarks(hands: Landmark[][]): Float32Array | null {
	if (!hands.length || hands.length > 2) return null;
	const points = new Float32Array(126);
	const present = [0, 0];
	for (let h = 0; h < hands.length; h++) {
		if (hands[h].length !== 21) return null;
		for (let j = 0; j < 21; j++) {
			const p = hands[h][j];
			if (![p.x, p.y, p.z ?? 0].every(Number.isFinite)) return null;
			points.set([p.x, p.y, p.z ?? 0], h * 63 + j * 3);
		}
		present[h] = hands[h].some(
			(p) => Math.abs(p.x) + Math.abs(p.y) + Math.abs(p.z ?? 0) > 1e-8,
		)
			? 1
			: 0;
	}
	if (!present.some(Boolean)) return null;
	const anchor = present[0] ? 0 : 63;
	let scale = 0;
	for (let h = 0; h < 2; h++) {
		const i = h * 63;
		if (present[h])
			scale += Math.hypot(
				points[i + 27] - points[i],
				points[i + 28] - points[i + 1],
				points[i + 29] - points[i + 2],
			);
	}
	scale /= present[0] + present[1];
	// Tangan degenerat tidak boleh dipaksa menjadi kandidat angka.
	if (scale < 1e-5) return null;
	const output = new Float32Array(128);
	for (let h = 0; h < 2; h++) {
		for (let j = 0; j < 63; j++) {
			output[h * 63 + j] = present[h]
				? (points[h * 63 + j] - points[anchor + (j % 3)]) / scale
				: 0;
		}
	}
	output.set(present, 126);
	return output;
}

export function softmax(logits: ArrayLike<number>): number[] {
	const values = Array.from(logits);
	const maximum = Math.max(...values);
	const exp = values.map((value) => Math.exp(value - maximum));
	const total = exp.reduce((sum, value) => sum + value, 0);
	return exp.map((value) => value / total);
}

export function validAnswer(text: string): number | null {
	if (!/^\d{1,3}$/.test(text)) return null;
	const value = Number(text);
	return value <= 100 ? value : null;
}

const WORDS: Record<string, number> = {
	nol: 0,
	kosong: 0,
	satu: 1,
	dua: 2,
	tiga: 3,
	empat: 4,
	lima: 5,
	enam: 6,
	tujuh: 7,
	delapan: 8,
	sembilan: 9,
};

/** Parser ketat: bilangan kardinal atau urutan digit, bukan potongan kalimat. */
export function parseIndonesianNumber(transcript: string): number | null {
	const raw = transcript.normalize("NFKC").toLowerCase().trim();
	if (!raw || /[+\-/=]|\d[.,]\d/.test(raw)) return null;
	const text = raw.replace(/[.,!?;:]/g, " ").trim();
	const tokens = text.split(/\s+/);
	if (tokens.length === 1) {
		const special: Record<string, number> = {
			sepuluh: 10,
			sebelas: 11,
			seratus: 100,
		};
		if (special[text] !== undefined) return special[text];
	}
	if (
		tokens.length === 2 &&
		WORDS[tokens[0]] >= 2 &&
		WORDS[tokens[0]] <= 9 &&
		tokens[1] === "belas"
	)
		return WORDS[tokens[0]] + 10;
	if (
		(tokens.length === 2 || tokens.length === 3) &&
		WORDS[tokens[0]] >= 2 &&
		WORDS[tokens[0]] <= 9 &&
		tokens[1] === "puluh"
	) {
		if (tokens.length === 2) return WORDS[tokens[0]] * 10;
		const unit = WORDS[tokens[2]];
		return unit >= 1 && unit <= 9 ? WORDS[tokens[0]] * 10 + unit : null;
	}
	let digits = "";
	for (const token of tokens) {
		if (/^\d+$/.test(token)) digits += token;
		else if (WORDS[token] !== undefined) digits += WORDS[token];
		else return null;
	}
	return validAnswer(digits);
}

export function decodeCTC(
	logits: ArrayLike<number>,
	steps: number,
	classes = 11,
): string {
	if (logits.length !== steps * classes)
		throw new Error("Dimensi hasil OCR tidak sesuai model.");
	let text = "";
	let previous = 10;
	for (let t = 0; t < steps; t++) {
		let best = 0;
		for (let c = 1; c < classes; c++)
			if (logits[t * classes + c] > logits[t * classes + best]) best = c;
		if (best !== 10 && best !== previous) text += best;
		previous = best;
	}
	return text;
}

function roundEven(value: number): number {
	const floor = Math.floor(value);
	return value - floor === 0.5 ? floor + (floor % 2) : Math.round(value);
}

function coefficients(
	input: number,
	output: number,
): { start: number; weights: number[] }[] {
	const scale = input / output;
	const support = Math.max(1, scale);
	return Array.from({ length: output }, (_, i) => {
		const center = (i + 0.5) * scale;
		const start = Math.max(0, Math.floor(center - support + 0.5));
		const end = Math.min(input, Math.floor(center + support + 0.5));
		const weights = Array.from({ length: end - start }, (_, j) =>
			Math.max(0, 1 - Math.abs((start + j + 0.5 - center) / support)),
		);
		const total = weights.reduce((a, b) => a + b, 0);
		return {
			start,
			weights: weights.map((weight) =>
				Math.floor((weight / total) * 2 ** 22 + 0.5),
			),
		};
	});
}

/** Pillow BILINEAR: antialias saat downscale, rounding uint8 pada tiap pass. */
function resizeBilinear(
	input: Uint8Array,
	width: number,
	height: number,
	newWidth: number,
	newHeight: number,
): Uint8Array {
	const horizontal = coefficients(width, newWidth);
	const vertical = coefficients(height, newHeight);
	const intermediate = new Uint8Array(newWidth * height);
	for (let y = 0; y < height; y++)
		for (let x = 0; x < newWidth; x++) {
			const { start, weights } = horizontal[x];
			let sum = 2 ** 21;
			for (let i = 0; i < weights.length; i++)
				sum += input[y * width + start + i] * weights[i];
			intermediate[y * newWidth + x] = Math.min(255, Math.floor(sum / 2 ** 22));
		}
	const output = new Uint8Array(newWidth * newHeight);
	for (let y = 0; y < newHeight; y++)
		for (let x = 0; x < newWidth; x++) {
			const { start, weights } = vertical[y];
			let sum = 2 ** 21;
			for (let i = 0; i < weights.length; i++)
				sum += intermediate[(start + i) * newWidth + x] * weights[i];
			output[y * newWidth + x] = Math.min(255, Math.floor(sum / 2 ** 22));
		}
	return output;
}

/** UI memakai tinta hitam di atas putih; model memakai tinta putih di atas hitam. */
export function preprocessCanvas(
	rgba: Uint8ClampedArray,
	width: number,
	height: number,
): Float32Array | null {
	if (width < 1 || height < 1 || rgba.length !== width * height * 4)
		throw new Error("Ukuran kanvas tidak valid.");
	const ink = new Uint8Array(width * height);
	let minX = width,
		minY = height,
		maxX = -1,
		maxY = -1,
		count = 0;
	for (let y = 0; y < height; y++)
		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4;
			const luminance = Math.round(
				rgba[i] * 0.299 + rgba[i + 1] * 0.587 + rgba[i + 2] * 0.114,
			);
			const value = Math.round((255 - luminance) * (rgba[i + 3] / 255));
			ink[y * width + x] = value;
			if (value > 0) {
				minX = Math.min(minX, x);
				minY = Math.min(minY, y);
				maxX = Math.max(maxX, x);
				maxY = Math.max(maxY, y);
				count++;
			}
		}
	if (count < 8 || maxX < minX || maxY < minY) return null;
	const cropWidth = maxX - minX + 1,
		cropHeight = maxY - minY + 1;
	const cropped = new Uint8Array(cropWidth * cropHeight);
	for (let y = 0; y < cropHeight; y++)
		cropped.set(
			ink.subarray((minY + y) * width + minX, (minY + y) * width + maxX + 1),
			y * cropWidth,
		);
	const ratio = Math.min(88 / cropWidth, 24 / cropHeight);
	const newWidth = Math.max(1, roundEven(cropWidth * ratio));
	const newHeight = Math.max(1, roundEven(cropHeight * ratio));
	const resized = resizeBilinear(
		cropped,
		cropWidth,
		cropHeight,
		newWidth,
		newHeight,
	);
	const output = new Float32Array(32 * 96);
	const left = Math.floor((96 - newWidth) / 2),
		top = Math.floor((32 - newHeight) / 2);
	for (let y = 0; y < newHeight; y++)
		for (let x = 0; x < newWidth; x++)
			output[(top + y) * 96 + left + x] = resized[y * newWidth + x] / 255;
	return output;
}

export class StableDigit {
	private history: (number | null)[] = [];
	reset() {
		this.history = [];
	}
	update(digit: number | null): number | null {
		if (digit === null) {
			this.reset();
			return null;
		}
		this.history.push(digit);
		if (this.history.length > 7) this.history.shift();
		return this.history.length >= 5 &&
			this.history.slice(-5).every((item) => item === digit)
			? digit
			: null;
	}
}
