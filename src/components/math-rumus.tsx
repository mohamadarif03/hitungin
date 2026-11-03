import type { BagianRumus } from "@/datas/consts/level";
import { cn } from "@/lib/utils";

type Props = {
	bagian: BagianRumus[];
	label: string;
	kecil?: boolean;
	className?: string;
};

/**
 * Rumus MathML (S-12). Tiap bagian dapat difokuskan dengan keyboard dan
 * dibacakan tersendiri (S-13).
 */
export function MathRumus({ bagian, label, kecil, className }: Props) {
	if (bagian.length === 0) return null;

	return (
		<div
			role="group"
			aria-label={label}
			className={cn(
				"rumus flex flex-wrap items-center gap-1",
				kecil && "rumus-kecil",
				className,
			)}
		>
			{bagian.map((potongan) => (
				<span
					key={potongan.label}
					role="math"
					tabIndex={0}
					aria-label={`${potongan.label}: ${potongan.nilai}`}
					className="rounded-md px-1.5 py-0.5 text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b5cf6]"
					dangerouslySetInnerHTML={{ __html: potongan.mathml }}
				/>
			))}
		</div>
	);
}
