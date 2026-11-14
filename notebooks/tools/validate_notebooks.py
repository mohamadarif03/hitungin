"""Validasi struktur, sintaks, kelengkapan CRISP-DM, dan hasil eksekusi notebook."""
import ast
from pathlib import Path
import nbformat

ROOT=Path(__file__).resolve().parents[2]
paths=sorted((ROOT/'notebooks').glob('*.ipynb'))
assert len(paths)>=3,'Notebook belum dibuat'
for path in paths:
    notebook=nbformat.read(path,as_version=4)
    nbformat.validate(notebook)
    markdown='\n'.join(c.source for c in notebook.cells if c.cell_type=='markdown')
    for name in ['Pemahaman Bisnis','Pemahaman Data','Persiapan Data','Pemodelan','Evaluasi','Deployment']:
        assert name in markdown,(path,name)
    assert 'data:image/png;base64,' in notebook.cells[0].source,(path,'Logo belum disematkan')
    code_cells=[c for c in notebook.cells if c.cell_type=='code']
    for cell in code_cells:
        ast.parse('\n'.join(line for line in cell.source.splitlines() if not line.startswith('%')))
        errors=[out for out in cell.get('outputs',[]) if out.output_type=='error']
        assert not errors,(path,[(e.ename,e.evalue) for e in errors])
    if '_output' in path.stem:
        # Colab CLI 0.7.5 menyimpan outputs tetapi tidak mengisi execution_count.
        assert code_cells[-1].get('outputs'),(path,'Sel paket artefak akhir belum memiliki keluaran')
        assert sum(bool(c.get('outputs')) for c in code_cells)>=len(code_cells)//2,(path,'Keluaran tidak lengkap')
    print(path.name, 'VALID',len(notebook.cells),'sel',sum(bool(c.get('outputs')) for c in code_cells),'dengan output')
