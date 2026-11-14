import { Hand, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signExamples } from "@/lib/ai/sign-examples";

const EDGES = [
	[0, 1],
	[1, 2],
	[2, 3],
	[3, 4],
	[0, 5],
	[5, 6],
	[6, 7],
	[7, 8],
	[5, 9],
	[9, 10],
	[10, 11],
	[11, 12],
	[9, 13],
	[13, 14],
	[14, 15],
	[15, 16],
	[13, 17],
	[0, 17],
	[17, 18],
	[18, 19],
	[19, 20],
];

export function IsyaratAngkaMateri() {
	const [index, setIndex] = useState(0);
	const [playing, setPlaying] = useState(false);
	const current = signExamples[index];
	useEffect(() => {
		if (!playing) return;
		const timer = setInterval(
			() => setIndex((value) => (value + 1) % 10),
			3000,
		);
		return () => clearInterval(timer);
	}, [playing]);
	return (
		<Card className="space-y-4 p-5">
			<h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
				<Hand className="h-4 w-4" aria-hidden="true" />
				Contoh isyarat digit BISINDO
			</h2>
			<p className="text-sm leading-relaxed text-slate-600">
				Contoh titik tangan dari dataset yang dipakai model. Variasi isyarat
				antardaerah dapat berbeda. Jalur ini mengenali digit 0–9, lalu digit
				dapat disusun menjadi bilangan.
			</p>
			<figure className="rounded-xl bg-slate-50 p-4">
				<svg
					viewBox="0 0 640 480"
					className="mx-auto h-52 w-full max-w-sm"
					role="img"
					aria-labelledby="contoh-isyarat-label"
				>
					<title id="contoh-isyarat-label">
						Contoh landmark tangan untuk digit {current.digit} dari dataset
						BISINDO
					</title>
					{current.hands.map((hand, h) => (
						<g
							key={`hand-${hand[0].x}-${hand[0].y}`}
							fill="none"
							stroke={h ? "#1d4ed8" : "#7c3aed"}
							strokeWidth="4"
						>
							{EDGES.map(([a, b]) => (
								<line
									key={`${a}-${b}`}
									x1={hand[a].x * 640}
									y1={hand[a].y * 480}
									x2={hand[b].x * 640}
									y2={hand[b].y * 480}
								/>
							))}
							{hand.map((point) => (
								<circle
									key={`${point.x}-${point.y}-${point.z}`}
									cx={point.x * 640}
									cy={point.y * 480}
									r="4"
								/>
							))}
						</g>
					))}
				</svg>
				<figcaption className="text-center text-sm font-semibold text-slate-800">
					Digit {current.digit}
				</figcaption>
			</figure>
			<div className="flex flex-wrap gap-2">
				<Button
					varian="kedua"
					ukuran="ikon"
					aria-label="Contoh sebelumnya"
					onClick={() => setIndex((value) => (value + 9) % 10)}
				>
					<SkipBack className="h-4 w-4" aria-hidden="true" />
				</Button>
				<Button
					varian="kedua"
					aria-pressed={playing}
					onClick={() => setPlaying((value) => !value)}
				>
					{playing ? (
						<Pause className="h-4 w-4" aria-hidden="true" />
					) : (
						<Play className="h-4 w-4" aria-hidden="true" />
					)}
					{playing ? "Jeda contoh" : "Putar contoh"}
				</Button>
				<Button
					varian="kedua"
					ukuran="ikon"
					aria-label="Contoh berikutnya"
					onClick={() => setIndex((value) => (value + 1) % 10)}
				>
					<SkipForward className="h-4 w-4" aria-hidden="true" />
				</Button>
			</div>
			<fieldset
				className="flex flex-wrap gap-2"
				aria-label="Pilih contoh digit"
			>
				{signExamples.map((example) => (
					<Button
						key={example.digit}
						ukuran="ikon"
						varian={index === example.digit ? "utama" : "kedua"}
						aria-pressed={index === example.digit}
						onClick={() => {
							setIndex(example.digit);
							setPlaying(false);
						}}
					>
						{example.digit}
					</Button>
				))}
			</fieldset>
			<p className="text-sm text-slate-600">
				Sumber:{" "}
				<a
					href="https://www.kaggle.com/datasets/suryaadji/bisindo-alphabet-mediapipe-hand-landmarks"
					className="underline underline-offset-4"
				>
					Adjie, BISINDO Landmarks v3
				</a>{" "}
				(CC BY 4.0).
			</p>
		</Card>
	);
}
