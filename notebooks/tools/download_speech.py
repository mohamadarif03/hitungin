"""Download the pinned speech corpus as parallel, Git-verified source files."""
import concurrent.futures
import hashlib
import json
import threading

import requests

from download_data import DATA, SPEECH_COMMIT, extract_zip

LOCAL = threading.local()


def fetch(entry):
    path = DATA / "raw/speech" / f"data_indsp_digit_cdsr-{SPEECH_COMMIT}" / entry["path"]
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        if not hasattr(LOCAL, "session"):
            LOCAL.session = requests.Session()
        url = f"https://raw.githubusercontent.com/s-sakti/data_indsp_digit_cdsr/{SPEECH_COMMIT}/{entry['path']}"
        response = LOCAL.session.get(url, timeout=(30, 120))
        response.raise_for_status()
        content = response.content
        assert len(content) == entry["size"], entry["path"]
        digest = hashlib.sha1(f"blob {len(content)}\0".encode() + content).hexdigest()
        assert digest == entry["sha"], entry["path"]
        partial = path.with_suffix(path.suffix + ".part")
        partial.write_bytes(content)
        partial.replace(path)
    content = path.read_bytes()
    assert hashlib.sha1(f"blob {len(content)}\0".encode() + content).hexdigest() == entry["sha"], path
    if path.suffix == ".zip":
        extract_zip(path, path.parent / path.stem)
    return entry["size"]


if __name__ == "__main__":
    response = requests.get(
        f"https://api.github.com/repos/s-sakti/data_indsp_digit_cdsr/git/trees/{SPEECH_COMMIT}?recursive=1",
        timeout=30)
    response.raise_for_status()
    tree = response.json()
    assert not tree.get("truncated"), "Incomplete Git tree"
    files = [entry for entry in tree["tree"] if entry["type"] == "blob"]
    (DATA / "speech_source_tree.json").write_text(json.dumps(tree, indent=2) + "\n")
    total = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(fetch, entry) for entry in files]
        for count, future in enumerate(concurrent.futures.as_completed(futures), 1):
            total += future.result()
            if count % 100 == 0:
                print(f"Speech: {count}/{len(files)} source files, {total/1e6:.1f} MB verified", flush=True)
    result = {"dataset": "indspeech-digit-cdsr", "commit": SPEECH_COMMIT,
              "source_files": len(files), "bytes": total,
              "integrity": "Each source file verified against its Git blob SHA-1",
              "tree": "data/speech_source_tree.json"}
    (DATA / "speech_download_manifest.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result), flush=True)
