import { useEffect } from "react";

/** Mendaftarkan service worker hanya di build produksi agar dev server tidak tertahan cache. */
export function DaftarServiceWorker() {
	useEffect(() => {
		if (!import.meta.env.PROD) return;
		if (!("serviceWorker" in navigator)) return;
		navigator.serviceWorker.register("/sw.js").catch(() => undefined);
	}, []);

	return null;
}
