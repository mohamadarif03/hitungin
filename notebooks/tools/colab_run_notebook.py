"""Eksekusi notebook suara dalam kernel terpisah dan hentikan pada error pertama."""
# Lepaskan referensi GPU dari eksperimen interaktif sebelumnya.
get_ipython().run_line_magic('reset','-f')
import gc,sys,subprocess
import torch
gc.collect();torch.cuda.empty_cache()
result=subprocess.run([sys.executable,'-m','pip','install','--quiet','nbclient','ipykernel',
                       'transformers==4.52.0'],capture_output=True,text=True)
if result.returncode:
    print(result.stderr[-4000:]);raise RuntimeError('Dependensi kernel notebook gagal dipasang')
import nbformat
from nbclient import NotebookClient
from pathlib import Path
source=Path('/content/03_suara_indonesia.ipynb')
output=Path('/content/03_suara_indonesia_output.ipynb')
nb=nbformat.read(source,as_version=4)

def progress(cell,cell_index,**kwargs):
    if cell.cell_type=='code':print(f'Sel {cell_index+1}/{len(nb.cells)}: {cell.source.splitlines()[0]}',flush=True)

client=NotebookClient(nb,timeout=1800,kernel_name='python3',allow_errors=False,
                      resources={'metadata':{'path':'/content/hitungin'}},on_cell_start=progress)
try:
    client.execute()
finally:
    nbformat.write(nb,output)
print('Notebook selesai tanpa error:',output,flush=True)
