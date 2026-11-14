# %% [markdown]
# # 1. Pemahaman Bisnis
#
# **Tujuan:** siswa menulis satu bilangan utuh, misalnya 7, 35, atau 100, pada
# kanvas. Model menghasilkan string digit tanpa mewajibkan kotak per karakter.
# Kandidat dibacakan/ditampilkan dan dikonfirmasi sebelum dinilai.
#
# **Ruang lingkup PoC:** satu baris horizontal, 1–3 digit, bilangan jawaban 0–100.
# Model dapat membaca string lain, tetapi aturan produk menolak nilai di luar
# rentang. Nol di depan dipertahankan selama OCR dan dinormalisasi hanya setelah
# konfirmasi. Ekspresi matematika, pecahan, dan tulisan bebas bukan target.
#
# | Keputusan | Alasan |
# |---|---|
# | CNN + BiGRU + CTC | Mengenali urutan digit tanpa segmentasi karakter manual |
# | Data sintetis dari digit publik | Tidak membutuhkan pengumpulan data baru |
# | Exact match dan character error rate | Menilai bilangan utuh, bukan hanya digit terpisah |
# | Evaluasi sintetis terpisah | Tidak menyatakan akurasi pada tulisan anak atau kanvas nyata |
# | Sasaran awal | Exact match ≥95% pada evaluasi sintetis, kemudian uji kanvas |
#
# %%
# @title Parameter eksperimen
import gzip, struct
from PIL import Image, ImageOps, ImageFilter
from sklearn.model_selection import train_test_split
from torch import nn
from torch.utils.data import Dataset, DataLoader
ART=ROOT/'artifacts/tulisan_tangan'; ART.mkdir(parents=True,exist_ok=True)
CONFIG={'seed':SEED,'height':32,'width':96,'max_digits':3,'blank_id':10,
        'train_sequences':100000 if PROFILE=='full' else 20000,
        'val_sequences':3000 if PROFILE=='full' else 1000,
        'test_sequences':5000 if PROFILE=='full' else 1000,
        'epochs':30 if PROFILE=='full' else 20,'batch_size':128,'lr':0.001}
display(pd.Series(CONFIG))

# %% [markdown]
# # 2. Pemahaman Data
#
# [MNIST](https://www.tensorflow.org/datasets/catalog/mnist) menyediakan digit
# terisolasi; [EMNIST Digits dari NIST](https://www.nist.gov/itl/products-and-services/emnist-dataset)
# menambah variasi penulis. Keduanya bukan dataset bilangan multi-digit pada kanvas.
# Kita membangun urutan sintetis dari citra digit tersebut.
#
# MNIST dan EMNIST memiliki hubungan sumber, jadi gabungan split resmi tidak boleh
# langsung dianggap bebas kebocoran. Notebook mengaudit duplikasi piksel lintas
# partisi setelah orientasi EMNIST diperbaiki. Audit ini belum menjamin pemisahan
# penulis atau menghapus semua contoh yang hampir sama.
#
# %%
# @title Unduh hanya berkas digit dan baca format IDX
if not (DATA/'raw/mnist/train-images-idx3-ubyte.gz').exists(): print(mnist())
if not (DATA/'raw/emnist/emnist-digits-train-images-idx3-ubyte.gz').exists(): print(emnist())

def read_idx(path):
    with gzip.open(path,'rb') as handle:
        zero,dtype,ndim=struct.unpack('>HBB',handle.read(4))
        assert zero==0 and dtype==8
        shape=struct.unpack('>'+'I'*ndim,handle.read(4*ndim))
        values=np.frombuffer(handle.read(),dtype=np.uint8).reshape(shape).copy()
    return values

def load_digits(kind, split):
    if kind=='mnist':
        prefix='train' if split=='train' else 't10k'
        folder=DATA/'raw/mnist'
        images=read_idx(folder/f'{prefix}-images-idx3-ubyte.gz')
        labels=read_idx(folder/f'{prefix}-labels-idx1-ubyte.gz')
    else:
        folder=DATA/'raw/emnist'
        images=read_idx(folder/f'emnist-digits-{split}-images-idx3-ubyte.gz').transpose(0,2,1).copy()
        labels=read_idx(folder/f'emnist-digits-{split}-labels-idx1-ubyte.gz')
    return images,labels

mi,my=load_digits('mnist','train'); ei,ey=load_digits('emnist','train')
mt,mty=load_digits('mnist','test'); et,ety=load_digits('emnist','test')
display(pd.DataFrame({'sumber':['MNIST train','MNIST test','EMNIST train','EMNIST test'],
                      'jumlah':[len(mi),len(mt),len(ei),len(et)]}))
fig,axes=plt.subplots(2,10,figsize=(14,4))
for digit in range(10):
    for row,(images,labels,name) in enumerate([(mi,my,'MNIST'),(ei,ey,'EMNIST')]):
        axes[row,digit].imshow(images[np.flatnonzero(labels==digit)[0]],cmap='gray')
        axes[row,digit].set_title(f'{name}: {digit}');axes[row,digit].axis('off')
plt.tight_layout();plt.show()

# %% [markdown]
# # 3. Persiapan Data
#
# Urutan: perbaiki orientasi → pisahkan sumber digit → hapus duplikasi lintas
# partisi → buat urutan sintetis **di dalam masing-masing partisi**. Satu citra
# sumber tidak boleh dipakai pada training dan evaluasi, walaupun bilangan hasil
# sintesis berbeda. Contoh kalibrasi dan evaluasi dibangkitkan dengan seed tetap.
#
# Sintesis memakai crop tinta, skala/aspect ratio bervariasi, rotasi ringan,
# variasi ketebalan, jarak, dan sedikit tumpang tindih. Ini memperluas variasi
# sintetis tetapi tidak menggantikan data touchscreen nyata.
#
# %%
# @title Audit duplikasi piksel dan bangun pool yang terpisah
def image_hashes(images):
    return np.array([hashlib.blake2b(img.tobytes(),digest_size=16).hexdigest() for img in images])
train_images=np.concatenate([mi,ei]); train_labels=np.concatenate([my,ey])
test_images=np.concatenate([mt,et]); test_labels=np.concatenate([mty,ety])
test_hash=image_hashes(test_images)
_,unique_test=np.unique(test_hash,return_index=True)
test_images,test_labels,test_hash=test_images[unique_test],test_labels[unique_test],test_hash[unique_test]
train_hash=image_hashes(train_images)
keep=~np.isin(train_hash,test_hash)
removed=int((~keep).sum()); train_images,train_labels,train_hash=train_images[keep],train_labels[keep],train_hash[keep]
_,unique_train=np.unique(train_hash,return_index=True)
train_images,train_labels=train_images[unique_train],train_labels[unique_train]
fit_idx,val_idx=train_test_split(np.arange(len(train_images)),test_size=0.1,stratify=train_labels,random_state=SEED)
pools={'train':(train_images[fit_idx],train_labels[fit_idx]),
       'val':(train_images[val_idx],train_labels[val_idx]),'test':(test_images,test_labels)}
split_info={key:len(value[0]) for key,value in pools.items()}
split_info.update(exact_train_test_duplicates_removed=removed,writer_independent=False)
save_json(ART/'split.json',split_info);display(pd.Series(split_info))
del mi,my,ei,ey,mt,mty,et,ety,train_images,train_labels,train_hash,test_hash

# %%
# @title Bangkitkan bilangan utuh dengan variasi gaya digit publik
def preprocess_canvas(image, height=32, width=96):
    """Input grayscale: tinta putih di atas latar hitam, sama dengan renderer."""
    image=image.convert('L'); box=image.getbbox()
    if box is None: return np.zeros((1,height,width),dtype=np.float32)
    cropped=image.crop(box)
    ratio=min((width-8)/cropped.width,(height-8)/cropped.height)
    resized=cropped.resize((max(1,round(cropped.width*ratio)),max(1,round(cropped.height*ratio))),Image.Resampling.BILINEAR)
    out=Image.new('L',(width,height),0)
    out.paste(resized,((width-resized.width)//2,(height-resized.height)//2))
    return np.asarray(out,dtype=np.float32)[None]/255.0

class SyntheticNumbers(Dataset):
    def __init__(self, images,labels,size,seed,augment=False,targets=None):
        self.images,self.labels,self.size,self.seed,self.augment=images,labels,size,seed,augment
        self.by_digit={d:np.flatnonzero(labels==d) for d in range(10)}
        self.epoch=0;self.targets=targets
    def __len__(self): return self.size
    def __getitem__(self,index):
        rng=np.random.default_rng(self.seed+index+self.epoch*1000003)
        if self.targets is not None: text=self.targets[index%len(self.targets)]
        elif rng.random()<0.8: text=str(rng.integers(0,101))
        else: text=''.join(str(v) for v in rng.integers(0,10,size=rng.integers(1,4)))
        glyphs=[]
        for char in text:
            img=Image.fromarray(self.images[rng.choice(self.by_digit[int(char)])])
            box=img.getbbox();img=img.crop(box) if box else img
            new_height=int(rng.integers(20,29));new_width=max(4,int(img.width*new_height/img.height*rng.uniform(0.8,1.15)))
            img=img.resize((new_width,new_height),Image.Resampling.BILINEAR)
            if self.augment:
                img=img.rotate(float(rng.uniform(-9,9)),resample=Image.Resampling.BILINEAR,expand=True)
                if rng.random()<0.15:img=img.filter(ImageFilter.MaxFilter(3))
            glyphs.append(img)
        gaps=rng.integers(-1 if self.augment else 0,7,size=max(0,len(glyphs)-1))
        canvas=Image.new('L',(sum(i.width for i in glyphs)+int(gaps.sum())+12,40),0)
        x=6
        for i,glyph in enumerate(glyphs):
            layer=Image.new('L',canvas.size,0);layer.paste(glyph,(x,int(rng.integers(3,9))))
            canvas=Image.fromarray(np.maximum(np.asarray(canvas),np.asarray(layer)))
            x+=glyph.width+(int(gaps[i]) if i<len(gaps) else 0)
        return torch.from_numpy(preprocess_canvas(canvas)),torch.tensor([int(c) for c in text],dtype=torch.long),text

def collate_numbers(batch):
    images,targets,texts=zip(*batch)
    return torch.stack(images),torch.cat(targets),torch.tensor([len(t) for t in targets]),list(texts)

train_ds=SyntheticNumbers(*pools['train'],CONFIG['train_sequences'],SEED,True)
val_ds=SyntheticNumbers(*pools['val'],CONFIG['val_sequences'],SEED+10000000)
test_ds=SyntheticNumbers(*pools['test'],CONFIG['test_sequences'],SEED+20000000)
train_loader=DataLoader(train_ds,batch_size=CONFIG['batch_size'],shuffle=True,collate_fn=collate_numbers,num_workers=0)
val_loader=DataLoader(val_ds,batch_size=CONFIG['batch_size'],collate_fn=collate_numbers)
test_loader=DataLoader(test_ds,batch_size=CONFIG['batch_size'],collate_fn=collate_numbers)
fig,axes=plt.subplots(3,5,figsize=(13,6))
for i,ax in enumerate(axes.flat):
    image,_,text=train_ds[i];ax.imshow(image[0],cmap='gray');ax.set_title(f'Target: {text}');ax.axis('off')
plt.suptitle('Contoh bilangan sintetis');plt.tight_layout();plt.show()

# %% [markdown]
# # 4. Pemodelan
#
# CNN mereduksi citra 32×96 menjadi fitur berurutan sepanjang 24 posisi.
# BiGRU membaca konteks kiri dan kanan; layer linear menghasilkan 11 kelas
# (0–9 dan blank). CTC menyelaraskan urutan citra dengan target yang panjangnya
# bervariasi. Saat decoding, digit berulang hanya digabung jika tidak dipisahkan
# blank, sehingga `11` dan `100` tetap bisa dikenali.
#
# Checkpoint dipilih berdasarkan exact-match validasi. Tidak ada vocabulary
# jawaban benar yang dipakai untuk mengoreksi hasil OCR.
# Pilot enam epoch masih underfit (exact-match validasi 23,7%); profil PoC
# diperpanjang menjadi 20 epoch berdasarkan kurva validasi tersebut. Evaluasi
# sintetis merupakan evaluasi pengembangan internal, bukan benchmark tersegel.
#
# %%
# @title Arsitektur CRNN dan decoder CTC greedy
class NumberCRNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.cnn=nn.Sequential(nn.Conv2d(1,32,3,padding=1),nn.ReLU(),nn.MaxPool2d(2),
                               nn.Conv2d(32,64,3,padding=1),nn.ReLU(),nn.MaxPool2d(2),
                               nn.Conv2d(64,96,3,padding=1),nn.ReLU())
        self.rnn=nn.GRU(96,96,batch_first=True,bidirectional=True)
        self.head=nn.Linear(192,11)
    def forward(self,x):
        features=self.cnn(x).mean(dim=2).transpose(1,2)
        sequence,_=self.rnn(features)
        return self.head(sequence)

def decode_ctc(logits):
    ids=logits.argmax(-1).detach().cpu().numpy()
    texts=[]
    for row in ids:
        prev=10;chars=[]
        for value in row:
            if value!=10 and value!=prev:chars.append(str(value))
            prev=value
        texts.append(''.join(chars))
    return texts

def edit_distance(a,b):
    row=list(range(len(b)+1))
    for i,ca in enumerate(a,1):
        nxt=[i]
        for j,cb in enumerate(b,1):nxt.append(min(nxt[-1]+1,row[j]+1,row[j-1]+(ca!=cb)))
        row=nxt
    return row[-1]

def evaluate_numbers(network,loader):
    network.eval();records=[]
    with torch.no_grad():
        for images,_,_,targets in loader:
            logits=network(images.to(DEVICE));predictions=decode_ctc(logits)
            for target,prediction in zip(targets,predictions):
                records.append({'target':target,'prediction':prediction,'correct':target==prediction,
                                'edits':edit_distance(target,prediction),'length':len(target)})
    frame=pd.DataFrame(records)
    return {'exact_match':float(frame.correct.mean()),'cer':float(frame.edits.sum()/frame.length.sum())},frame

model=NumberCRNN().to(DEVICE)
criterion=nn.CTCLoss(blank=10,zero_infinity=True)
optimizer=torch.optim.AdamW(model.parameters(),lr=CONFIG['lr'],weight_decay=1e-4)
print('Parameter:',sum(p.numel() for p in model.parameters()))

# %%
# @title Training CTC dan simpan checkpoint validasi terbaik
history=[];best=-1;started=time.perf_counter()
for epoch in range(CONFIG['epochs']):
    train_ds.epoch=epoch;model.train();running=0
    for images,targets,lengths,_ in train_loader:
        images,targets=images.to(DEVICE),targets.to(DEVICE)
        optimizer.zero_grad()
        logits=model(images)
        log_probs=logits.log_softmax(-1).transpose(0,1)
        input_lengths=torch.full((len(images),),logits.shape[1],dtype=torch.long)
        loss=criterion(log_probs,targets,input_lengths,lengths)
        loss.backward();nn.utils.clip_grad_norm_(model.parameters(),5.0);optimizer.step()
        running+=loss.item()*len(images)
    val_metrics,_=evaluate_numbers(model,val_loader)
    history.append({'epoch':epoch+1,'train_loss':running/len(train_ds),**val_metrics})
    print(history[-1])
    if val_metrics['exact_match']>best:
        best=val_metrics['exact_match'];torch.save(model.state_dict(),ART/'best_training.pt')
training_seconds=time.perf_counter()-started
model.load_state_dict(torch.load(ART/'best_training.pt',map_location=DEVICE,weights_only=True))
history_df=pd.DataFrame(history);history_df.to_csv(ART/'history.csv',index=False)
fig,axes=plt.subplots(1,2,figsize=(12,4))
history_df.plot(x='epoch',y='train_loss',ax=axes[0],title='Loss training')
history_df.plot(x='epoch',y=['exact_match','cer'],ax=axes[1],title='Evaluasi validasi');plt.show()

# %% [markdown]
# # 5. Evaluasi
#
# **Exact match** mengharuskan seluruh string benar. **CER** menghitung jarak
# edit karakter dibagi jumlah karakter referensi. Laporan per panjang urutan
# memperlihatkan apakah model hanya bagus untuk satu digit.
# Evaluasi tambahan mencakup semua nilai 0–100 dan bilangan dengan digit berulang.
# Semua pengujian berikut tetap sintetis dan tidak membuktikan kinerja kanvas nyata.
#
# %%
# @title Evaluasi akhir, kelompok panjang, dan contoh kesalahan
metrics,predictions=evaluate_numbers(model,test_loader)
metrics.update(test_sequences=len(test_ds),training_seconds=training_seconds,real_canvas_evaluated=False)
display(pd.Series(metrics));display(predictions.groupby('length').agg(jumlah=('correct','size'),exact_match=('correct','mean')))
display(predictions[~predictions.correct].head(20))
predictions.to_csv(ART/'predictions.csv',index=False)
targets=[str(i) for i in range(101)]+['11','22','33','44','55','66','77','88','99','100']*5
special_ds=SyntheticNumbers(*pools['test'],len(targets),SEED+30000000,targets=targets)
special_metrics,special_results=evaluate_numbers(model,DataLoader(special_ds,batch_size=128,collate_fn=collate_numbers))
display(pd.Series(special_metrics,name='cakupan_nilai_dan_digit_berulang'))
special_results.to_csv(ART/'special_cases.csv',index=False)
save_json(ART/'metrics.json',metrics);save_json(ART/'special_metrics.json',special_metrics)

# %% [markdown]
# # 6. Deployment dan Penyimpanan Model
#
# Browser menyediakan citra grayscale dengan **tinta putih pada latar hitam**.
# Jika kanvas memakai tinta hitam di latar putih, balik polaritas sebelum crop.
# Transparansi harus dikompositkan pada latar yang benar. Input kosong ditolak
# sebelum inferensi. Model menerima tensor `[batch,1,32,96]`; keluaran berupa
# logits `[batch,24,11]`, lalu decoder CTC mengubahnya menjadi string.
#
# Penolakan PoC: input kosong, string kosong, lebih dari tiga digit, atau nilai
# di luar 0–100. Belum ada confidence threshold OCR yang dikalibrasi untuk
# scribble dan input asing; konfirmasi pengguna tetap wajib.
#
# %%
# @title Simpan PyTorch, ONNX, decoder, dan konfigurasi preprocessing
import onnx,onnxruntime as ort,inspect
model=model.cpu().eval()
torch.save({'state_dict':model.state_dict(),'config':CONFIG},ART/'number_crnn.pt')
torch.onnx.export(model,torch.zeros(1,1,32,96),str(ART/'number_crnn.onnx'),
                  input_names=['image'],output_names=['logits'],opset_version=17,dynamo=False,
                  dynamic_axes={'image':{0:'batch'},'logits':{0:'batch'}})
onnx.checker.check_model(onnx.load(ART/'number_crnn.onnx'))
save_json(ART/'config.json',CONFIG)
save_json(ART/'preprocessing.json',{'height':32,'width':96,'channels':1,'polarity':'white_ink_black_background',
          'layout':'NCHW','normalization':'float32 / 255; crop ink bbox; aspect-preserving resize; centered padding',
          'blank_id':10,'range':[0,100],'confirmation_required':True})
(ART/'preprocessing.py').write_text('import numpy as np\nfrom PIL import Image\n\n'+inspect.getsource(preprocess_canvas))
decoder_source='''def decode_ctc_ids(ids, blank=10):
    result=[]; previous=blank
    for value in ids:
        value=int(value)
        if value!=blank and value!=previous: result.append(str(value))
        previous=value
    return ''.join(result)
'''
(ART/'decoder.py').write_text(decoder_source)

# %%
# @title Uji kesetaraan ONNX dan muat ulang model final
session=ort.InferenceSession(str(ART/'number_crnn.onnx'),providers=['CPUExecutionProvider'])
sample=torch.stack([test_ds[i][0] for i in range(4)]).numpy()
with torch.no_grad(): reference=model(torch.from_numpy(sample)).numpy()
actual=session.run(None,{'image':sample})[0]
np.testing.assert_allclose(actual,reference,rtol=1e-3,atol=1e-4)
reloaded=NumberCRNN();reloaded.load_state_dict(torch.load(ART/'number_crnn.pt',weights_only=True)['state_dict'])
with torch.no_grad(): np.testing.assert_allclose(reloaded.eval()(torch.from_numpy(sample)).numpy(),reference)
for _ in range(5):session.run(None,{'image':sample[:1]})
timings=[]
for _ in range(50):
    tick=time.perf_counter();session.run(None,{'image':sample[:1]});timings.append((time.perf_counter()-tick)*1000)
save_json(ART/'export_check.json',{'max_abs_error':float(np.abs(actual-reference).max()),
          'cpu_onnx_p50_p95_ms':np.percentile(timings,[50,95]).tolist(),'browser_benchmarked':False})
print('Parity lulus. Prediksi contoh:',decode_ctc(torch.from_numpy(actual)))

# %% [markdown]
# ## Kesimpulan dan batas interpretasi
#
# Model ini belajar membaca bilangan sintetis dari digit publik. Keberhasilan
# sintesis dan ekspor harus dipisahkan dari keberhasilan input touchscreen nyata.
# Setelah PoC, prioritasnya adalah mengukur domain shift pada kanvas, input
# motorik beragam, dan false acceptance terhadap scribble.
#
# **Referensi:** [MNIST](https://www.tensorflow.org/datasets/catalog/mnist),
# [EMNIST](https://www.nist.gov/itl/products-and-services/emnist-dataset),
# [pola CNN/RNN/CTC](https://keras.io/examples/vision/captcha_ocr/),
# [CTCLoss PyTorch](https://docs.pytorch.org/docs/stable/generated/torch.nn.CTCLoss.html).
#
# %%
# @title Paket model dan laporan akhir
import shutil
save_environment(ART);display(index_artifacts(ART))
archive=shutil.make_archive(str(ART.parent/'tulisan_tangan'),'zip',ART)
from IPython.display import FileLink
display(FileLink(archive));print('Artefak:',archive)
