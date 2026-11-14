import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "tests/browser",
	timeout: 180000,
	workers: 1,
	use: { baseURL: "http://127.0.0.1:3000", headless: true },
	webServer: {
		command: "npm run dev -- --host 127.0.0.1",
		url: "http://127.0.0.1:3000/tamu",
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
