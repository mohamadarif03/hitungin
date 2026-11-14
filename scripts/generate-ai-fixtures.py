"""Generate browser parity fixtures from public digit/landmark samples, not speech recordings."""
import argparse,csv,gzip,json,struct
from pathlib import Path
import numpy as np
import onnxruntime as ort
from PIL import Image

parser=argparse.ArgumentParser();parser.add_argument('--data',type=Path,required=True);args=parser.parse_args()
root=Path(__file__).resolve().parents[1];out=root/'tests/fixtures';out.mkdir(parents=True,exist_ok=True)
with (args.data/'bisindo/Numbers/Static/landmarks_numbers_train.csv').open() as f:rows=list(csv.DictReader(f))
sign_model=ort.InferenceSession(str(root/'public/models/bisindo/sign_mlp.onnx'),providers=['CPUExecutionProvider'])
signs=[]
for digit in range(10):
    row=next(r for r in rows if int(r['label'])==digit)
    points=np.array([float(row[f'h{h}_lm{j}_{axis}']) for h in range(2) for j in range(21) for axis in 'xyz'],dtype=np.float32).reshape(1,2,21,3)
    present=np.any(np.abs(points)>1e-8,axis=(2,3))
    anchor=points[np.arange(1),np.where(present[:,0],0,1),0].copy()
    scale=np.maximum((np.linalg.norm(points[:,:,9]-points[:,:,0],axis=-1)*present).sum(axis=1)/np.maximum(present.sum(axis=1),1),1e-5)
    normalized=(points-anchor[:,None,None,:])/scale[:,None,None,None]
    normalized*=present[:,:,None,None]
    vector=np.concatenate([normalized.reshape(1,126),present.astype(np.float32)],axis=1).astype(np.float32)
    logits=sign_model.run(None,{'landmarks':vector})[0][0]
    hands=[[{'x':float(p[0]),'y':float(p[1]),'z':float(p[2])} for p in points[0,h]] for h in range(2) if present[0,h]]
    signs.append({'hands':hands,'normalized':vector[0].tolist(),'logits':logits.tolist()})

def idx(path):
    with gzip.open(path,'rb') as f:
        _,_,n=struct.unpack('>HBB',f.read(4));shape=struct.unpack('>'+'I'*n,f.read(4*n))
        return np.frombuffer(f.read(),dtype=np.uint8).reshape(shape)
images=idx(args.data/'mnist/t10k-images-idx3-ubyte.gz');labels=idx(args.data/'mnist/t10k-labels-idx1-ubyte.gz')
ocr_model=ort.InferenceSession(str(root/'public/models/tulisan_tangan/number_crnn.onnx'),providers=['CPUExecutionProvider'])
ocr=[]
for target in ['35','100','11','7']:
    canvas=Image.new('L',(len(target)*30+20,44),0)
    for i,char in enumerate(target):canvas.paste(Image.fromarray(images[np.flatnonzero(labels==int(char))[0]]),(10+i*30,8))
    crop=canvas.crop(canvas.getbbox());ratio=min(88/crop.width,24/crop.height)
    resized=crop.resize((max(1,round(crop.width*ratio)),max(1,round(crop.height*ratio))),Image.Resampling.BILINEAR)
    processed=Image.new('L',(96,32),0);processed.paste(resized,((96-resized.width)//2,(32-resized.height)//2))
    tensor=np.asarray(processed,dtype=np.float32)[None,None]/255
    logits=ocr_model.run(None,{'image':tensor})[0]
    text='';prev=10
    for value in logits.argmax(-1)[0]:
        if value!=10 and value!=prev:text+=str(value)
        prev=value
    rgb=np.repeat((255-np.asarray(canvas))[:,:,None],4,axis=2);rgb[:,:,3]=255
    ocr.append({'target':target,'text':text,'width':canvas.width,'height':canvas.height,
                'rgba':rgb.flatten().tolist(),'preprocessed':tensor.flatten().tolist()})
(out/'model-cases.json').write_text(json.dumps({'scope':'Software preprocessing and export parity only, not a recognition benchmark',
     'sign_source':'Adjie, BISINDO Landmarks v3, CC BY 4.0','ocr_source':'MNIST official test examples','signs':signs,'ocr':ocr},separators=(',',':'))+'\n')
print('Fixtures ready:',[(r['target'],r['text']) for r in ocr])
