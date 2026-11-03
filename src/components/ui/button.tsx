import type * as React from "react";
import { cn } from "@/lib/utils";

const varian = {
	utama: "bg-[#8b5cf6] text-white shadow-xs hover:bg-purple-700",
	kedua:
		"border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50",
	halus: "text-slate-600 hover:bg-slate-100",
	bahaya: "bg-rose-600 text-white hover:bg-rose-700",
} as const;

const ukuran = {
	sm: "h-9 gap-1.5 px-3 text-xs",
	md: "h-11 gap-2 px-4 text-sm",
	lg: "h-12 gap-2 px-5 text-sm",
	ikon: "h-11 w-11",
} as const;

type Props = React.ComponentProps<"button"> & {
	varian?: keyof typeof varian;
	ukuran?: keyof typeof ukuran;
};

export function Button({
	className,
	varian: pilihanVarian = "utama",
	ukuran: pilihanUkuran = "md",
	type = "button",
	...props
}: Props) {
	return (
		<button
			type={type}
			className={cn(
				"inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b5cf6] disabled:pointer-events-none disabled:opacity-50",
				varian[pilihanVarian],
				ukuran[pilihanUkuran],
				className,
			)}
			{...props}
		/>
	);
}
