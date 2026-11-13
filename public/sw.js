/* HITUNGIN service worker: app shell offline + cache aset statis.
 * Naikkan VERSI setiap kali ada perubahan besar agar cache lama dibersihkan. */
const VERSI = "hitungin-v1";
const CACHE_HALAMAN = `${VERSI}-halaman`;
const CACHE_ASET = `${VERSI}-aset`;

const SHELL = [
	"/",
	"/masuk",
	"/materi",
	"/latihan",
	"/tugas",
	"/offline.html",
	"/manifest.webmanifest",
	"/icons/icon-192.png",
	"/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_HALAMAN).then((cache) =>
			Promise.all(
				SHELL.map((url) => cache.add(url).catch(() => undefined)),
			),
		),
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		(async () => {
			const kunci = await caches.keys();
			await Promise.all(
				kunci
					.filter((nama) => nama.startsWith("hitungin-") && !nama.startsWith(VERSI))
					.map((nama) => caches.delete(nama)),
			);
			await self.clients.claim();
		})(),
	);
});

function bolehDicache(url) {
	return (
		url.origin === self.location.origin &&
		!url.pathname.startsWith("/api") &&
		!url.pathname.startsWith("/@") &&
		!url.pathname.startsWith("/__")
	);
}

self.addEventListener("fetch", (event) => {
	const { request } = event;
	if (request.method !== "GET") return;
	const url = new URL(request.url);
	if (!bolehDicache(url)) return;

	// Navigasi halaman: jaringan dulu, lalu cache, lalu halaman offline.
	if (request.mode === "navigate") {
		event.respondWith(
			fetch(request)
				.then((respon) => {
					const salinan = respon.clone();
					caches.open(CACHE_HALAMAN).then((cache) => cache.put(request, salinan));
					return respon;
				})
				.catch(async () => {
					const cache = await caches.open(CACHE_HALAMAN);
					return (
						(await cache.match(request)) ||
						(await cache.match(url.pathname)) ||
						(await cache.match("/offline.html"))
					);
				}),
		);
		return;
	}

	// Aset berkas (JS, CSS, ikon): cache dulu agar cepat dan tetap jalan offline.
	if (
		url.pathname.startsWith("/assets/") ||
		url.pathname.startsWith("/icons/") ||
		url.pathname.endsWith(".webmanifest")
	) {
		event.respondWith(
			caches.open(CACHE_ASET).then(async (cache) => {
				const tersimpan = await cache.match(request);
				if (tersimpan) return tersimpan;
				const respon = await fetch(request);
				if (respon.ok) cache.put(request, respon.clone());
				return respon;
			}),
		);
	}
});
