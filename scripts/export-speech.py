"""Export the trained Whisper checkpoint, quantize, and shard browser weights.

Run in Python 3.11 with torch (CPU), transformers==4.52.0, optimum-onnx==0.1.0,
onnx==1.19.1 and onnxruntime==1.23.2. No dataset or credentials are required.
"""
import argparse
import hashlib
import json
import shutil
from pathlib import Path

import onnx
import torch
from onnx import external_data_helper
from onnxruntime.quantization import QuantType, quantize_dynamic
from optimum.exporters.onnx import main_export
from transformers import WhisperTokenizerFast

parser=argparse.ArgumentParser()
parser.add_argument('--checkpoint',type=Path,required=True)
parser.add_argument('--output',type=Path,default=Path('public/models/speech'))
parser.add_argument('--work',type=Path,default=Path('artifacts/speech-export'))
args=parser.parse_args()
torch.set_num_threads(4)
args.output.mkdir(parents=True,exist_ok=True);args.work.mkdir(parents=True,exist_ok=True)
if not (args.work/'decoder_model_merged.onnx').exists():
    main_export(str(args.checkpoint.resolve()),args.work,
                task='automatic-speech-recognition-with-past',opset=18,
                device='cpu',local_files_only=True,do_validation=True)

def tensors(graph):
    yield from graph.initializer
    for node in graph.node:
        for attr in node.attribute:
            if attr.type==onnx.AttributeProto.GRAPH:yield from tensors(attr.g)
            elif attr.type==onnx.AttributeProto.GRAPHS:
                for subgraph in attr.graphs:yield from tensors(subgraph)

chunks={}
for name in ['encoder_model','decoder_model_merged']:
    quantized=args.work/f'{name}_quantized.onnx'
    if not quantized.exists():
        quantize_dynamic(args.work/f'{name}.onnx',quantized,per_channel=True,
                         weight_type=QuantType.QInt8,op_types_to_quantize=['MatMul','Gemm','Gather'],
                         extra_options={'EnableSubgraph':True,'MatMulConstBOnly':True})
    model=onnx.load(quantized)
    base=f'{name}_quantized.onnx'
    folder=args.output/'onnx';folder.mkdir(exist_ok=True)
    part=0;offset=0;handle=None
    # 24 MiB files remain comfortably below GitHub's per-blob limit. Names follow
    # Transformers.js use_external_data_format, including initializers in If graphs.
    for tensor in tensors(model.graph):
        if not tensor.HasField('raw_data') or len(tensor.raw_data)<1024:continue
        raw=tensor.raw_data
        if handle is None or offset+len(raw)>24*1024*1024:
            if handle:handle.close();part+=1
            filename=base+'_data'+('' if part==0 else f'_{part}')
            handle=(folder/filename).open('wb');offset=0
        handle.write(raw)
        external_data_helper.set_external_data(tensor,location=filename,offset=offset,length=len(raw))
        tensor.ClearField('raw_data');offset+=len(raw)
    if handle:handle.close()
    onnx.save(model,folder/base)
    onnx.checker.check_model(str(folder/base))
    chunks[name]=part+1
    print('Exported',name,'shards:',part+1,flush=True)

for path in args.checkpoint.iterdir():
    if path.suffix in {'.json','.txt'}:shutil.copyfile(path,args.output/path.name)
WhisperTokenizerFast.from_pretrained(args.checkpoint,local_files_only=True).save_pretrained(args.output)
config=json.loads((args.output/'config.json').read_text())
config['transformers.js_config']={'dtype':'q8','use_external_data_format':chunks}
(args.output/'config.json').write_text(json.dumps(config,indent=2)+'\n')
records=[]
for path in sorted(args.output.rglob('*')):
    if path.is_file() and path.name!='manifest.json':
        records.append({'path':str(path.relative_to(args.output)), 'bytes':path.stat().st_size,
                        'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
(args.output/'manifest.json').write_text(json.dumps({'checkpoint_sha256':hashlib.sha256(
    (args.checkpoint/'model.safetensors').read_bytes()).hexdigest(),
    'quantization':'dynamic int8, per channel, MatMul/Gemm/Gather including decoder subgraphs',
    'files':records,'total_bytes':sum(r['bytes'] for r in records)},indent=2)+'\n')
print('Browser model ready:',args.output,flush=True)
