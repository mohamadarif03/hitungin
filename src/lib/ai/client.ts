import type { Recognition } from "./preprocessing";

export type ModelProgress = { message: string; progress?: number };
export type VisionRequest =
	| { task: "init-camera" }
	| { task: "camera"; frame: ImageBitmap; timestamp: number }
	| { task: "sign"; hands: import("./preprocessing").Landmark[][] }
	| {
			task: "handwriting";
			pixels: Uint8ClampedArray;
			width: number;
			height: number;
	  };
export type SpeechRequest =
	| { task: "load" }
	| { task: "transcribe"; audio: Float32Array };

/** Satu worker per jalur aktif. Dispose membatalkan unduhan/inferensi dan melepas memori. */
export class RecognitionClient {
	private worker: Worker;
	private sequence = 0;
	private closed = false;
	private pending = new Map<
		number,
		{
			resolve: (value: Recognition) => void;
			reject: (reason: Error) => void;
			progress?: (value: ModelProgress) => void;
			timer: ReturnType<typeof setTimeout>;
		}
	>();
	constructor(kind: "vision" | "speech") {
		this.worker =
			kind === "vision"
				? new Worker(new URL("./vision.worker.ts", import.meta.url), {
						type: "module",
					})
				: new Worker(new URL("./speech.worker.ts", import.meta.url), {
						type: "module",
					});
		this.worker.onmessage = ({ data }) => {
			const request = this.pending.get(data.id);
			if (!request) return;
			if (data.progress) {
				request.progress?.(data.progress);
				return;
			}
			clearTimeout(request.timer);
			this.pending.delete(data.id);
			if (data.error) request.reject(new Error(data.error));
			else request.resolve(data.result);
		};
		this.worker.onerror = () =>
			this.dispose("Pengenalan berhenti. Coba lagi atau gunakan papan ketik.");
	}
	request(
		payload: VisionRequest | SpeechRequest,
		options: {
			progress?: (value: ModelProgress) => void;
			timeout?: number;
			transfer?: Transferable[];
		} = {},
	): Promise<Recognition> {
		if (this.closed)
			return Promise.reject(new Error("Pengenalan sudah ditutup. Coba lagi."));
		const id = ++this.sequence;
		return new Promise((resolve, reject) => {
			const timer = setTimeout(
				() =>
					this.dispose(
						"Pengenalan terlalu lama. Coba lagi atau gunakan papan ketik.",
					),
				options.timeout ?? 60000,
			);
			this.pending.set(id, {
				resolve,
				reject,
				timer,
				progress: options.progress,
			});
			try {
				this.worker.postMessage({ id, payload }, options.transfer ?? []);
			} catch (error) {
				clearTimeout(timer);
				this.pending.delete(id);
				reject(error);
			}
		});
	}
	dispose(message = "Pengenalan dibatalkan.") {
		this.closed = true;
		this.worker.terminate();
		for (const request of this.pending.values()) {
			clearTimeout(request.timer);
			request.reject(new Error(message));
		}
		this.pending.clear();
	}
}
