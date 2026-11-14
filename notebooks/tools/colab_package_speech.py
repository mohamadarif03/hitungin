"""Pisahkan arsip model besar agar dapat diambil lewat batas ukuran API Colab."""
from pathlib import Path
import hashlib,json
source=Path('/content/hitungin/artifacts/suara_indonesia.zip')
folder=Path('/content/speech-export');folder.mkdir(exist_ok=True)
digest=hashlib.sha256();parts=[]
with source.open('rb') as handle:
    index=0
    while block:=handle.read(24*1024*1024):
        name=f'speech.part{index:03d}'
        (folder/name).write_bytes(block);digest.update(block)
        parts.append({'name':name,'bytes':len(block),'sha256':hashlib.sha256(block).hexdigest()})
        index+=1
manifest={'source':str(source),'bytes':source.stat().st_size,'sha256':digest.hexdigest(),'parts':parts}
(folder/'manifest.json').write_text(json.dumps(manifest,indent=2))
print('Arsip siap:',len(parts),'potongan;',source.stat().st_size,'bytes')
