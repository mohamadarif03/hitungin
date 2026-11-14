import { Camera, Hand, Plus, VideoOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RecognitionClient } from "@/lib/ai/client";
import {
	StableDigit,
	validAnswer,
	type Landmark,
} from "@/lib/ai/preprocessing";

type Props = {
	onTerbaca: (nilai: number) => void;
	onGantiJalur: () => void;
	onReset: () => void;
};

export function JalurIsyarat({ onTerbaca, onGantiJalur, onReset }: Props) {
	const video = useRef<HTMLVideoElement>(null);
	const overlay = useRef<HTMLCanvasElement>(null);
	const client = useRef<RecognitionClient | null>(null);
	const media = useRef<MediaStream | null>(null);
	const operation = useRef(0);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const stability = useRef(new StableDigit());
	const [phase, setPhase] = useState<"idle" | "loading" | "active" | "error">(
		"idle",
	);
	const [digit, setDigit] = useState<number | null>(null);
	const [draft, setDraft] = useState("");
	const [message, setMessage] = useState("");

	const stop = useCallback(() => {
		operation.current++;
		if (timer.current) clearTimeout(timer.current);
		timer.current = null;
		client.current?.dispose();
		client.current = null;
		for (const track of media.current?.getTracks() ?? []) track.stop();
		media.current = null;
		if (video.current) {
			video.current.pause();
			video.current.srcObject = null;
		}
		stability.current.reset();
	}, []);
	useEffect(() => () => stop(), [stop]);

	function draw(hands: Landmark[][]) {
		const canvas = overlay.current,
			ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "#c4b5fd";
		for (const hand of hands)
			for (const point of hand) {
				ctx.beginPath();
				ctx.arc(
					point.x * canvas.width,
					point.y * canvas.height,
					3,
					0,
					Math.PI * 2,
				);
				ctx.fill();
			}
	}
	async function start() {
		if (phase === "active" || phase === "loading") return;
		stop();
		onReset();
		setDigit(null);
		setPhase("loading");
		setMessage("Menyiapkan model BISINDO lokal…");
		const current = operation.current;
		try {
			if (!navigator.mediaDevices?.getUserMedia || !window.createImageBitmap)
				throw new Error("Kamera tidak tersedia.");
			const worker = new RecognitionClient("vision");
			client.current = worker;
			await worker.request({ task: "init-camera" }, { timeout: 120000 });
			if (current !== operation.current) return;
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: "user",
					width: { ideal: 640 },
					height: { ideal: 480 },
				},
				audio: false,
			});
			if (current !== operation.current) {
				stream.getTracks().forEach((track) => {
					track.stop();
				});
				return;
			}
			media.current = stream;
			const element = video.current;
			if (!element) {
				stop();
				return;
			}
			element.srcObject = stream;
			await element.play();
			if (current !== operation.current) return;
			setPhase("active");
			setMessage("Peragakan satu digit, lalu tahan sebentar hingga stabil.");
			const frame = async () => {
				if (current !== operation.current || !video.current) return;
				const started = performance.now();
				try {
					const bitmap = await createImageBitmap(element);
					if (current !== operation.current) {
						bitmap.close();
						return;
					}
					const result = await worker.request(
						{ task: "camera", frame: bitmap, timestamp: performance.now() },
						{ transfer: [bitmap], timeout: 15000 },
					);
					if (current !== operation.current) return;
					draw(result.landmarks ?? []);
					setDigit(stability.current.update(result.value));
					timer.current = setTimeout(
						() => {
							void frame();
						},
						Math.max(0, 67 - (performance.now() - started)),
					);
				} catch {
					if (current === operation.current) {
						stop();
						setDigit(null);
						setPhase("error");
						setMessage(
							"Pengenalan kamera terhenti. Coba lagi atau gunakan papan ketik.",
						);
					}
				}
			};
			void frame();
		} catch {
			if (current === operation.current) {
				stop();
				setPhase("error");
				setMessage(
					"Kamera atau model belum dapat dijalankan. Periksa izin kamera lalu coba lagi, atau gunakan papan ketik.",
				);
			}
		}
	}
	function append() {
		if (digit === null) return;
		const next = draft + digit;
		if (validAnswer(next) === null) {
			setMessage(
				"Jawaban dibatasi 0–100. Hapus digit terakhir untuk memperbaikinya.",
			);
			return;
		}
		onReset();
		setDraft(next);
		setDigit(null);
		stability.current.reset();
		setMessage(`Digit ditambahkan. Jawaban sementara ${next}.`);
	}
	function submit() {
		const value = validAnswer(draft);
		if (value === null) return;
		stop();
		setDigit(null);
		setPhase("idle");
		onTerbaca(value);
	}
	return (
		<div className="space-y-3">
			<p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
				<Hand className="h-4 w-4" aria-hidden="true" />
				Isyarat digit BISINDO 0–9
			</p>
			<p className="text-sm leading-relaxed text-slate-600">
				Peragakan satu digit dan tekan Tambah digit. Untuk 35, tambahkan 3 lalu
				5. Kamera diproses di perangkat dan gambarnya tidak diunggah.
			</p>
			<div className="relative aspect-[4/3] max-h-80 overflow-hidden rounded-xl bg-slate-900">
				<video
					ref={video}
					muted
					playsInline
					aria-label="Pratinjau kamera isyarat"
					className="h-full w-full -scale-x-100 object-contain"
				/>
				<canvas
					ref={overlay}
					width={640}
					height={480}
					aria-hidden="true"
					tabIndex={-1}
					className="absolute inset-0 h-full w-full -scale-x-100 object-contain"
				/>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				{phase !== "active" && (
					<Button onClick={start} disabled={phase === "loading"}>
						<Camera className="h-4 w-4" aria-hidden="true" />
						{phase === "loading" ? "Menyiapkan kamera…" : "Nyalakan kamera"}
					</Button>
				)}
				{phase === "active" && (
					<>
						<Button
							onClick={append}
							disabled={digit === null || draft.length >= 3}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Tambah digit{digit === null ? "" : ` ${digit}`}
						</Button>
						<Button
							varian="kedua"
							onClick={() => {
								stop();
								onReset();
								setDigit(null);
								setPhase("idle");
							}}
						>
							<VideoOff className="h-4 w-4" aria-hidden="true" />
							Matikan kamera
						</Button>
					</>
				)}
				<Button varian="halus" onClick={onGantiJalur}>
					Pakai papan ketik
				</Button>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<span className="text-sm text-slate-700">
					Jawaban sementara:{" "}
					<strong className="tabular-nums">{draft || "belum ada"}</strong>
				</span>
				<Button
					varian="kedua"
					disabled={!draft}
					onClick={() => {
						onReset();
						setDraft((value) => value.slice(0, -1));
					}}
				>
					Hapus digit terakhir
				</Button>
				<Button disabled={validAnswer(draft) === null} onClick={submit}>
					Periksa jawaban
				</Button>
			</div>
			<output
				aria-live="polite"
				className="block min-h-6 text-sm text-slate-600"
			>
				{message}
			</output>
		</div>
	);
}
