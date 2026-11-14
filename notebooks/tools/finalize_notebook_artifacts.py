"""Verifikasi model tersimpan dan buat paket notebook yang siap dibuka."""
import hashlib,json,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
results={}
for task in ['bisindo','tulisan_tangan','suara_indonesia']:
    archive=ROOT/'artifacts'/f'{task}.zip'
    folder=ROOT/'artifacts'/task
    with zipfile.ZipFile(archive) as source:
        manifest=json.loads(source.read('manifest.json'))
        for member in source.infolist():
            assert (folder/member.filename).resolve().is_relative_to(folder.resolve())
        source.extractall(folder)
    for item in manifest:
        path=folder/item['file'];digest=hashlib.sha256()
        with path.open('rb') as handle:
            for block in iter(lambda:handle.read(1024*1024),b''):digest.update(block)
        assert path.stat().st_size==item['bytes'],path
        assert digest.hexdigest()==item['sha256'],path
    results[task]={'metrics':json.loads((folder/'metrics.json').read_text()),
                   'archive':str(archive.relative_to(ROOT)),
                   'verified_files':len(manifest)}
    print('Artefak tervalidasi:',task,len(manifest),'berkas')
summary=ROOT/'notebooks/hasil_eksperimen.json'
summary.write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
bundle=ROOT/'artifacts/HITUNGIN_Notebook_CRISP_DM.zip'
with zipfile.ZipFile(bundle,'w',compression=zipfile.ZIP_DEFLATED) as archive:
    for path in sorted((ROOT/'notebooks').rglob('*')):
        if path.is_file():archive.write(path,str(path.relative_to(ROOT)))
print('Paket notebook:',bundle,'bytes:',bundle.stat().st_size)
