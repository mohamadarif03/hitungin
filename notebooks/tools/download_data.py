"""Download the public PoC datasets without credentials. Requires requests."""
import concurrent.futures
import hashlib
import io
import json
import subprocess
import sys
import time
import zipfile
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"
SPEECH_COMMIT = "b2eefc10fc649149cdb634c74e23af26d6a210c8"


def download(url, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        partial = path.with_suffix(path.suffix + ".part")
        for attempt in range(3):
            try:
                offset = partial.stat().st_size if partial.exists() else 0
                headers = {"Range": f"bytes={offset}-"} if offset else {}
                with requests.get(url, headers=headers, stream=True, timeout=(30, 120)) as response:
                    response.raise_for_status()
                    append = offset and response.status_code == 206
                    if append:
                        assert response.headers.get("Content-Range", "").startswith(f"bytes {offset}-"), "Invalid resume response"
                    with partial.open("ab" if append else "wb") as output:
                        for chunk in response.iter_content(1024 * 1024):
                            output.write(chunk)
                partial.replace(path)
                break
            except requests.RequestException:
                if attempt == 2:
                    raise
                time.sleep(2)
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return {"url": url, "path": str(path.relative_to(ROOT)),
            "bytes": path.stat().st_size, "sha256": digest.hexdigest()}


def extract_zip(archive, destination, select=lambda name: True):
    destination.mkdir(parents=True, exist_ok=True)
    base = destination.resolve()
    with zipfile.ZipFile(archive) as source:
        for member in source.infolist():
            if not select(member.filename):
                continue
            target = (destination / member.filename).resolve()
            if not target.is_relative_to(base):
                raise ValueError(f"Unsafe archive path: {member.filename}")
            source.extract(member, destination)


def bisindo():
    ref = "suryaadji/bisindo-alphabet-mediapipe-hand-landmarks"
    folder = DATA / "raw/bisindo"
    folder.mkdir(parents=True, exist_ok=True)
    response = requests.get(f"https://www.kaggle.com/api/v1/datasets/view/{ref}", timeout=30)
    response.raise_for_status()
    metadata = response.json()
    (folder / "source_metadata.json").write_text(json.dumps(metadata, indent=2))
    version = metadata["currentVersionNumber"]
    item = download(f"https://www.kaggle.com/api/v1/datasets/download/{ref}?datasetVersionNumber={version}",
                    DATA / f".downloads/bisindo-v{version}.zip")
    extract_zip(ROOT / item["path"], folder)
    return {"dataset": "bisindo", "version": version, "downloads": [item]}


def mnist():
    names = ["train-images-idx3-ubyte.gz", "train-labels-idx1-ubyte.gz",
             "t10k-images-idx3-ubyte.gz", "t10k-labels-idx1-ubyte.gz"]
    return {"dataset": "mnist", "downloads": [
        download(f"https://ossci-datasets.s3.amazonaws.com/mnist/{name}", DATA / "raw/mnist" / name)
        for name in names]}


class RemoteZipReader(io.RawIOBase):
    """Read selected official ZIP members via HTTP ranges, without the full ZIP."""
    def __init__(self, url):
        self.url = url
        self.session = requests.Session()
        response = self.session.get(url, headers={"Range": "bytes=0-0"}, timeout=30)
        response.raise_for_status()
        assert response.status_code == 206, "Source must support range requests"
        self.size = int(response.headers["Content-Range"].split("/")[-1])
        self.position = 0

    def seek(self, offset, whence=0):
        self.position = offset if whence == 0 else (self.position if whence == 1 else self.size) + offset
        return self.position

    def tell(self):
        return self.position

    def seekable(self):
        return True

    def read(self, size=-1):
        if size < 0:
            size = self.size - self.position
        size = min(size, self.size - self.position)
        if size <= 0:
            return b""
        start = self.position
        end = start + size - 1
        response = self.session.get(self.url, headers={"Range": f"bytes={start}-{end}"}, timeout=(30, 120))
        response.raise_for_status()
        assert response.status_code == 206, "Range request not honored"
        content = response.content
        assert len(content) == size, "Incomplete range response"
        self.position += size
        return content


def emnist():
    url = "https://biometrics.nist.gov/cs_links/EMNIST/gzip.zip"
    destination = DATA / "raw/emnist"
    destination.mkdir(parents=True, exist_ok=True)
    files = []
    with zipfile.ZipFile(RemoteZipReader(url)) as source:
        for member in source.infolist():
            if not Path(member.filename).name.startswith("emnist-digits-"):
                continue
            path = destination / Path(member.filename).name
            if not path.exists():
                content = source.read(member)  # ZipFile verifies each member's CRC.
                partial = path.with_suffix(path.suffix + ".part")
                partial.write_bytes(content)
                partial.replace(path)
            files.append({"url": url, "zip_member": member.filename,
                          "path": str(path.relative_to(ROOT)), "bytes": path.stat().st_size,
                          "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    return {"dataset": "emnist-digits", "method": "Official ZIP members via HTTP ranges", "downloads": files}


def speech():
    completed = DATA / "speech_download_manifest.json"
    if completed.exists():
        return json.loads(completed.read_text())
    subprocess.run([sys.executable, str(ROOT / "notebooks/tools/download_speech.py")], check=True)
    return json.loads(completed.read_text())


if __name__ == "__main__":
    DATA.mkdir(exist_ok=True)
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(task): task.__name__ for task in (bisindo, mnist, emnist, speech)}
        for future in concurrent.futures.as_completed(futures):
            name = futures[future]
            try:
                result = future.result()
                print(f"Completed {name}", flush=True)
            except Exception as error:
                result = {"dataset": name, "error": str(error)}
                print(f"Failed {name}: {error}", flush=True)
            results.append(result)
            (DATA / "download_manifest.json").write_text(json.dumps(results, indent=2) + "\n")
    if any("error" in result for result in results):
        raise SystemExit(1)
