# Integrasi AI lokal HITUNGIN

Tiga model hasil eksperimen notebook digunakan untuk inferensi browser. Tidak ada
endpoint pengiriman kamera, gambar kanvas, atau rekaman mikrofon. Training notebook
berjalan di Colab, terpisah dari penggunaan aplikasi. Semua model dan runtime
inferensi dilayani dari origin aplikasi, tanpa mengambil model dari Hugging Face
atau CDN saat pengguna menjawab.

| Jalur | Model dan data | Kontrak browser |
|---|---|---|
| Isyarat | MediaPipe Hand Landmarker + MLP BISINDO static numbers v3 | Dua tangan sesuai urutan deteksi, 128 fitur, normalisasi identik Python; digit 0–9 |
| Tulisan | CNN + BiGRU + CTC, MNIST + EMNIST digits | Bilangan utuh, kanvas dipotong, aspect ratio dipertahankan, putih di atas hitam, 32×96; blank CTC 10 |
| Suara | Bagus/whisper-small-id-cv17 fine-tuned pada CDSR | ONNX int8 encoder + merged decoder dengan KV cache; mono 16 kHz; parser bilangan 0–100 |

## Menjalankan

Node.js 22 atau lebih baru dan npm diperlukan.

```bash
npm ci --ignore-scripts
npm run dev
npm run typecheck
npm test
npx playwright install chromium
python3 scripts/prepare-speech-test.py
npm run test:e2e
npm run build
```

`--ignore-scripts` menghindari kompilasi dependensi native Sharp yang tidak dipakai
jalur browser. Vite dan ONNX memakai distribusi binernya. Paket terkunci dalam
`package-lock.json`; `bun.lock` juga diperbarui untuk pengguna Bun. Gunakan
lockfile yang sesuai package manager dan hindari instalasi tanpa lockfile.

`dev` dan `build` otomatis menjalankan `prepare:ai`: menyalin WASM/JS sesuai versi
paket ke `public/vendor/`, yang tidak disimpan di Git. MediaPipe memerlukan
jembatan module-worker untuk ModuleFactory dan logger dari loader upstream.
Middleware dev menyajikan loader tanpa transformasi Vite; build produksi memakai
berkas statis yang sama. Pastikan host melayani `.wasm` sebagai `application/wasm`,
`.mjs`/`.js` sebagai JavaScript, dan semua `*.onnx_data*` sebagai berkas biner.
Untuk kamera/mikrofon gunakan HTTPS atau localhost.

Berkas model berada di `public/models/`. Jangan menghilangkan shard external data
saat deploy. Speech sekitar 300 MB (286 MiB) termasuk tokenizer, dipecah agar tiap
berkas di bawah batas 100 MB GitHub. Ini bukan model q4f16 komunitas; ini adalah
ekspor int8 checkpoint hasil notebook. `speech/manifest.json` merekam SHA-256
checkpoint sumber dan seluruh berkas ekspor. Model suara baru diunduh saat tombol
siapkan ditekan. CPU WASM satu thread dipilih untuk kompatibilitas; WebGPU belum
diaktifkan dan tidak dibutuhkan agar demo ini bekerja.

## Alur penggunaan dan pemulihan

Model hanya mengusulkan angka. Latihan dan demo landing meminta konfirmasi sebelum
menilai matematika. Mengubah tulisan, merekam ulang, menambah/menghapus digit, atau
mengganti jalur membatalkan kandidat lama. Penilaian matematika tetap deterministik.

Isyarat disaring dengan confidence minimal 0,6 dan lima prediksi terakhir harus
sama sebelum tombol Tambah digit aktif. Pengguna menambahkan digit satu per satu
untuk bilangan sampai 100. Ini bukan sistem penerjemah seluruh BISINDO atau SIBI,
dan tidak menjumlahkan jumlah jari dua tangan. Panduan menampilkan landmark contoh
publik yang benar-benar dipakai model. Urutan tangan tetap mengikuti data publik;
perbedaan urutan detector pada pengguna baru masih merupakan risiko PoC.

Tulisan mengenali satu sampai tiga digit sekaligus dengan CTC, bukan mengambil
satu digit per kotak. Kanvas kosong ditolak. Probabilitas CTC belum dikalibrasi,
sehingga tidak ditampilkan sebagai confidence. Hasil di luar 0–100 meminta ulang.

Suara menyarankan pengucapan digit terhubung, misalnya “tiga lima” untuk 35.
Parser menerima juga frasa kardinal Indonesia, tetapi kualitas ASR frasa tersebut
belum divalidasi. Rekaman maksimal delapan detik dihentikan saat selesai atau
pindah jalur; audio hanya berada di memori dan tidak disimpan. Teks soal memakai
sintesis suara browser yang sudah ada, bukan model ASR. Setiap worker dihentikan
saat jalur dilepas. Kegagalan izin, model, unduhan, atau timeout menyediakan papan
ketik. Tidak ada fallback cloud tersembunyi.

Service worker produksi menyimpan aset/model yang telah diminta bila kuota
mengizinkan. Mode offline memerlukan pemuatan sebelumnya; cache dapat dibuang
browser. Instalasi awal dan pemuatan jalur baru tetap membutuhkan koneksi.

## Verifikasi dan batas hasil

- Unit test memeriksa normalisasi terhadap NumPy, preprocessing terhadap Pillow,
  CTC termasuk digit berulang, parser ketat, dan filter stabilitas.
- Browser test menjalankan ONNX sungguhan pada 10 landmark dan empat gambar kanvas
  referensi Python. Ini tes kesetaraan implementasi, bukan estimasi akurasi.
- Browser test memuat MediaPipe lokal, memeriksa pemulihan kamera ditolak,
  konfirmasi/invalidasi tulisan, dan kegagalan unduhan suara.
- Uji speech opsional memakai satu rekaman publik CDSR yang diunduh script ke
  `artifacts/` terabaikan Git, lalu menjalankan Whisper int8 di browser. Tanpa
  berkas itu test dilewati secara eksplisit. Tidak ada audio corpus di repo.
- Ekspor ONNX float melaporkan deviasi encoder maksimum sekitar 0,00585 dan
  logits sekitar 0,00009 terhadap PyTorch. Kesetaraan numerik penuh tidak diklaim;
  kuantisasi memerlukan evaluasi lebih luas meskipun smoke test audio berhasil.

Metrik notebook: BISINDO 97,69% pada 130 sampel internal tanpa ID pengisyarat;
CRNN 87,6% exact match pada 1.000 bilangan sintetis; Whisper 64/64 rekaman test
connected digits dewasa. Metrik Whisper tersebut untuk checkpoint notebook,
bukan benchmark menyeluruh hasil kuantisasi. Belum ada klaim akurasi anak,
pengisyarat baru, kanvas touchscreen nyata, atau semua browser/perangkat.
CPU, memori, P95 latency dan pemakaian kamera langsung perlu diukur di perangkat
demo. Model besar dapat gagal di perangkat dengan memori terbatas.

## Reproduksi ekspor

Notebook Indonesia, cover UB, keluaran Colab, sumber dan tooling berada di
[`notebooks/`](../notebooks/README.md). Ekspor speech membutuhkan lingkungan Python
terpisah: torch, transformers==4.52.0, optimum-onnx==0.1.0, onnx==1.19.1 dan
onnxruntime==1.23.2. Jalankan `python scripts/export-speech.py --help` untuk argumen.
Script menyimpan tokenizer cepat, mengekspor encoder/decoder, menguantisasi
MatMul/Gemm/Gather, membagi external data, lalu membuat manifest. Script fixture
`generate-ai-fixtures.py` memerlukan data publik dan artefak notebook; jangan
menganggap fixture sebagai dataset evaluasi baru.

## Sumber dan lisensi

- [BISINDO v3 oleh suryaadji](https://www.kaggle.com/datasets/suryaadji/bisindo-alphabet-mediapipe-hand-landmarks), CC BY 4.0 menurut metadata penerbit. Contoh landmark panduan dan fixture berasal dari subset angka. Atribusi ini harus dipertahankan.
- [MediaPipe](https://github.com/google-ai-edge/mediapipe), Apache-2.0. `hand_landmarker.task` berasal dari [artefak Google](https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task), SHA-256 `fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1`.
- [MNIST](https://yann.lecun.com/exdb/mnist/) dan [EMNIST/NIST](https://www.nist.gov/itl/products-and-services/emnist-dataset): digit publik untuk pelatihan dan fixture raster sintetis. Pertahankan pengakuan sumber dan ketentuan distribusi sumber.
- [Bagus/whisper-small-id-cv17](https://huggingface.co/Bagus/whisper-small-id-cv17), turunan [OpenAI Whisper](https://github.com/openai/whisper). Model card checkpoint mencantumkan Apache-2.0; model asal Whisper memakai MIT. Teks lisensi dan model card upstream disertakan pada `public/models/`. Periksa juga ketentuan dataset adaptasi sebelum penggunaan di luar PoC.
- [INDspeech_DIGIT_CDSR](https://github.com/s-sakti/data_indsp_digit_cdsr), Sakti dan rekan, CC BY-NC-SA 4.0 beserta pembatasan penerbit atas redistribusi corpus. Corpus tidak disalin ke repo. Checkpoint yang diadaptasi disediakan untuk PoC nonkomersial; jangan menganggapnya bebas digunakan secara komersial. Tinjau ketentuan dataset dan turunan sebelum distribusi lanjutan.
- Logo Universitas Brawijaya dipakai pada cover notebook sebagai identitas akademik, bukan klaim dukungan resmi; asal aset dicatat di `notebooks/assets/SOURCE.md`.

Metadata sumber, pembatasan data, dan audit split ada di
[`notebooks/DATASETS.md`](../notebooks/DATASETS.md).
