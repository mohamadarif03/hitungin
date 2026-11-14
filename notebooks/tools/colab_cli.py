"""Jalankan Colab CLI dengan redaksi token proxy pada pesan error CLI."""
import re
import subprocess
import sys

def redact(text):
    text=re.sub(r'(colab-runtime-proxy-token=)[^&\s\'\"]+',r'\1[REDACTED]',text)
    return re.sub(r'(Authorization:\s*Bearer\s+)\S+',r'\1[REDACTED]',text,flags=re.I)

if __name__=='__main__':
    with subprocess.Popen(['colab',*sys.argv[1:]],stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True) as process:
        for line in process.stdout:
            print(redact(line),end='',flush=True)
        raise SystemExit(process.wait())
