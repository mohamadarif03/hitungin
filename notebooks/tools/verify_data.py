"""Check downloaded dataset structure using only the Python standard library."""
import ast
import collections
import csv
import gzip
import json
import math
import struct
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"


def inspect_csv(path):
    with path.open() as source:
        reader = csv.DictReader(source)
        fields = reader.fieldnames
        assert fields and fields[-1] == "label", path
        labels = collections.Counter()
        rows = 0
        for row in reader:
            assert len(row) == len(fields) and None not in row, path
            assert all(math.isfinite(float(row[key])) for key in fields), path
            labels[row["label"]] += 1
            rows += 1
    return {"rows": rows, "features": len(fields) - 1, "labels": dict(labels)}


def inspect_npy(path):
    with path.open("rb") as source:
        magic = source.read(8)
        assert magic[:6] == b"\x93NUMPY", path
        size = 2 if magic[6] == 1 else 4
        length = int.from_bytes(source.read(size), "little")
        header = ast.literal_eval(source.read(length).decode("latin1"))
        payload = source.read()
    formats = {"<f4": "f", "<i4": "i", "<i8": "q"}
    fmt = "<" + formats[header["descr"]]
    assert len(payload) == math.prod(header["shape"]) * struct.calcsize(fmt), path
    values = [value for (value,) in struct.iter_unpack(fmt, payload)]
    assert all(math.isfinite(value) for value in values), path
    result = {"shape": header["shape"], "dtype": header["descr"]}
    if len(header["shape"]) == 1:
        result["labels"] = dict(collections.Counter(values))
    return result


def inspect_idx(path):
    with gzip.open(path, "rb") as source:
        zero, dtype, dimensions = struct.unpack(">HBB", source.read(4))
        assert zero == 0 and dtype == 8 and dimensions in (1, 3), path
        shape = struct.unpack(">" + "I" * dimensions, source.read(4 * dimensions))
        count = 0
        labels = collections.Counter()
        while chunk := source.read(1024 * 1024):
            count += len(chunk)
            if dimensions == 1:
                labels.update(chunk)
        assert count == math.prod(shape), path
    result = {"shape": shape, "uncompressed_payload_bytes": count}
    if dimensions == 1:
        result["labels"] = dict(labels)
        assert set(labels) == set(range(10)), path
    return result


if __name__ == "__main__":
    report = {}
    for path in sorted((DATA / "raw/bisindo").rglob("*.csv")):
        report[str(path.relative_to(ROOT))] = inspect_csv(path)
    for path in sorted((DATA / "raw/bisindo").rglob("*.npy")):
        report[str(path.relative_to(ROOT))] = inspect_npy(path)
    for folder in ("mnist", "emnist"):
        paths = sorted((DATA / "raw" / folder).rglob("*ubyte.gz"))
        assert len(paths) == 4, (folder, len(paths))
        for path in paths:
            report[str(path.relative_to(ROOT))] = inspect_idx(path)
    speech = DATA / "raw/speech"
    audio = sorted(speech.rglob("*.wav"))
    assert audio, "No extracted speech WAV files"
    formats = collections.Counter()
    seconds = 0
    for path in audio:
        with wave.open(str(path), "rb") as source:
            assert source.getnchannels() == 1 and source.getsampwidth() == 2, path
            assert source.getframerate() == 16000, path
            frames = source.getnframes()
            assert len(source.readframes(frames)) == frames * 2, path
            formats[f"{source.getframerate()}Hz/{source.getnchannels()}ch/{source.getsampwidth()*8}bit"] += 1
            seconds += frames / source.getframerate()
    report["speech"] = {"wav_files": len(audio), "duration_hours": seconds / 3600,
                        "formats": dict(formats),
                        "transcript_files": len(list(speech.rglob("*.txt")))}
    source = next(speech.glob("data_indsp_digit_cdsr-*"))
    train = set((source / "lst/train_spk.lst").read_text().split())
    test = set().union(*(set(path.read_text().split()) for path in (source / "lst").glob("test*_spk.lst")))
    report["speech"]["train_test_speaker_id_overlap"] = sorted(train & test)
    destination = DATA / "verification.json"
    destination.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"verified_entries": len(report), "speech": report["speech"],
                      "report": str(destination.relative_to(ROOT))}, indent=2))
