/**
 * MediaPipe Hands & Robust Gesture Recognition Service
 * Mendukung:
 * 1. Penjumlahan jari dua tangan (Tangan Kiri + Tangan Kanan = Total)
 * 2. Gestur satu tangan BISINDO / SIBI (0 - 9)
 * 3. Disambiguasi geometris & stabilizer temporal majority voting
 */

export interface Landmark {
	x: number;
	y: number;
	z?: number;
}

export interface MediaPipeResults {
	image: CanvasImageSource;
	multiHandLandmarks?: Landmark[][];
	multiHandedness?: { index: number; score: number; label: string }[];
}

export interface MediaPipeHandsInstance {
	setOptions: (options: {
		maxNumHands?: number;
		modelComplexity?: number;
		minDetectionConfidence?: number;
		minTrackingConfidence?: number;
	}) => void;
	onResults: (callback: (results: MediaPipeResults) => void) => void;
	send: (input: { image: HTMLVideoElement }) => Promise<void>;
	close: () => Promise<void>;
}

export interface MediaPipeCameraInstance {
	start: () => Promise<void>;
	stop: () => void;
}

declare global {
	interface Window {
		Hands?: new (config: {
			locateFile: (file: string) => string;
		}) => MediaPipeHandsInstance;
		Camera?: new (
			video: HTMLVideoElement,
			config: {
				onFrame: () => Promise<void>;
				width?: number;
				height?: number;
			},
		) => MediaPipeCameraInstance;
		drawConnectors?: (
			ctx: CanvasRenderingContext2D,
			landmarks: Landmark[],
			connections: unknown,
			options?: { color?: string; lineWidth?: number },
		) => void;
		drawLandmarks?: (
			ctx: CanvasRenderingContext2D,
			landmarks: Landmark[],
			options?: { color?: string; lineWidth?: number; radius?: number },
		) => void;
		HAND_CONNECTIONS?: unknown;
	}
}

export interface GestureResult {
	number: number;
	confidence: number;
	label: string;
	detail?: string;
	isTwoHands?: boolean;
	leftCount?: number;
	rightCount?: number;
}

/**
 * Memastikan script MediaPipe dimuat dari CDN jika belum tersedia di window.
 */
export async function ensureMediaPipeLoaded(): Promise<boolean> {
	if (typeof window === "undefined") return false;
	if (window.Hands && window.Camera && window.drawConnectors) {
		return true;
	}

	const scripts = [
		"https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
		"https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
		"https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js",
	];

	for (const src of scripts) {
		if (!document.querySelector(`script[src="${src}"]`)) {
			await new Promise<void>((resolve, reject) => {
				const script = document.createElement("script");
				script.src = src;
				script.crossOrigin = "anonymous";
				script.onload = () => resolve();
				script.onerror = () => reject(new Error(`Gagal memuat ${src}`));
				document.head.appendChild(script);
			}).catch(() => {});
		}
	}

	const startTime = Date.now();
	while (Date.now() - startTime < 5000) {
		if (window.Hands && window.Camera && window.drawConnectors) {
			return true;
		}
		await new Promise((r) => setTimeout(r, 100));
	}

	return !!(window.Hands && window.Camera);
}

function dist(p1: Landmark, p2: Landmark): number {
	return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

/**
 * Menghitung jumlah jari terangkat secara akurat untuk satu tangan (0 - 5 jari).
 * Digunakan baik untuk mode penjumlahan dua tangan maupun fallback satu tangan.
 */
export function countExtendedFingers(lm: Landmark[]): {
	count: number;
	thumb: boolean;
	index: boolean;
	middle: boolean;
	ring: boolean;
	pinky: boolean;
	handScale: number;
	wristX: number;
} {
	const wrist = lm[0];
	const handScale = dist(wrist, lm[9]) || 0.1;

	// Deteksi jari telunjuk, tengah, manis, kelingking
	const isFingerExtended = (
		tipIdx: number,
		pipIdx: number,
		mcpIdx: number,
	): boolean => {
		const tipWrist = dist(lm[tipIdx], wrist);
		const pipWrist = dist(lm[pipIdx], wrist);
		const tipMcp = dist(lm[tipIdx], lm[mcpIdx]);
		const pipMcp = dist(lm[pipIdx], lm[mcpIdx]);

		const distCheck = tipWrist > pipWrist * 1.1 && tipMcp > pipMcp * 1.12;
		const heightCheck = lm[tipIdx].y < lm[pipIdx].y + 0.08 * handScale;
		return distCheck && (heightCheck || tipWrist > pipWrist * 1.25);
	};

	const index = isFingerExtended(8, 6, 5);
	const middle = isFingerExtended(12, 10, 9);
	const ring = isFingerExtended(16, 14, 13);
	const pinky = isFingerExtended(20, 18, 17);

	// Jempol: jarak ujung jempol (4) ke pangkal kelingking (17) vs IP jempol (3) ke (17)
	const thumbTipToPinky = dist(lm[4], lm[17]);
	const thumbIpToPinky = dist(lm[3], lm[17]);
	const thumbTipToIndex = dist(lm[4], lm[5]);
	const thumb =
		thumbTipToPinky > thumbIpToPinky * 1.14 &&
		thumbTipToIndex > handScale * 0.42;

	let count = 0;
	if (thumb) count++;
	if (index) count++;
	if (middle) count++;
	if (ring) count++;
	if (pinky) count++;

	return {
		count,
		thumb,
		index,
		middle,
		ring,
		pinky,
		handScale,
		wristX: wrist.x,
	};
}

/**
 * Ekstraksi vektor kontinyu [0..1] untuk pattern matching satu tangan.
 */
export function analyzeHandFeatures(lm: Landmark[]): {
	vector: [number, number, number, number, number];
	extendedCount: number;
	handScale: number;
} {
	const wrist = lm[0];
	const handScale = dist(wrist, lm[9]) || 0.1;

	const getExtensionScore = (
		tipIdx: number,
		pipIdx: number,
		mcpIdx: number,
	) => {
		const tipWrist = dist(lm[tipIdx], wrist);
		const pipWrist = dist(lm[pipIdx], wrist);
		const tipMcp = dist(lm[tipIdx], lm[mcpIdx]);
		const pipMcp = dist(lm[pipIdx], lm[mcpIdx]);

		const diffWrist = (tipWrist - pipWrist) / handScale;
		const diffMcp = (tipMcp - pipMcp) / handScale;
		return Math.max(0, Math.min(1, (diffWrist + diffMcp * 0.8) / 0.35));
	};

	const indexScore = getExtensionScore(8, 6, 5);
	const middleScore = getExtensionScore(12, 10, 9);
	const ringScore = getExtensionScore(16, 14, 13);
	const pinkyScore = getExtensionScore(20, 18, 17);

	const thumbTipToPinky = dist(lm[4], lm[17]);
	const thumbIpToPinky = dist(lm[3], lm[17]);
	const thumbTipToIndex = dist(lm[4], lm[5]);
	const thumbDiff = (thumbTipToPinky - thumbIpToPinky) / handScale;
	const thumbScore = Math.max(
		0,
		Math.min(1, (thumbDiff + (thumbTipToIndex / handScale - 0.35)) / 0.3),
	);

	const vector: [number, number, number, number, number] = [
		thumbScore,
		indexScore,
		middleScore,
		ringScore,
		pinkyScore,
	];

	let count = 0;
	if (thumbScore > 0.55) count++;
	if (indexScore > 0.55) count++;
	if (middleScore > 0.55) count++;
	if (ringScore > 0.55) count++;
	if (pinkyScore > 0.55) count++;

	return { vector, extendedCount: count, handScale };
}

interface GestureProfile {
	number: number;
	name: string;
	profile: [number, number, number, number, number];
	weight: number;
}

const CANONICAL_PROFILES: GestureProfile[] = [
	{
		number: 0,
		name: "0 (Kepalan tangan)",
		profile: [0, 0, 0, 0, 0],
		weight: 1.0,
	},
	{
		number: 1,
		name: "1 (Telunjuk tegak)",
		profile: [0, 1, 0, 0, 0],
		weight: 1.1,
	},
	{
		number: 1,
		name: "1 (Jempol saja)",
		profile: [1, 0, 0, 0, 0],
		weight: 0.9,
	},
	{
		number: 2,
		name: "2 (Dua jari V)",
		profile: [0, 1, 1, 0, 0],
		weight: 1.1,
	},
	{
		number: 2,
		name: "2 (Jempol & telunjuk)",
		profile: [1, 1, 0, 0, 0],
		weight: 0.9,
	},
	{
		number: 3,
		name: "3 (Tiga jari tegak)",
		profile: [0, 1, 1, 1, 0],
		weight: 1.1,
	},
	{
		number: 3,
		name: "3 (Jempol, telunjuk, tengah)",
		profile: [1, 1, 1, 0, 0],
		weight: 0.95,
	},
	{
		number: 4,
		name: "4 (Empat jari tegak)",
		profile: [0, 1, 1, 1, 1],
		weight: 1.05,
	},
	{
		number: 5,
		name: "5 (Lima jari terbuka)",
		profile: [1, 1, 1, 1, 1],
		weight: 1.1,
	},
];

/**
 * Mengklasifikasikan gestur angka:
 * 1. Mode Penjumlahan Dua Tangan (Tangan Kiri + Tangan Kanan = Total) jika multiLandmarks >= 2.
 * 2. Mode Satu Tangan (BISINDO / Jari Terbuka 0 - 9).
 */
export function classifyNumberGesture(
	multiLandmarks: Landmark[][],
): GestureResult | null {
	if (!multiLandmarks || multiLandmarks.length === 0) return null;

	// =========================================================================
	// KASUS 1: PENJUMLAHAN DUA TANGAN (Tangan Kiri + Tangan Kanan)
	// =========================================================================
	if (multiLandmarks.length >= 2) {
		const h1 = countExtendedFingers(multiLandmarks[0]);
		const h2 = countExtendedFingers(multiLandmarks[1]);

		// Tentukan tangan kiri vs tangan kanan berdasarkan posisi horizontal pada kamera
		// Feed kamera di-mirror (scale -1, 1), jadi tangan dengan wristX lebih kecil berada di kiri tampilan
		const [leftHand, rightHand] = h1.wristX < h2.wristX ? [h1, h2] : [h2, h1];

		const total = leftHand.count + rightHand.count;
		const resultNumber = Math.min(total, 10);

		return {
			number: resultNumber,
			confidence: 0.96,
			label: `Angka ${resultNumber} (${leftHand.count} kiri + ${rightHand.count} kanan)`,
			detail: `Penjumlahan: ${leftHand.count} jari (kiri) + ${rightHand.count} jari (kanan) = ${resultNumber}`,
			isTwoHands: true,
			leftCount: leftHand.count,
			rightCount: rightHand.count,
		};
	}

	// =========================================================================
	// KASUS 2: SATU TANGAN (0 - 9)
	// =========================================================================
	const lm = multiLandmarks[0];
	const { vector, handScale } = analyzeHandFeatures(lm);

	// A. Analisis Sentuhan Eksklusif Jempol (BISINDO 6, 7, 8, 9, dan 0)
	const thumbTip = lm[4];
	const fingerTips = [
		{ idx: 0, tipIdx: 8, name: "index" },
		{ idx: 1, tipIdx: 12, name: "middle" },
		{ idx: 2, tipIdx: 16, name: "ring" },
		{ idx: 3, tipIdx: 20, name: "pinky" },
	];

	const touchDistances = fingerTips.map((f) => ({
		...f,
		distance: dist(thumbTip, lm[f.tipIdx]),
	}));

	touchDistances.sort((a, b) => a.distance - b.distance);
	const closest = touchDistances[0];
	const secondClosest = touchDistances[1];

	const isExclusiveTouch =
		closest.distance < handScale * 0.28 &&
		secondClosest.distance > closest.distance * 1.35;

	if (isExclusiveTouch) {
		if (closest.idx === 3 && vector[1] > 0.5 && vector[2] > 0.5) {
			return {
				number: 6,
				confidence: 0.93,
				label: "6 (Jempol sentuh kelingking)",
				detail: "Isyarat BISINDO angka 6",
				isTwoHands: false,
			};
		}
		if (closest.idx === 2 && vector[1] > 0.5 && vector[2] > 0.5) {
			return {
				number: 7,
				confidence: 0.93,
				label: "7 (Jempol sentuh manis)",
				detail: "Isyarat BISINDO angka 7",
				isTwoHands: false,
			};
		}
		if (closest.idx === 1 && vector[1] > 0.5 && vector[4] > 0.45) {
			return {
				number: 8,
				confidence: 0.93,
				label: "8 (Jempol sentuh tengah)",
				detail: "Isyarat BISINDO angka 8",
				isTwoHands: false,
			};
		}
		if (closest.idx === 0) {
			const otherFingersExtended = (vector[2] + vector[3] + vector[4]) / 3;
			if (otherFingersExtended > 0.55) {
				return {
					number: 9,
					confidence: 0.93,
					label: "9 (Jempol sentuh telunjuk)",
					detail: "Isyarat BISINDO angka 9",
					isTwoHands: false,
				};
			}
			if (otherFingersExtended < 0.35) {
				return {
					number: 0,
					confidence: 0.91,
					label: "0 (Bentuk lingkaran O)",
					detail: "Isyarat BISINDO angka 0",
					isTwoHands: false,
				};
			}
		}
	}

	// B. Pattern Matching terhadap Profil Kanonikal (0 - 5)
	const scores = CANONICAL_PROFILES.map((p) => {
		let l1Diff = 0;
		for (let i = 0; i < 5; i++) {
			l1Diff += Math.abs(vector[i] - p.profile[i]);
		}
		const similarity = Math.max(0, 1.0 - l1Diff / 5.0) * p.weight;
		return {
			number: p.number,
			name: p.name,
			score: similarity,
		};
	});

	scores.sort((a, b) => b.score - a.score);
	const best = scores[0];
	const runnerUp = scores[1];

	const MIN_SCORE_THRESHOLD = 0.78;
	const MIN_MARGIN = 0.12;

	if (
		best.score >= MIN_SCORE_THRESHOLD &&
		best.score - runnerUp.score >= MIN_MARGIN
	) {
		return {
			number: best.number,
			confidence: Math.min(0.98, best.score),
			label: best.name,
			detail: `${best.number} jari terangkat`,
			isTwoHands: false,
		};
	}

	return null;
}

/**
 * Filter Temporal Stabilizer (Majority Voting Buffer)
 * Menjaga stabilitas dan mempertahankan metadata penjumlahan dua tangan.
 */
export class GestureStabilizer {
	private history: GestureResult[] = [];
	private windowSize: number;
	private minConsensus: number;
	private lastStableResult: GestureResult | null = null;
	private consecutiveConsensusCount = 0;

	constructor(windowSize = 8, minConsensus = 5) {
		this.windowSize = windowSize;
		this.minConsensus = minConsensus;
	}

	update(raw: GestureResult | null): {
		stableResult: GestureResult | null;
		isConfirmed: boolean;
		stabilityRatio: number;
	} {
		if (raw !== null) {
			this.history.push(raw);
		} else {
			if (this.history.length > 0) this.history.shift();
		}

		if (this.history.length > this.windowSize) {
			this.history.shift();
		}

		const counts = new Map<number, { count: number; result: GestureResult }>();
		for (const h of this.history) {
			const existing = counts.get(h.number) || { count: 0, result: h };
			existing.count += 1;
			// Selalu perbarui dengan objek hasil terbaru (agar leftCount/rightCount mutakhir)
			existing.result = h;
			counts.set(h.number, existing);
		}

		let bestCount = 0;
		let bestResult: GestureResult | null = null;

		for (const data of counts.values()) {
			if (data.count > bestCount) {
				bestCount = data.count;
				bestResult = data.result;
			}
		}

		const stabilityRatio =
			this.history.length > 0 ? bestCount / this.windowSize : 0;

		if (bestResult !== null && bestCount >= this.minConsensus) {
			if (this.lastStableResult?.number === bestResult.number) {
				this.consecutiveConsensusCount += 1;
			} else {
				this.lastStableResult = bestResult;
				this.consecutiveConsensusCount = 1;
			}

			const isConfirmed = this.consecutiveConsensusCount >= 5;

			return {
				stableResult: {
					...bestResult,
					confidence: 0.85 + (bestCount / this.windowSize) * 0.14,
				},
				isConfirmed,
				stabilityRatio,
			};
		}

		if (this.history.length === 0) {
			this.lastStableResult = null;
			this.consecutiveConsensusCount = 0;
		}

		return {
			stableResult: null,
			isConfirmed: false,
			stabilityRatio,
		};
	}

	reset() {
		this.history = [];
		this.lastStableResult = null;
		this.consecutiveConsensusCount = 0;
	}
}
