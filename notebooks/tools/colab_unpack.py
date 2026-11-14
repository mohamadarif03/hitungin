from pathlib import Path
import tarfile
p=Path('/content/hitungin')
parts=sorted(Path('/content').glob('poc-data.part*'))
if parts:
    with Path('/content/poc-data.tar').open('wb') as output:
        for part in parts:
            with part.open('rb') as source:
                import shutil
                shutil.copyfileobj(source,output)
with tarfile.open('/content/poc-data.tar') as archive:
    archive.extractall(p,filter='data')
print('Data PoC tersedia:', len(list((p/'data/raw').rglob('*.wav'))), 'rekaman audio')
