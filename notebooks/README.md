# Notebook CRISP-DM HITUNGIN

Tiga notebook mandiri berbahasa Indonesia, dengan cover logo Universitas
Brawijaya, ditujukan untuk Google Colab GPU T4.

| Notebook | Tugas | Artefak akhir |
|---|---|---|
| `01_bisindo.ipynb` | Digit isyarat BISINDO 0–9; landmark dua tangan → MLP | PyTorch, ONNX, preprocessing, laporan |
| `02_tulisan_tangan.ipynb` | Bilangan tulisan tangan utuh; CNN + BiGRU + CTC | PyTorch, ONNX, preprocessing, decoder, laporan |
| `03_suara_indonesia.ipynb` | Whisper Indonesia; baseline, fine-tuning, seleksi model | `save_pretrained`, processor, parser, model card, laporan |

Masing-masing mencakup enam tahap CRISP-DM: Pemahaman Bisnis, Pemahaman Data,
Persiapan Data, Pemodelan, Evaluasi, Deployment dan Penyimpanan Model. Semua
metrik dihitung saat eksekusi, bukan diisi sebagai klaim hasil.

## Menjalankan di Colab

1. Unggah notebook ke Google Colab dan pilih runtime GPU T4.
2. Jalankan sel dari atas ke bawah. Data publik diunduh bila belum ada.
3. Profil default `poc` menjalankan eksperimen terbatas yang benar-benar melatih
   model. Untuk eksperimen lebih panjang, set environment `HITUNGIN_PROFILE=full`
   sebelum sel konfigurasi, lalu jalankan ulang seluruh notebook.
4. Unduh ZIP artefak pada bagian akhir. Penyimpanan `/content` bersifat sementara.

Notebook dengan suffix `_output.ipynb` berisi keluaran eksekusi Colab CLI.
Notebook tanpa suffix merupakan versi bersih untuk eksperimen ulang.

## Menjalankan lewat Colab CLI

CLI harus sudah terautentikasi. Contoh berikut memakai wrapper lokal yang
meredaksi token proxy jika CLI menampilkan URL error.

```bash
rtk proxy python notebooks/tools/colab_cli.py new -s hitungin-notebooks --gpu T4
rtk proxy python notebooks/tools/colab_cli.py exec -s hitungin-notebooks -f notebooks/01_bisindo.ipynb --timeout 1200
rtk proxy python notebooks/tools/colab_cli.py exec -s hitungin-notebooks -f notebooks/02_tulisan_tangan.ipynb --timeout 1800
```

Untuk notebook suara, gunakan kernel terpisah melalui runner yang berhenti pada
error pertama. Runner memasang Transformers 4.52.0, yang diuji untuk backward
Whisper pada runtime ini, sebelum membuat kernel notebook baru:

```bash
rtk proxy python notebooks/tools/colab_cli.py upload -s hitungin-notebooks notebooks/03_suara_indonesia.ipynb /content/03_suara_indonesia.ipynb
rtk proxy python notebooks/tools/colab_cli.py exec -s hitungin-notebooks -f notebooks/tools/colab_run_notebook.py --timeout 3600
rtk proxy python notebooks/tools/colab_cli.py download -s hitungin-notebooks /content/03_suara_indonesia_output.ipynb notebooks/03_suara_indonesia_output.ipynb
rtk proxy python notebooks/tools/normalize_notebook_download.py
```

Jalankan bergantian pada satu kernel. Simpan/unduh artefak sebelum melepaskan VM:

```bash
rtk proxy python notebooks/tools/colab_cli.py stop -s hitungin-notebooks
```

Tidak ada mount Drive atau akses akun dataset yang diwajibkan. Training Colab
menggunakan data publik di server; istilah *inferensi lokal* mengacu pada rencana
aplikasi browser, bukan berarti training ini dilakukan di laptop pengguna.

## Interpretasi hasil

- BISINDO: split publik tidak memiliki ID pengisyarat. Evaluasi internal tidak
  membuktikan generalisasi ke pengisyarat baru. Kontrak urutan tangan perlu
  diverifikasi terhadap extractor browser.
- Tulisan tangan: evaluasi memakai bilangan sintetis dari digit publik. Orientasi
  EMNIST diperbaiki dan duplikasi piksel lintas partisi diaudit. Domain kanvas
  touchscreen serta pemisahan penulis belum tervalidasi.
- Suara: CDSR menguji connected digits penutur dewasa. Exact match digit tidak
  sama dengan akurasi frasa kardinal 0–100. Empat ID penutur yang overlap pada
  split sumber dikeluarkan dari evaluasi akhir. Baseline boleh terpilih bila
  fine-tuning tidak memperbaiki validasi.
- Profil PoC suara menyeimbangkan prefix F/M dari metadata penutur sumber pada
  setiap partisi; ini bukan jaminan keterwakilan usia, aksen, atau kondisi akses.
- ONNX MLP dan CRNN diperiksa kesetaraannya di ONNX Runtime CPU. Ini bukan
  benchmark ONNX Runtime Web. Integrasi browser dan ekspor Whisper int8 dijelaskan
  di `../docs/local-ai.md`, terpisah dari metrik checkpoint notebook.

## Sumber dan pemeliharaan

Sumber notebook berada di `src/` (percent-format) dan generator di
`tools/build_notebooks.py`. Jalankan generator untuk membuat ulang versi
bersih. Cover menyematkan logo sehingga tidak membutuhkan koneksi gambar saat
dibuka; asal berkas dicatat di `assets/SOURCE.md`.

Data dan batas lisensi dijelaskan pada `DATASETS.md`. Data mentah,
checkpoint, dan paket transfer Colab dikecualikan dari Git.

## Hasil eksekusi profil PoC

Ketiga notebook dijalankan melalui Colab CLI pada GPU Tesla T4. Semua sel pada
versi `_output.ipynb` selesai tanpa error; ekspor/muat ulang diperiksa.

| Tugas | Hasil evaluasi internal | Batas interpretasi |
|---|---|---|
| BISINDO | Akurasi 97,69%, macro-F1 97,55%, 130 sampel | Tidak terpisah berdasarkan pengisyarat |
| Tulisan tangan | Exact match 87,6%, CER 6,73%, 1.000 bilangan | Data sintetis, sasaran awal 95% belum tercapai |
| Suara | Exact match digit 100%, WER 0%, 64 rekaman test | Subset connected digits kecil; bukan audio kardinal atau anak |

Validasi suara meningkat dari 87,5% pada baseline menjadi 98,44% setelah 40
optimizer steps. Pemilihan model dilakukan dari validasi. Hasil test 64 rekaman
tidak boleh disajikan sebagai akurasi umum Bahasa Indonesia.

Menjalankan notebook menyimpan checkpoint pada `artifacts/` lokal. Model browser
untuk aplikasi diletakkan di `public/models/`; lihat `docs/local-ai.md` dari root repo.
Rincian mesin-baca terdapat dalam `hasil_eksperimen.json`.
