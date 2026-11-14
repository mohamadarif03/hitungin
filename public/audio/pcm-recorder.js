/** Mengirim PCM ke halaman lokal saja. Tidak ada pengiriman jaringan. */
class PCMRecorder extends AudioWorkletProcessor {
	constructor() {
		super();
		this.samples = [];
	}
	process(inputs) {
		const channel = inputs[0]?.[0];
		if (channel) {
			for (const sample of channel) this.samples.push(sample);
			if (this.samples.length >= 2048) {
				const audio = Float32Array.from(this.samples);
				this.port.postMessage(audio, [audio.buffer]);
				this.samples = [];
			}
		}
		return true;
	}
}
registerProcessor("hitungin-pcm", PCMRecorder);
