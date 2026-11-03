import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthStore } from "@/datas/stores/auth-store";

export const Route = createFileRoute("/_app")({
	component: LayoutAplikasi,
});

/**
 * Semua menu siswa memerlukan sesi. Pengecekan dilakukan setelah komponen
 * terpasang karena sesi dibaca dari penyimpanan browser, bukan dari server.
 */
function LayoutAplikasi() {
	const siswa = useAuthStore((state) => state.siswa);
	const navigate = useNavigate();
	const [siap, setSiap] = useState(false);

	useEffect(() => {
		setSiap(true);
	}, []);

	useEffect(() => {
		if (siap && !siswa) navigate({ to: "/masuk", replace: true });
	}, [siap, siswa, navigate]);

	if (!siap || !siswa) {
		return (
			<div className="flex min-h-dvh items-center justify-center bg-[#f8f9fb]">
				<output className="block text-xs font-medium text-slate-500">
					Memuat sesi siswa…
				</output>
			</div>
		);
	}

	return (
		<AppShell>
			<Outlet />
		</AppShell>
	);
}
