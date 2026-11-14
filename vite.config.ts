import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		{
			name: "local-wasm-modules",
			configureServer(server) {
				// Emscripten melakukan dynamic import ke runtime yang disalin tanpa transformasi.
				server.middlewares.use(async (req, res, next) => {
					const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
					if (!pathname.startsWith("/vendor/") || !/\.(mjs|js)$/.test(pathname))
						return next();
					const base = resolve("public/vendor");
					const path = resolve("public", `.${pathname}`);
					if (!path.startsWith(base + sep)) return next();
					try {
						const body = await readFile(path);
						res.setHeader("Content-Type", "text/javascript");
						res.end(body);
					} catch {
						next();
					}
				});
			},
		},
		devtools(),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
});

export default config;
