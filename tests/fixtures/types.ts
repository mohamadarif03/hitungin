import type { Landmark } from "../../src/lib/ai/preprocessing";
export type ModelCases = {
	signs: { hands: Landmark[][]; normalized: number[]; logits: number[] }[];
	ocr: {
		target: string;
		text: string;
		width: number;
		height: number;
		rgba: number[];
		preprocessed: number[];
	}[];
};
