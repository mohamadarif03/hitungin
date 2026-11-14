import { Mic, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RecognitionClient } from "@/lib/ai/client";

type Props = {
	onTerbaca: (nilai: number) => void;
	onGantiJalur: () => void;
	onReset: () => void;
};
export { parseIndonesianNumber as ambilAngka } from "@/lib/ai/preprocessing";

export function JalurSuara({ onTerbaca, onGantiJalur, onReset }: Props) {
	const [phase, setPhase] = useState<
		"idle" | "loading" | "ready" | "recording" | "processing" | "error"
	>("idle");
	const [message, setMessage] = useState("");
	const [transcript, setTranscript] = useState("");
	const client = useRef<RecognitionClient | null>(null);
	const stream = useRef<MediaStream | null>(null);
	const context = useRef<AudioContext | null>(null);
	const recorder = useRef<AudioWorkletNode | null>(null);
	const chunks = useRef<Float32Array[]>([]);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const revision = useRef(0);
	const mounted = useRef(true);
	const recording = useRef(false);
	const starting = useRef(false);

	const release = useCallback(() => {
		if (timer.current) clearTimeout(timer.current);
		timer.current = null;
		recording.current = false;
		if (recorder.current) {
			recorder.current.port.onmessage = null;
			recorder.current.disconnect();
			recorder.current = null;
		}
		for (const track of stream.current?.getTracks() ?? []) track.stop();
		stream.current = null;
		context.current?.close().catch(() => {});
		context.current = null;
	}, []);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			revision.current++;
			release();
			chunks.current = [];
			client.current?.dispose();
			client.current = null;
		};
	}, [release]);

	async function load() {
		const current = ++revision.current;
		onReset();
		setPhase("loading");
		setMessage("Menyiapkan model suara lokal…");
		try {
			client.current?.dispose();
			client.current = new RecognitionClient("speech");
			await client.current.request(
				{ task: "load" },
				{
					timeout: 300000,
					progress: (event) => {
						if (mounted.current && current === revision.current)
							setMessage(event.message);
					},
				},
			);
			if (mounted.current && current === revision.current) {
				setPhase("ready");
				setMessage("Model siap. Tekan Mulai rekam saat ingin menjawab.");
			}
		} catch {
			client.current?.dispose();
			client.current = null;
			if (mounted.current && current === revision.current) {
				setPhase("error");
				setMessage(
					"Model suara belum dapat dimuat. Periksa koneksi atau ruang perangkat, coba lagi, atau gunakan papan ketik.",
				);
			}
		}
	}
	async function start() {
		if (recording.current || starting.current || !client.current) return;
		starting.current = true;
		const current = ++revision.current;
		onReset();
		setTranscript("");
		setMessage("Meminta izin mikrofon…");
		try {
			if (!navigator.mediaDevices?.getUserMedia || !window.AudioWorkletNode)
				throw new Error("Mikrofon tidak tersedia.");
			const media = await navigator.mediaDevices.getUserMedia({
				audio: {
					channelCount: 1,
					echoCancellation: true,
					noiseSuppression: true,
				},
			});
			if (!mounted.current || current !== revision.current) {
				media.getTracks().forEach((track) => {
					track.stop();
				});
				return;
			}
			stream.current = media;
			const ctx = new AudioContext();
			context.current = ctx;
			await ctx.audioWorklet.addModule("/audio/pcm-recorder.js");
			if (!mounted.current || current !== revision.current) {
				release();
				return;
			}
			const node = new AudioWorkletNode(ctx, "hitungin-pcm");
			recorder.current = node;
			chunks.current = [];
			recording.current = true;
			node.port.onmessage = ({ data }: MessageEvent<Float32Array>) => {
				if (recording.current) chunks.current.push(data);
			};
			const mute = ctx.createGain();
			mute.gain.value = 0;
			ctx.createMediaStreamSource(media).connect(node);
			node.connect(mute);
			mute.connect(ctx.destination);
			await ctx.resume();
			setPhase("recording");
			setMessage("Sedang merekam. Ucapkan digit lalu tekan Selesai rekam.");
			timer.current = setTimeout(() => {
				void stop();
			}, 8000);
		} catch {
			release();
			if (mounted.current && current === revision.current) {
				setPhase("ready");
				setMessage(
					"Mikrofon belum dapat diakses. Izinkan mikrofon lalu coba lagi, atau gunakan papan ketik.",
				);
			}
		} finally {
			starting.current = false;
		}
	}
	async function stop() {
		if (!recording.current) return;
		const current = revision.current,
			rate = context.current?.sampleRate ?? 48000;
		const recordings = chunks.current;
		chunks.current = [];
		release();
		setPhase("processing");
		setMessage("Mengenali rekaman di perangkat…");
		try {
			const length = recordings.reduce((sum, chunk) => sum + chunk.length, 0);
			if (!length || length / rate > 9) throw new Error("Rekaman kosong.");
			const offline = new OfflineAudioContext(
				1,
				Math.ceil((length * 16000) / rate),
				16000,
			);
			const buffer = offline.createBuffer(1, length, rate);
			let offset = 0;
			for (const chunk of recordings) {
				buffer.getChannelData(0).set(chunk, offset);
				offset += chunk.length;
			}
			const source = offline.createBufferSource();
			source.buffer = buffer;
			source.connect(offline.destination);
			source.start();
			const rendered = await offline.startRendering();
			const audio = new Float32Array(rendered.getChannelData(0));
			if (!mounted.current || current !== revision.current) return;
			const worker = client.current;
			if (!worker) throw new Error("Model suara belum siap.");
			const result = await worker.request(
				{ task: "transcribe", audio },
				{ transfer: [audio.buffer], timeout: 60000 },
			);
			if (!mounted.current || current !== revision.current) return;
			setTranscript(result.text);
			setPhase("ready");
			if (result.value === null)
				setMessage(
					"Suara belum terbaca sebagai bilangan 0–100. Rekam ulang atau gunakan papan ketik.",
				);
			else {
				setMessage(
					`Terbaca ${result.value}. Periksa hasilnya sebelum mengonfirmasi.`,
				);
				onTerbaca(result.value);
			}
		} catch {
			if (mounted.current && current === revision.current) {
				setPhase("error");
				setMessage(
					"Pengenalan suara belum berhasil. Siapkan ulang model dan rekam kembali, atau gunakan papan ketik.",
				);
			}
		}
	}
	return (
		<div className="space-y-3">
			<p className="text-sm leading-relaxed text-slate-600">
				Ucapkan digit satu per satu, misalnya “tiga lima” untuk 35. Rekaman
				maksimal 8 detik diproses di perangkat dan tidak diunggah atau disimpan.
			</p>
			{(phase === "idle" || phase === "error") && (
				<p className="text-sm text-slate-600">
					Model suara sekitar 300 MB diunduh sekali saat disiapkan. Gunakan
					koneksi yang sesuai dan pastikan ada ruang penyimpanan.
				</p>
			)}
			<div className="flex flex-wrap gap-2">
				{(phase === "idle" || phase === "error") && (
					<Button onClick={load}>Siapkan model suara lokal</Button>
				)}
				{phase === "ready" && (
					<Button onClick={start}>
						<Mic className="h-4 w-4" aria-hidden="true" />
						Mulai rekam
					</Button>
				)}
				{phase === "recording" && (
					<Button onClick={stop}>
						<Square className="h-4 w-4" aria-hidden="true" />
						Selesai rekam
					</Button>
				)}
				<Button varian="halus" onClick={onGantiJalur}>
					Pakai papan ketik
				</Button>
			</div>
			<output
				aria-live="polite"
				className="block min-h-6 text-sm text-slate-600"
			>
				{message}
			</output>
			{transcript && (
				<p className="text-sm text-slate-600">
					Transkrip:{" "}
					<span className="font-medium text-slate-800">{transcript}</span>
				</p>
			)}
		</div>
	);
}
