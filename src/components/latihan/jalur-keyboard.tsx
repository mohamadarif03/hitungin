import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
	onKirim: (nilai: number) => void;
	nonaktif?: boolean;
};

/**
 * Jalur papan ketik (S-23): selalu tersedia, tanpa mikrofon maupun kamera,
 * dan dapat dipakai siswa tunanetra maupun tuli.
 */
export function JalurKeyboard({ onKirim, nonaktif }: Props) {
	const [nilai, setNilai] = useState("");
	const [galat, setGalat] = useState("");

	function kirim(peristiwa: React.FormEvent<HTMLFormElement>) {
		peristiwa.preventDefault();
		const angka = Number.parseInt(nilai, 10);
		if (nilai.trim() === "" || !Number.isFinite(angka)) {
			setGalat("Tulis jawaban berupa angka terlebih dahulu, lalu tekan Kirim.");
			return;
		}
		setGalat("");
		onKirim(angka);
	}

	return (
		<form onSubmit={kirim} className="space-y-2">
			<label
				htmlFor="jawaban-keyboard"
				className="block text-xs font-semibold text-slate-700"
			>
				Tulis jawabanmu
			</label>
			<div className="flex flex-wrap items-center gap-2">
				<input
					id="jawaban-keyboard"
					inputMode="numeric"
					autoComplete="off"
					value={nilai}
					disabled={nonaktif}
					onChange={(peristiwa) =>
						setNilai(peristiwa.target.value.replace(/[^0-9]/g, ""))
					}
					aria-invalid={galat ? true : undefined}
					aria-describedby={galat ? "galat-keyboard" : "bantuan-keyboard"}
					className="h-11 w-28 rounded-lg border border-slate-200 px-3 text-center text-lg font-bold text-slate-800 focus:border-[#8b5cf6] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#8b5cf6]"
				/>
				<Button type="submit" disabled={nonaktif}>
					Kirim jawaban
				</Button>
			</div>
			{galat && (
				<p
					id="galat-keyboard"
					role="alert"
					className="text-[11px] font-medium text-rose-600"
				>
					{galat}
				</p>
			)}
			<p id="bantuan-keyboard" className="text-[11px] text-slate-500">
				Tekan Enter untuk mengirim. Jawaban langsung dinilai oleh aturan
				matematika.
			</p>
		</form>
	);
}
