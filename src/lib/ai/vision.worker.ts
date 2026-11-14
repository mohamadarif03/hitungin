/// <reference lib="webworker" />
import * as ort from "onnxruntime-web/wasm";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import {
	decodeCTC,
	normalizeLandmarks,
	preprocessCanvas,
	softmax,
	validAnswer,
	type Recognition,
	type Landmark,
} from "./preprocessing";
import type { VisionRequest } from "./client";

// MediaPipe memanggil self.import saat importScripts tidak didukung module worker.
(self as unknown as { import: (url: string) => Promise<unknown> }).import = (
	url,
) => import(/* @vite-ignore */ url);

ort.env.wasm.wasmPaths = "/vendor/onnx/";
ort.env.wasm.numThreads = 1;
ort.env.wasm.proxy = false;
const sessions = new Map<string, Promise<ort.InferenceSession>>();
let landmarker: HandLandmarker | undefined;

function session(path: string) {
	let promise = sessions.get(path);
	if (!promise) {
		promise = ort.InferenceSession.create(path, {
			executionProviders: ["wasm"],
		});
		sessions.set(path, promise);
		promise.catch(() => sessions.delete(path));
	}
	return promise;
}

async function sign(hands: Landmark[][]): Promise<Recognition> {
	const data = normalizeLandmarks(hands);
	if (!data)
		return { value: null, text: "", confidence: null, landmarks: hands };
	const model = await session("/models/bisindo/sign_mlp.onnx");
	const results = await model.run({
		landmarks: new ort.Tensor("float32", data, [1, 128]),
	});
	const probabilities = softmax(results.logits.data as Float32Array);
	const confidence = Math.max(...probabilities),
		digit = probabilities.indexOf(confidence);
	return {
		value: confidence >= 0.6 ? digit : null,
		text: String(digit),
		confidence,
		landmarks: hands,
	};
}

async function run(payload: VisionRequest): Promise<Recognition> {
	if (payload.task === "handwriting") {
		const data = preprocessCanvas(
			payload.pixels,
			payload.width,
			payload.height,
		);
		if (!data) return { value: null, text: "", confidence: null };
		const model = await session("/models/tulisan_tangan/number_crnn.onnx");
		const results = await model.run({
			image: new ort.Tensor("float32", data, [1, 1, 32, 96]),
		});
		const logits = results.logits;
		const text = decodeCTC(logits.data as Float32Array, Number(logits.dims[1]));
		return { value: validAnswer(text), text, confidence: null };
	}
	if (payload.task === "sign") return sign(payload.hands);
	if (!landmarker) {
		const vision = await FilesetResolver.forVisionTasks("/vendor/mediapipe");
		landmarker = await HandLandmarker.createFromOptions(vision, {
			baseOptions: {
				modelAssetPath: "/models/bisindo/hand_landmarker.task",
				delegate: "CPU",
			},
			runningMode: "VIDEO",
			numHands: 2,
			minHandDetectionConfidence: 0.5,
			minHandPresenceConfidence: 0.5,
			minTrackingConfidence: 0.5,
		});
	}
	if (payload.task === "init-camera") {
		await session("/models/bisindo/sign_mlp.onnx");
		return { value: null, text: "", confidence: null };
	}
	try {
		return await sign(
			landmarker.detectForVideo(payload.frame, payload.timestamp).landmarks,
		);
	} finally {
		payload.frame.close();
	}
}

self.onmessage = async ({
	data,
}: MessageEvent<{ id: number; payload: VisionRequest }>) => {
	try {
		self.postMessage({ id: data.id, result: await run(data.payload) });
	} catch (error) {
		self.postMessage({
			id: data.id,
			error:
				error instanceof Error
					? error.message
					: "Model belum dapat dijalankan.",
		});
	}
};
