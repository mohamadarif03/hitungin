import type * as React from "react";
import { cn } from "@/lib/utils";

const nada = {
	ungu: "border-purple-100 bg-purple-50 text-purple-700",
	hijau: "border-emerald-100 bg-emerald-50 text-emerald-700",
	pink: "border-pink-100 bg-pink-50 text-pink-700",
	kuning: "border-amber-100 bg-amber-50 text-amber-700",
	biru: "border-blue-100 bg-blue-50 text-blue-700",
	netral: "border-slate-200 bg-slate-50 text-slate-600",
} as const;

type Props = React.ComponentProps<"span"> & { nada?: keyof typeof nada };

export function Badge({
	className,
	nada: pilihanNada = "netral",
	...props
}: Props) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
				nada[pilihanNada],
				className,
			)}
			{...props}
		/>
	);
}
