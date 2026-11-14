import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const root = new URL("../", import.meta.url).pathname;
async function copyRuntime(directory, target) {
	await mkdir(target, { recursive: true });
	for (const file of await readdir(directory)) {
		if (/\.(wasm|mjs|js)$/.test(file))
			await cp(join(directory, file), join(target, file));
	}
}
await copyRuntime(
	join(root, "node_modules/onnxruntime-web/dist"),
	join(root, "public/vendor/onnx"),
);
const transformersRequire = createRequire(
	require.resolve("@huggingface/transformers"),
);
const transformersOrt = dirname(
	dirname(transformersRequire.resolve("onnxruntime-web")),
);
await copyRuntime(
	join(transformersOrt, "dist"),
	join(root, "public/vendor/transformers-onnx"),
);
await copyRuntime(
	join(root, "node_modules/@mediapipe/tasks-vision/wasm"),
	join(root, "public/vendor/mediapipe"),
);
// Loader upstream memakai var global; ekspor eksplisit diperlukan di module worker.
for (const file of await readdir(join(root, "public/vendor/mediapipe"))) {
	if (file.endsWith(".js")) {
		const path = join(root, "public/vendor/mediapipe", file);
		await writeFile(
			path,
			(await readFile(path, "utf8")) +
				"\nglobalThis.custom_dbg ??= (...args) => console.warn(...args);\nglobalThis.ModuleFactory = ModuleFactory;\n",
		);
	}
}
try {
	await readFile(join(root, "public/models/bisindo/hand_landmarker.task"));
} catch {
	throw new Error(
		"Hand Landmarker tidak ditemukan. Pulihkan public/models/bisindo/hand_landmarker.task dari Git.",
	);
}
console.log(
	"Runtime WASM dan Hand Landmarker siap, semua disajikan dari origin aplikasi.",
);
