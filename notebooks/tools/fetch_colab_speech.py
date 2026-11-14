"""Ambil arsip model suara lewat Colab CLI dan verifikasi integritasnya."""
import concurrent.futures,hashlib,json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
session=sys.argv[1] if len(sys.argv)>1 else 'hitungin-speech'
folder=ROOT/'artifacts/.speech-transfer';folder.mkdir(parents=True,exist_ok=True)

def fetch(name):
    path=folder/name
    if not path.exists():
        subprocess.run([sys.executable,str(ROOT/'notebooks/tools/colab_cli.py'),'download','-s',session,
                        f'/content/speech-export/{name}',str(path)],check=True)
    return path

manifest=json.loads(fetch('manifest.json').read_text())
def fetch_part(part):
    path=fetch(part['name'])
    assert path.stat().st_size==part['bytes'],path
    assert hashlib.sha256(path.read_bytes()).hexdigest()==part['sha256'],path
    return path

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    paths=list(pool.map(fetch_part,manifest['parts']))
target=ROOT/'artifacts/suara_indonesia.zip';digest=hashlib.sha256()
with target.open('wb') as output:
    for path in paths:
        block=path.read_bytes();output.write(block);digest.update(block)
assert target.stat().st_size==manifest['bytes']
assert digest.hexdigest()==manifest['sha256']
print('Arsip model suara tersimpan dan SHA-256 cocok:',target)
for path in paths:path.unlink()
