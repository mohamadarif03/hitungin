import { Square, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { berhentiUcapkan, ucapkan } from "@/lib/ucapkan";

type Props = {
	teks: string;
	label?: string;
	className?: string;
};

/** Tombol audio manual: tidak pernah diputar otomatis (S-21). */
export function TombolDengar({ teks, label = "Dengarkan", className }: Props) {
	const [aktif, setAktif] = useState(false);

	useEffect(() => {
		return () => berhentiUcapkan();
	}, []);

	function ubah() {
		if (aktif) {
			berhentiUcapkan();
			setAktif(false);
			return;
		}
		setAktif(true);
		ucapkan(teks, () => setAktif(false));
	}

	return (
		<Button varian="kedua" ukuran="sm" onClick={ubah} className={className}>
			{aktif ? (
				<Square className="h-3.5 w-3.5" aria-hidden="true" />
			) : (
				<Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
			)}
			{aktif ? "Hentikan audio" : label}
		</Button>
	);
}
