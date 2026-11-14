"""Bangun notebook mandiri dari sumber percent-format berbahasa Indonesia."""
import ast
import base64
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'notebooks'

COMMON = '''
import os, sys, json, random, time, copy, hashlib, platform
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import torch
from IPython.display import display

ROOT = Path('/content/hitungin') if Path('/content').exists() else Path.cwd()
if ROOT.name == 'notebooks':
    ROOT = ROOT.parent
ROOT.mkdir(parents=True, exist_ok=True)
PROFILE = os.environ.get('HITUNGIN_PROFILE', 'poc')
assert PROFILE in {'poc', 'full'}
SEED = 42
random.seed(SEED); np.random.seed(SEED); torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)
torch.set_num_threads(2)
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
plt.rcParams.update({'figure.figsize': (9, 4), 'axes.spines.top': False,
                     'axes.spines.right': False, 'axes.grid': False})
print({'profil': PROFILE, 'perangkat': str(DEVICE), 'python': platform.python_version(),
       'torch': torch.__version__, 'root': str(ROOT)})
if DEVICE.type == 'cuda':
    print('GPU:', torch.cuda.get_device_name(0))

def save_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False, default=str) + '\\n')

def save_environment(folder):
    import importlib.metadata as metadata
    names = ['torch', 'numpy', 'pandas', 'scikit-learn', 'onnx', 'onnxruntime',
             'transformers', 'accelerate', 'jiwer', 'soundfile']
    versions = {}
    for name in names:
        try: versions[name] = metadata.version(name)
        except metadata.PackageNotFoundError: pass
    save_json(folder / 'environment.json', versions)

def index_artifacts(folder):
    records = []
    for path in sorted(folder.rglob('*')):
        if path.is_file() and path.name != 'manifest.json':
            sha = hashlib.sha256()
            with path.open('rb') as handle:
                for block in iter(lambda: handle.read(1024*1024), b''): sha.update(block)
            records.append({'file': str(path.relative_to(folder)), 'bytes': path.stat().st_size,
                            'sha256': sha.hexdigest()})
    save_json(folder / 'manifest.json', records)
    return pd.DataFrame(records)
'''


def cell(kind, text):
    result = {'cell_type': kind, 'metadata': {}, 'source': text.strip() + '\n',
              'id': hashlib.sha256(text.encode()).hexdigest()[:12]}
    if kind == 'code': result.update(execution_count=None, outputs=[])
    return result


def downloader(names):
    source = (ROOT / 'notebooks/tools/download_data.py').read_text()
    nodes = ast.parse(source).body
    imports = '\n'.join(ast.get_source_segment(source, node) for node in nodes
                        if isinstance(node, (ast.Import, ast.ImportFrom)))
    functions = '\n\n'.join(ast.get_source_segment(source, node) for node in nodes
                            if isinstance(node, (ast.FunctionDef, ast.ClassDef)) and node.name in names)
    return imports + '\nDATA = ROOT / "data"\nDATA.mkdir(exist_ok=True)\n' + functions


def main():
    logo = base64.b64encode((OUT / 'assets/logo-ub-cover.png').read_bytes()).decode()
    tasks = [
        ('01_bisindo', 'PENGENALAN ISYARAT ANGKA BISINDO', 'MediaPipe · MLP · ONNX',
         'requests pandas numpy matplotlib scikit-learn onnx==1.19.1 onnxruntime==1.23.2', ['download', 'extract_zip', 'bisindo']),
        ('02_tulisan_tangan', 'PENGENALAN BILANGAN TULISAN TANGAN', 'CNN · BiGRU · CTC · ONNX',
         'requests pandas numpy matplotlib scikit-learn pillow onnx==1.19.1 onnxruntime==1.23.2', ['download', 'RemoteZipReader', 'mnist', 'emnist']),
        ('03_suara_indonesia', 'PENGENALAN ANGKA LISAN BAHASA INDONESIA', 'Whisper · Fine-tuning · Evaluasi Numerik',
         'requests pandas numpy matplotlib scikit-learn soundfile jiwer transformers==4.52.0 accelerate==1.12.0', []),
    ]
    for slug, title, subtitle, packages, downloads in tasks:
        cover = f'''<div align="center">
<img src="data:image/png;base64,{logo}" alt="Lambang Universitas Brawijaya" width="180" />

# {title}

## HITUNGIN

**{subtitle}**

Notebook eksperimen pembelajaran mesin · LOGICODIX 2026  
Universitas Brawijaya · Malang · 2026

**Penyusun: Tim HITUNGIN**

</div>

---

**Alur CRISP-DM:** Pemahaman Bisnis → Pemahaman Data → Persiapan Data → Pemodelan → Evaluasi → Deployment.

**Cara menjalankan:** pilih runtime GPU T4 di Google Colab, kemudian jalankan sel secara berurutan.
Profil `poc` adalah eksperimen terbatas yang benar-benar melatih dan mengevaluasi model;
ubah `HITUNGIN_PROFILE=full` sebelum sel konfigurasi untuk eksperimen lebih panjang.
Hasil pengenalan selalu dikonfirmasi pengguna sebelum dinilai dengan aturan matematika.
Logo merupakan identitas cover, bukan tanda pengesahan universitas.
'''
        cells = [cell('markdown', cover), cell('markdown', '''## Petunjuk reproduksi

Notebook ini mandiri: mengunduh data publik bila belum tersedia, menetapkan seed,
mencatat versi paket, dan menyimpan artefak di `artifacts/`. Direktori runtime Colab
bersifat sementara. Unduh ZIP artefak di akhir sebelum menutup sesi.
Nilai metrik tidak diisi manual; semuanya dihitung oleh sel evaluasi.
'''), cell('code', '# @title Instalasi dependensi\n%pip -q install ' + packages),
                 cell('code', '# @title Konfigurasi eksperimen dan utilitas\n' + COMMON)]
        if downloads:
            cells.append(cell('code', '# @title Pengunduh sumber publik (dapat dijalankan ulang)\n' + downloader(downloads)))
        text = (OUT / 'src' / f'{slug}.py').read_text()
        for part in re.split(r'^# %%', text, flags=re.M):
            if not part.strip(): continue
            if part.startswith(' [markdown]'):
                lines = part.splitlines()[1:]
                md = '\n'.join(line[2:] if line.startswith('# ') else (line[1:] if line.startswith('#') else line) for line in lines)
                cells.append(cell('markdown', md))
            else:
                cells.append(cell('code', part.lstrip('\n')))
        nb = {'cells': cells, 'metadata': {'kernelspec': {'display_name': 'Python 3', 'language': 'python', 'name': 'python3'},
              'language_info': {'name': 'python', 'version': '3.13'}, 'accelerator': 'GPU',
              'colab': {'name': f'{slug}.ipynb', 'provenance': [], 'gpuType': 'T4'}}, 'nbformat': 4, 'nbformat_minor': 5}
        path = OUT / f'{slug}.ipynb'
        path.write_text(json.dumps(nb, ensure_ascii=False, indent=1) + '\n')
        print(path.relative_to(ROOT), len(cells), 'sel')


if __name__ == '__main__':
    main()
