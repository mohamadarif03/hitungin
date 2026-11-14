/// <reference lib="webworker" />
import {
	env,
	pipeline,
	type AutomaticSpeechRecognitionPipeline,
} from "@huggingface/transformers";
import { parseIndonesianNumber } from "./preprocessing";
import type { SpeechRequest } from "./client";

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = "/models/";
env.useBrowserCache = true;
const wasm = env.backends.onnx.wasm;
if (!wasm) throw new Error("Runtime suara lokal tidak tersedia.");
wasm.wasmPaths = "/vendor/transformers-onnx/";
wasm.numThreads = 1;
wasm.proxy = false;
let transcriber: AutomaticSpeechRecognitionPipeline | undefined;
// Hindari ekspansi union seluruh task Transformers pada TypeScript 6.
const createTranscriber = pipeline as unknown as (
	task: "automatic-speech-recognition",
	model: string,
	options: Record<string, unknown>,
) => Promise<AutomaticSpeechRecognitionPipeline>;

self.onmessage = async ({
	data,
}: MessageEvent<{ id: number; payload: SpeechRequest }>) => {
	const { id, payload } = data;
	try {
		if (!transcriber) {
			self.postMessage({
				id,
				progress: {
					message:
						"Menyiapkan model suara lokal. Unduhan pertama dapat memerlukan beberapa menit.",
				},
			});
			transcriber = await createTranscriber(
				"automatic-speech-recognition",
				"speech",
				{
					device: "wasm",
					dtype: "q8",
					local_files_only: true,
					progress_callback: (event: { status: string; progress?: number }) => {
						if (event.status === "progress")
							self.postMessage({
								id,
								progress: {
									message: "Mengunduh model suara ke perangkat…",
									progress: event.progress,
								},
							});
					},
				},
			);
		}
		if (payload.task === "load") {
			self.postMessage({
				id,
				result: { value: null, text: "", confidence: null },
			});
			return;
		}
		if (
			!payload.audio.length ||
			payload.audio.length > 16000 * 9 ||
			!payload.audio.every(Number.isFinite)
		)
			throw new Error("Rekaman tidak valid. Rekam ulang maksimal 8 detik.");
		let energy = 0;
		for (const sample of payload.audio) energy += sample * sample;
		if (Math.sqrt(energy / payload.audio.length) < 0.003) {
			self.postMessage({
				id,
				result: { value: null, text: "", confidence: null },
			});
			return;
		}
		const output = await transcriber(payload.audio, {
			language: "indonesian",
			task: "transcribe",
			max_new_tokens: 32,
			return_timestamps: false,
		});
		const text = Array.isArray(output) ? output[0].text : output.text;
		self.postMessage({
			id,
			result: { value: parseIndonesianNumber(text), text, confidence: null },
		});
	} catch (error) {
		self.postMessage({
			id,
			error:
				error instanceof Error
					? error.message
					: "Pengenalan suara belum tersedia.",
		});
	}
};
