import { TanStackDevtools } from "@tanstack/react-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { DaftarServiceWorker } from "@/components/pwa/daftar-sw";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover",
			},
			{ name: "theme-color", content: "#8b5cf6" },
			{ name: "mobile-web-app-capable", content: "yes" },
			{ name: "apple-mobile-web-app-capable", content: "yes" },
			{ name: "apple-mobile-web-app-title", content: "HITUNGIN" },
			{ name: "apple-mobile-web-app-status-bar-style", content: "default" },
			{ title: "HITUNGIN — Platform Belajar Matematika Inklusif" },
			{
				name: "description",
				content:
					"Latihan matematika dasar untuk siswa tunanetra dan tuli: jawab lewat suara, isyarat angka, tulisan, atau papan ketik.",
			},
		],
		links: [
			{ rel: "manifest", href: "/manifest.webmanifest" },
			{
				rel: "icon",
				type: "image/png",
				sizes: "192x192",
				href: "/icons/icon-192.png",
			},
			{ rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
			{ rel: "stylesheet", href: appCss },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="id">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<DaftarServiceWorker />
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
