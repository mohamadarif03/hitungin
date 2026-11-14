"""Kemas data lokal yang dibutuhkan profil PoC agar Colab tidak mengunduh ulang."""
import tarfile
import sys
from pathlib import Path
import numpy as np
import pandas as pd

ROOT=Path(__file__).resolve().parents[2]
source=next((ROOT/'data/raw/speech').glob('data_indsp_digit_cdsr-*'))
rows=[]
for split in ['train','test1','test2','test3','test4']:
    for stem in (source/'lst'/f'{split}_fname.lst').read_text().split():
        rows.append({'split':split,'stem':stem,'speaker':stem.split('_')[0]})
index=pd.DataFrame(rows)
train=set(index.loc[index.split=='train','speaker']);test=set(index.loc[index.split!='train','speaker'])
speakers=sorted(train);np.random.default_rng(42).shuffle(speakers)
n=round(len(speakers)*0.2)
def balanced(candidates,limit):
    rng=np.random.default_rng(42);chosen=[]
    for prefix in ['F','M']:
        group=sorted(s for s in candidates if s.startswith(prefix));rng.shuffle(group);chosen.extend(group[:limit//2])
    return set(chosen)
fit_sp=balanced(set(speakers[n:]),16);val_sp=balanced(set(speakers[:n]),8);test_sp=balanced(test-train,8)
parts=[]
for mask,limit in [((index.split=='train')&index.speaker.isin(fit_sp),512),
                   ((index.split=='train')&index.speaker.isin(val_sp),64),
                   ((index.split!='train')&index.speaker.isin(test_sp),64)]:
    parts.append(index.loc[mask].sample(frac=1,random_state=42).head(limit))
selected=pd.concat(parts)
files=[]
for name in ([] if '--speech-only' in sys.argv else ['mnist','emnist','bisindo']):
    files.extend(p for p in (ROOT/'data/raw'/name).rglob('*') if p.is_file())
files.extend(p for p in (source/'lst').glob('*') if p.is_file())
files.extend([source/'README.md',source/'LICENSE_CC-BY-NC-SA-4.0.txt'])
for row in selected.itertuples():
    for group,ext in [('speech','.wav'),('text','.txt')]:
        paths=list((source/group/row.split/row.speaker).rglob(row.stem+ext))
        assert len(paths)==1,(row,group)
        files.append(paths[0])
dest=ROOT/'data/.colab-transfer';dest.mkdir(parents=True,exist_ok=True)
with tarfile.open(dest/'poc-data.tar','w') as archive:
    for path in sorted(set(files)):archive.add(path,arcname=str(path.relative_to(ROOT)),recursive=False)
print('Paket:',dest/'poc-data.tar', 'MB:',(dest/'poc-data.tar').stat().st_size/1e6,'rekaman:',len(selected))
