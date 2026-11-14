# Whisper Indonesia hasil adaptasi HITUNGIN

Checkpoint dasar: Bagus/whisper-small-id-cv17, berlisensi Apache-2.0 sesuai model
card upstream yang disertakan. Model asal OpenAI Whisper berlisensi MIT.
Perubahan HITUNGIN: fine-tuning terbatas pada INDspeech_DIGIT_CDSR, ekspor ONNX,
kuantisasi int8 dan pembagian external data. Tanggal ekspor: 14 November 2026.

Model ini untuk PoC nonkomersial. Dataset adaptasi CDSR memakai CC BY-NC-SA 4.0
serta ketentuan tambahan penerbit. Ketentuan dataset dan hak atas turunan perlu
ditinjau sebelum pemakaian di luar PoC. Corpus audio tidak didistribusikan di repo.

Atribusi dataset: Sakti dan kontributor INDspeech_DIGIT_CDSR,
https://github.com/s-sakti/data_indsp_digit_cdsr .
Lisensi upstream disertakan pada ../licenses/ . Lihat ../../../docs/local-ai.md
untuk batas evaluasi, reproduksi dan atribusi tambahan.
