import { Eraser, PenTool } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RecognitionClient } from "@/lib/ai/client";

type Props = {
	onTerbaca: (nilai: number) => void;
	onGantiJalur: () => void;
	onReset: () => void;
};

export function JalurTulisan({ onTerbaca, onGantiJalur, onReset }: Props) {
	const canvas = useRef<HTMLCanvasElement>(null);
	const drawing = useRef(false);
	const revision = useRef(0);
	const client = useRef<RecognitionClient | null>(null);
	const mounted = useRef(true);
	const [hasInk, setHasInk] = useState(false);
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState("");

	useEffect(() => {
		mounted.current = true;
		const ctx = canvas.current?.getContext("2d");
		if (ctx && canvas.current) {
			ctx.fillStyle = "white";
			ctx.fillRect(0, 0, canvas.current.width, canvas.current.height);
		}
		return () => {
			mounted.current = false;
			revision.current++;
			client.current?.dispose();
			client.current = null;
		};
	}, []);

	function clear() {
		revision.current++;
		onReset();
		const ctx = canvas.current?.getContext("2d");
		if (ctx && canvas.current) {
			ctx.fillStyle = "white";
			ctx.fillRect(0, 0, canvas.current.width, canvas.current.height);
		}
		setHasInk(false);
		setMessage("");
	}
	function position(event: React.PointerEvent<HTMLCanvasElement>) {
		const bounds = event.currentTarget.getBoundingClientRect();
		return {
			x:
				((event.clientX - bounds.left) * event.currentTarget.width) /
				bounds.width,
			y:
				((event.clientY - bounds.top) * event.currentTarget.height) /
				bounds.height,
		};
	}
	function begin(event: React.PointerEvent<HTMLCanvasElement>) {
		if (!event.isPrimary) return;
		const ctx = event.currentTarget.getContext("2d");
		if (!ctx) return;
		revision.current++;
		onReset();
		setMessage("");
		drawing.current = true;
		event.currentTarget.setPointerCapture(event.pointerId);
		const { x, y } = position(event);
		ctx.strokeStyle = "black";
		ctx.fillStyle = "black";
		ctx.lineWidth = 10;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.beginPath();
		ctx.arc(x, y, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(x, y);
		setHasInk(true);
	}
	function draw(event: React.PointerEvent<HTMLCanvasElement>) {
		if (!drawing.current || !event.isPrimary) return;
		const { x, y } = position(event),
			ctx = event.currentTarget.getContext("2d");
		ctx?.lineTo(x, y);
		ctx?.stroke();
	}
	function end(event: React.PointerEvent<HTMLCanvasElement>) {
		drawing.current = false;
		if (event.currentTarget.hasPointerCapture(event.pointerId))
			event.currentTarget.releasePointerCapture(event.pointerId);
	}
	async function recognize() {
		const element = canvas.current,
			ctx = element?.getContext("2d");
		if (!element || !ctx || busy) return;
		const current = ++revision.current;
		onReset();
		setBusy(true);
		setMessage("Membaca tulisan di perangkat…");
		const pixels = ctx.getImageData(0, 0, element.width, element.height).data;
		try {
			client.current ??= new RecognitionClient("vision");
			const result = await client.current.request(
				{
					task: "handwriting",
					pixels,
					width: element.width,
					height: element.height,
				},
				{ transfer: [pixels.buffer] },
			);
			if (!mounted.current || current !== revision.current) return;
			if (result.value === null)
				setMessage(
					"Tulisan belum terbaca sebagai bilangan 0–100. Hapus dan tulis ulang, atau gunakan papan ketik.",
				);
			else {
				setMessage(
					`Terbaca ${result.value}. Periksa hasilnya sebelum mengonfirmasi.`,
				);
				onTerbaca(result.value);
			}
		} catch {
			client.current?.dispose();
			client.current = null;
			if (mounted.current && current === revision.current)
				setMessage(
					"Model tulisan belum dapat dijalankan. Coba lagi atau gunakan papan ketik.",
				);
		} finally {
			if (mounted.current) setBusy(false);
		}
	}
	return (
		<div className="space-y-3">
			<p id="bantuan-kanvas" className="text-sm text-slate-600">
				Tulis satu bilangan utuh 0–100, misalnya 35, dari kiri ke kanan. Tulisan
				diproses di perangkat.
			</p>
			<canvas
				ref={canvas}
				width={600}
				height={220}
				role="img"
				aria-label="Kanvas untuk menulis bilangan jawaban"
				aria-describedby="bantuan-kanvas"
				onPointerDown={begin}
				onPointerMove={draw}
				onPointerUp={end}
				onPointerCancel={end}
				onLostPointerCapture={() => {
					drawing.current = false;
				}}
				className="aspect-[30/11] h-auto w-full touch-none rounded-xl border-2 border-dashed border-slate-300 bg-white"
			/>
			<div className="flex flex-wrap gap-2">
				<Button onClick={recognize} disabled={!hasInk || busy}>
					<PenTool className="h-4 w-4" aria-hidden="true" />
					{busy ? "Membaca tulisan…" : "Periksa tulisan"}
				</Button>
				<Button varian="kedua" onClick={clear}>
					<Eraser className="h-4 w-4" aria-hidden="true" />
					Hapus kanvas
				</Button>
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
		</div>
	);
}
