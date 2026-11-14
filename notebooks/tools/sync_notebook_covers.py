"""Perbarui sel presentasi tanpa mengubah kode atau hasil eksperimen tersimpan."""
import json,re
from pathlib import Path

folder=Path(__file__).resolve().parents[2]/'notebooks'
for output in folder.glob('*_output.ipynb'):
    source=folder/(output.stem.removesuffix('_output')+'.ipynb')
    clean=json.loads(source.read_text());executed=json.loads(output.read_text())
    assert len(clean['cells'])==len(executed['cells']),output
    for a,b in zip(clean['cells'],executed['cells']):
        assert a['cell_type']==b['cell_type'],output
        if a['cell_type']=='code':
            left=''.join(a['source']) if isinstance(a['source'],list) else a['source']
            right=''.join(b['source']) if isinstance(b['source'],list) else b['source']
            assert left==right,(output,'Kode berbeda; jalankan ulang notebook')
        else:
            b['source']=a['source']
            b['id']=a['id']
    for cell in executed['cells']:
        for item in cell.get('outputs',[]):
            value=item.get('text','')
            text=''.join(value) if isinstance(value,list) else value
            match=re.search(r"'python': '([^']+)'",text)
            if match:executed['metadata'].setdefault('language_info',{})['version']=match.group(1)
    output.write_text(json.dumps(executed,ensure_ascii=False,indent=1)+'\n')
    print('Presentasi tersinkron:',output.name)
