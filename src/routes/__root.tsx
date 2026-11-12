import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "HITUNGIN — Platform Belajar Matematika Inklusif" },
			{
				name: "description",
				content:
					"Latihan matematika dasar untuk siswa tunanetra dan tuli: jawab lewat suara, isyarat angka, tulisan, atau papan ketik.",
			},
		],
		links: [
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
				<script
					src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
					crossOrigin="anonymous"
				/>
				<script
					src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"
					crossOrigin="anonymous"
				/>
				<script
					src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
					crossOrigin="anonymous"
				/>
			</head>
			<body>
				{children}
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
