import type { ModelCases } from "../fixtures/types";
import type { Recognition } from "../../src/lib/ai/preprocessing";
import { expect, test } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";

const cases = JSON.parse(
	readFileSync(
		new URL("../fixtures/model-cases.json", import.meta.url),
		"utf8",
	),
) as ModelCases;

test("real ONNX workers match Python reference outputs without media uploads", async ({
	page,
}) => {
	const uploads: string[] = [];
	page.on("request", (request) => {
		// Devtools mem-pipe diagnostik lokal; bukan endpoint media aplikasi.
		if (
			request.method() === "POST" &&
			new URL(request.url()).pathname !== "/__tsd/console-pipe"
		)
			uploads.push(request.url());
	});
	await page.goto("/tamu");
	const result = await page.evaluate(async (samples) => {
		const path = "/src/lib/ai/client.ts";
		const { RecognitionClient } = (await import(
			path
		)) as typeof import("../../src/lib/ai/client");
		const worker = new RecognitionClient("vision");
		try {
			const signs = [];
			for (const sample of samples.signs)
				signs.push(await worker.request({ task: "sign", hands: sample.hands }));
			const ocr = [];
			for (const sample of samples.ocr)
				ocr.push(
					await worker.request({
						task: "handwriting",
						pixels: new Uint8ClampedArray(sample.rgba),
						width: sample.width,
						height: sample.height,
					}),
				);
			const empty = await worker.request({ task: "sign", hands: [] });
			return { signs, ocr, empty };
		} finally {
			worker.dispose();
		}
	}, cases);
	result.signs.forEach((actual: Recognition, i: number) => {
		const logits = cases.signs[i].logits as number[];
		const maximum = Math.max(...logits);
		const values = logits.map((v) => Math.exp(v - maximum));
		const total = values.reduce((a, b) => a + b, 0);
		const confidence = Math.max(...values) / total;
		expect(actual.value).toBe(
			confidence >= 0.6 ? logits.indexOf(maximum) : null,
		);
		expect(actual.confidence).toBeCloseTo(confidence, 4);
	});
	result.ocr.forEach((actual: Recognition, i: number) => {
		expect(actual.text).toBe(cases.ocr[i].text);
	});
	expect(result.empty.value).toBeNull();
	expect(uploads).toEqual([]);
});

test("drawing requires confirmation and editing invalidates the old answer", async ({
	page,
}) => {
	await page.goto("/tamu");
	await page.getByRole("button", { name: "Tulisan", exact: true }).click();
	const sample = cases.ocr.find((s) => s.target === "7");
	if (!sample) throw new Error("Reference fixture 7 missing");
	await page.locator("canvas").evaluate((canvas: HTMLCanvasElement, s) => {
		canvas.width = s.width;
		canvas.height = s.height;
		canvas
			.getContext("2d")
			?.putImageData(
				new ImageData(new Uint8ClampedArray(s.rgba), s.width, s.height),
				0,
				0,
			);
	}, sample);
	// Pointer activates drawing controls; restore the reference image afterwards.
	const canvas = page.locator("canvas");
	const box = await canvas.boundingBox();
	if (!box) throw new Error("Canvas is not visible");
	await page.mouse.click(box.x + 5, box.y + 5);
	await canvas.evaluate(
		(el: HTMLCanvasElement, s) =>
			el
				.getContext("2d")
				?.putImageData(
					new ImageData(new Uint8ClampedArray(s.rgba), s.width, s.height),
					0,
					0,
				),
		sample,
	);
	await page
		.getByRole("button", { name: "Periksa tulisan", exact: true })
		.click();
	await expect(
		page.getByRole("button", { name: "Ya, benar", exact: true }),
	).toBeVisible();
	await expect(page.getByText("Jawaban salah.", { exact: false })).toHaveCount(
		0,
	);
	await page.getByRole("button", { name: "Hapus kanvas", exact: true }).click();
	await expect(
		page.getByRole("button", { name: "Ya, benar", exact: true }),
	).toHaveCount(0);
});

test("camera worker initializes locally and keyboard remains available when permission is denied", async ({
	page,
	context,
}) => {
	await context.clearPermissions();
	await page.goto("/tamu");
	const initialized = await page.evaluate(async () => {
		const path = "/src/lib/ai/client.ts";
		const { RecognitionClient } = (await import(
			path
		)) as typeof import("../../src/lib/ai/client");
		const client = new RecognitionClient("vision");
		try {
			await client.request({ task: "init-camera" }, { timeout: 120000 });
			const blank = new OffscreenCanvas(640, 480);
			blank.getContext("2d")?.fillRect(0, 0, 640, 480);
			const frame = blank.transferToImageBitmap();
			const result = await client.request(
				{ task: "camera", frame, timestamp: performance.now() },
				{ transfer: [frame] },
			);
			return result.value === null && result.landmarks?.length === 0;
		} finally {
			client.dispose();
		}
	});
	expect(initialized).toBe(true);
	await page
		.getByRole("button", { name: "Isyarat angka", exact: true })
		.click();
	await page
		.getByRole("button", { name: "Nyalakan kamera", exact: true })
		.click();
	await expect(
		page
			.getByRole("status")
			.filter({ hasText: "Kamera atau model belum dapat dijalankan" }),
	).toBeVisible({ timeout: 120000 });
	await page
		.getByRole("button", { name: "Pakai papan ketik", exact: true })
		.click();
	await expect(
		page.getByRole("button", { name: "Papan ketik", exact: true }),
	).toHaveAttribute("aria-pressed", "true");
});

test("missing models show recovery without recording a wrong math answer", async ({
	page,
}) => {
	await page.route("**/models/speech/**", (route) =>
		route.fulfill({ status: 503, body: "Model unavailable" }),
	);
	await page.goto("/tamu");
	await page.getByRole("button", { name: "Suara", exact: true }).click();
	await page.getByRole("button", { name: "Siapkan model suara lokal" }).click();
	await expect(
		page
			.getByRole("status")
			.filter({ hasText: "Model suara belum dapat dimuat" }),
	).toBeVisible({ timeout: 30000 });
	await expect(
		page.getByRole("button", { name: "Ya, benar", exact: true }),
	).toHaveCount(0);
	await page
		.getByRole("button", { name: "Pakai papan ketik", exact: true })
		.click();
	await expect(
		page.getByRole("button", { name: "Papan ketik", exact: true }),
	).toHaveAttribute("aria-pressed", "true");
});

test("quantized trained Whisper transcribes a public connected-digit recording locally", async ({
	page,
}) => {
	const fixture = new URL("../../artifacts/test-speech.f32", import.meta.url);
	test.skip(
		!existsSync(fixture),
		"Run python scripts/prepare-speech-test.py for the public evaluation recording.",
	);
	const bytes = readFileSync(fixture);
	const audio = Array.from(
		new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4),
	);
	const uploads: string[] = [];
	page.on("request", (request) => {
		// Devtools mem-pipe diagnostik lokal; bukan endpoint media aplikasi.
		if (
			request.method() === "POST" &&
			new URL(request.url()).pathname !== "/__tsd/console-pipe"
		)
			uploads.push(request.url());
	});
	await page.goto("/tamu");
	const result = await page.evaluate(async (samples) => {
		const path = "/src/lib/ai/client.ts";
		const { RecognitionClient } = (await import(
			path
		)) as typeof import("../../src/lib/ai/client");
		const client = new RecognitionClient("speech");
		try {
			return await client.request(
				{ task: "transcribe", audio: Float32Array.from(samples) },
				{ timeout: 180000 },
			);
		} finally {
			client.dispose();
		}
	}, audio);
	expect(result.value).toBe(4);
	expect(uploads).toEqual([]);
});
