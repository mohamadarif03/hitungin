# HITUNGIN public PoC data

Run `python scripts/download_data.py` from the project root (Python 3.10+ and
`requests` required). Raw datasets and download archives are excluded from Git.
The downloader records source URLs, versions, byte counts, and archive SHA-256
hashes in `download_manifest.json`. Speech source files are downloaded in parallel
and verified against the pinned Git tree in `speech_source_tree.json`.
Structural checks are recorded separately in `verification.json`.

| Task | Source | Local destination | Terms / scope |
| --- | --- | --- | --- |
| BISINDO recognition | [Adjie: BISINDO MediaPipe Hand Landmarks](https://www.kaggle.com/datasets/suryaadji/bisindo-alphabet-mediapipe-hand-landmarks), version 3 | `raw/bisindo/` | CC BY 4.0 according to the saved publisher metadata. Contains alphabet, static-number, and dynamic-number files. Use the number subsets for this PoC. |
| Handwritten number recognition | [MNIST](https://ossci-datasets.s3.amazonaws.com/mnist/) | `raw/mnist/` | Four original compressed IDX files, with the original train/test separation. |
| Additional handwritten digits | [NIST EMNIST](https://www.nist.gov/itl/products-and-services/emnist-dataset) | `raw/emnist/` | Fetch only `emnist-digits-*` members from the official ZIP using HTTP ranges; member CRCs are checked. |
| Indonesian speech evaluation | [INDspeech_DIGIT_CDSR](https://github.com/s-sakti/data_indsp_digit_cdsr) | `raw/speech/` | CC BY-NC-SA 4.0 plus the publisher's restriction on publicly redistributing copies without permission. Original README and license are included. |

## Usage notes

- This task downloads data only. No models are trained, and synthetic handwriting
  sequences have not yet been generated.
- BISINDO landmark feature order, coordinate conventions, and normalization must
  match the browser extractor before training/inference. The public publisher
  description is alphabet-focused even though version 3 includes number files.
- Do not call a publisher-provided validation split an unseen-signer test unless
  signer metadata establishes that separation. The downloaded static-number CSVs
  contain 582 training rows and 151 validation rows, with 126 features and a
  `label` column. Labels span 0–10. There are no signer-ID columns and no exact
  duplicate rows across these two files.
- Generate multi-digit handwriting sequences separately within source partitions
  to avoid reusing original digit images across training and evaluation. Check
  MNIST/EMNIST overlap before combining their evaluation sets.
- CDSR contains connected spoken digits, including `nol` and `kosong`; it is not
  a benchmark of Indonesian cardinal phrases such as `dua puluh lima`, nor of
  children's speech. Preserve the original split lists. Four speaker IDs overlap
  between the published training and testing speaker lists, so the supplied test
  split must not be described as fully speaker-independent without further audit.
- Retain dataset attribution and source terms. Do not commit or publicly mirror
  the speech corpus. Regular application sessions do not collect training data.
