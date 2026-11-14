"""Download one public CDSR evaluation utterance for local tests; never commit audio.

Source: s-sakti/data_indsp_digit_cdsr, CC BY-NC-SA 4.0. See notebooks/DATASETS.md.
"""
import array,io,sys,urllib.request,wave,zipfile
from pathlib import Path
url='https://raw.githubusercontent.com/s-sakti/data_indsp_digit_cdsr/b2eefc10fc649149cdb634c74e23af26d6a210c8/speech/test1/FAL.zip'
with urllib.request.urlopen(url,timeout=60) as response:
    archive=zipfile.ZipFile(io.BytesIO(response.read()))
name=next(name for name in archive.namelist() if name.endswith('FAL_4B.wav'))
with wave.open(io.BytesIO(archive.read(name))) as audio:
    assert audio.getframerate()==16000 and audio.getnchannels()==1 and audio.getsampwidth()==2
    samples=array.array('h',audio.readframes(audio.getnframes()))
if sys.byteorder!='little':samples.byteswap()
result=array.array('f',(value/32768 for value in samples))
if sys.byteorder!='little':result.byteswap()
path=Path(__file__).resolve().parents[1]/'artifacts/test-speech.f32';path.parent.mkdir(exist_ok=True);path.write_bytes(result.tobytes())
print('Local evaluation fixture prepared:',path)
