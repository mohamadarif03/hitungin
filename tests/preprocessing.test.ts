import type { ModelCases } from "./fixtures/types";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
	decodeCTC,
	normalizeLandmarks,
	parseIndonesianNumber,
	preprocessCanvas,
	StableDigit,
	validAnswer,
} from "../src/lib/ai/preprocessing.ts";

const cases = JSON.parse(
	readFileSync(new URL("./fixtures/model-cases.json", import.meta.url), "utf8"),
) as ModelCases;

test("landmark normalization matches the Python float32 reference", () => {
	for (const sample of cases.signs) {
		const actual = normalizeLandmarks(sample.hands);
		assert.ok(actual);
		assert.equal(actual.length, 128);
		for (let i = 0; i < actual.length; i++)
			assert.ok(
				Math.abs(actual[i] - sample.normalized[i]) < 1e-5,
				`feature ${i}`,
			);
	}
	assert.equal(normalizeLandmarks([]), null);
	assert.equal(
		normalizeLandmarks([
			Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 })),
		]),
		null,
	);
});

test("canvas tensor matches Pillow bilinear preprocessing", () => {
	for (const sample of cases.ocr) {
		const actual = preprocessCanvas(
			new Uint8ClampedArray(sample.rgba),
			sample.width,
			sample.height,
		);
		assert.ok(actual);
		for (let i = 0; i < actual.length; i++)
			assert.ok(
				Math.abs(actual[i] - sample.preprocessed[i]) <= 1 / 255 + 1e-6,
				`${sample.target} pixel ${i}`,
			);
	}
	assert.equal(
		preprocessCanvas(new Uint8ClampedArray(32 * 32 * 4).fill(255), 32, 32),
		null,
	);
});

test("CTC preserves repeated digits separated by blanks", () => {
	const ids = [1, 1, 10, 1, 10, 0, 0, 10, 0];
	const logits = new Float32Array(ids.length * 11).fill(-10);
	ids.forEach((id, i) => {
		logits[i * 11 + id] = 10;
	});
	assert.equal(decodeCTC(logits, ids.length), "1100");
});

test("strict Indonesian parser accepts cardinal and connected digits, never arbitrary sentences", () => {
	for (let value = 0; value <= 100; value++)
		assert.equal(parseIndonesianNumber(String(value)), value);
	const words = [
		"nol",
		"satu",
		"dua",
		"tiga",
		"empat",
		"lima",
		"enam",
		"tujuh",
		"delapan",
		"sembilan",
	];
	for (let tens = 2; tens <= 9; tens++)
		for (let units = 0; units <= 9; units++) {
			assert.equal(
				parseIndonesianNumber(
					`${words[tens]} puluh${units ? ` ${words[units]}` : ""}`,
				),
				tens * 10 + units,
			);
		}
	for (const [text, value] of [
		["tiga lima", 35],
		["satu nol nol", 100],
		["dua belas", 12],
		["sebelas", 11],
		["sepuluh", 10],
		["seratus", 100],
		["kosong", 0],
		["Dua, lima.", 25],
	] as const)
		assert.equal(parseIndonesianNumber(text), value);
	for (const text of [
		"dua atau tiga",
		"jawaban saya 5",
		"101",
		"-5",
		"2.5",
		"2/5",
		"dua belas tiga",
		"dua puluh nol",
		"",
		"satu seratus",
	])
		assert.equal(parseIndonesianNumber(text), null, text);
});

test("stability resets on missing hands and never carries stale digits", () => {
	const stable = new StableDigit();
	for (let i = 0; i < 4; i++) assert.equal(stable.update(3), null);
	assert.equal(stable.update(3), 3);
	assert.equal(stable.update(null), null);
	assert.equal(stable.update(5), null);
	assert.equal(validAnswer("101"), null);
	assert.equal(validAnswer("100"), 100);
});
