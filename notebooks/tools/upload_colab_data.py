"""Transfer paket data melalui potongan kecil agar tidak melewati batas API."""
import subprocess
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
folder=ROOT/'data/.colab-transfer'
session=sys.argv[1] if len(sys.argv)>1 else 'hitungin-notebooks'
with (folder/'poc-data.tar').open('rb') as source:
    index=0
    while block:=source.read(24*1024*1024):
        name=f'poc-data.part{index:03d}'
        path=folder/name;path.write_bytes(block)
        subprocess.run([sys.executable,str(ROOT/'notebooks/tools/colab_cli.py'),'upload','-s',session,str(path),f'/content/{name}'],check=True)
        print('Potongan terkirim:',index,flush=True);index+=1
print('Jumlah potongan:',index,flush=True)
