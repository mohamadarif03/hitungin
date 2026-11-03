import type * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"input"> & {
	id: string;
	label: string;
	petunjuk?: string;
	galat?: string;
};

export function Field({
	id,
	label,
	petunjuk,
	galat,
	className,
	...props
}: Props) {
	return (
		<div className="space-y-1.5">
			<label
				htmlFor={id}
				className="block text-[13px] font-semibold text-slate-700"
			>
				{label}
			</label>
			<input
				id={id}
				aria-invalid={galat ? true : undefined}
				aria-describedby={
					[petunjuk ? `${id}-petunjuk` : null, galat ? `${id}-galat` : null]
						.filter(Boolean)
						.join(" ") || undefined
				}
				className={cn(
					"h-12 w-full rounded-lg border bg-white px-3.5 text-[15px] text-slate-800 placeholder:text-slate-400 focus:border-[#8b5cf6] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#8b5cf6]",
					galat ? "border-rose-300" : "border-slate-200",
					className,
				)}
				{...props}
			/>
			{petunjuk && (
				<p
					id={`${id}-petunjuk`}
					className="text-[13px] leading-[1.5] text-slate-500"
				>
					{petunjuk}
				</p>
			)}
			{galat && (
				<p
					id={`${id}-galat`}
					className="text-[13px] font-medium text-rose-600"
					role="alert"
				>
					{galat}
				</p>
			)}
		</div>
	);
}
