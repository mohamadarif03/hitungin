"""Normalisasi content notebook dari Colab CLI 0.7.5 menjadi JSON nbformat."""
import ast,json
from pathlib import Path

folder=Path(__file__).resolve().parents[2]/'notebooks'
for path in folder.glob('*_output.ipynb'):
    text=path.read_text()
    try:json.loads(text)
    except json.JSONDecodeError:
        # CLI lama menulis repr(dict) untuk respons API bertipe notebook.
        # literal_eval hanya membaca literal Python, tidak mengeksekusi kode.
        value=ast.literal_eval(text)
        assert isinstance(value,dict) and value.get('nbformat')==4,path
        path.write_text(json.dumps(value,ensure_ascii=False,indent=1)+'\n')
        print('Transport notebook dinormalisasi:',path.name)
