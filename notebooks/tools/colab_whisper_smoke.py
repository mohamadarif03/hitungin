"""Periksa tiga backward pass Whisper kecil sebelum fine-tuning checkpoint besar."""
import subprocess,sys
r=subprocess.run([sys.executable,'-m','pip','install','--quiet','transformers==4.52.0','accelerate==1.12.0'],capture_output=True,text=True)
if r.returncode:
    print(r.stderr[-4000:]);raise RuntimeError('Instalasi Transformers gagal')
import torch,transformers
from transformers import WhisperConfig,WhisperForConditionalGeneration
print('Transformers:',transformers.__version__,'GPU:',torch.cuda.get_device_name(0))

def smoke():
    config=WhisperConfig(vocab_size=32,d_model=64,encoder_layers=1,decoder_layers=1,
        encoder_attention_heads=2,decoder_attention_heads=2,encoder_ffn_dim=128,
        decoder_ffn_dim=128,max_source_positions=128,max_target_positions=32,
        decoder_start_token_id=1,pad_token_id=0,bos_token_id=1,eos_token_id=2)
    model=WhisperForConditionalGeneration(config).cuda().train()
    model.config.use_cache=False
    model.gradient_checkpointing_enable(gradient_checkpointing_kwargs={'use_reentrant':False})
    optimizer=torch.optim.AdamW(model.parameters(),lr=1e-4)
    scaler=torch.amp.GradScaler('cuda')
    for step in range(3):
        optimizer.zero_grad()
        with torch.autocast('cuda',dtype=torch.float16,cache_enabled=False):
            loss=model(input_features=torch.randn(2,80,256,device='cuda'),
                       labels=torch.tensor([[3,4,5,2],[6,7,8,2]],device='cuda')).loss
        assert torch.isfinite(loss)
        scaler.scale(loss).backward();scaler.step(optimizer);scaler.update()
        print('Backward lulus:',step+1,'loss',loss.item(),flush=True)
smoke()
import gc
gc.collect();torch.cuda.empty_cache()
