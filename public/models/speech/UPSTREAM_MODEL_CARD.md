---
license: apache-2.0
base_model: openai/whisper-small
tags:
- generated_from_trainer
datasets:
- mozilla-foundation/common_voice_17_0
metrics:
- wer
model-index:
- name: whisper-small-id
  results:
  - task:
      name: Automatic Speech Recognition
      type: automatic-speech-recognition
    dataset:
      name: mozilla-foundation/common_voice_17_0 id
      type: mozilla-foundation/common_voice_17_0
      config: id
      split: None
      args: id
    metrics:
    - name: Wer
      type: wer
      value: 0.05902826117221217
---

<!-- This model card has been generated automatically according to the information the Trainer had access to. You
should probably proofread and complete it, then remove this comment. -->

# whisper-small-id

This model is a fine-tuned version of [openai/whisper-small](https://huggingface.co/openai/whisper-small) on the mozilla-foundation/common_voice_17_0 id dataset.
It achieves the following results on the evaluation set:
- Loss: 0.0878
- Wer: 0.0590 (5.9%)

## Model description

More information needed

## Intended uses & limitations

More information needed

## Training and evaluation data

More information needed

## Training procedure

### Training hyperparameters

The following hyperparameters were used during training:
- learning_rate: 1e-05
- train_batch_size: 16
- eval_batch_size: 16
- seed: 42
- gradient_accumulation_steps: 2
- total_train_batch_size: 32
- optimizer: Adam with betas=(0.9,0.999) and epsilon=1e-08
- lr_scheduler_type: linear
- lr_scheduler_warmup_steps: 500
- training_steps: 20000
- mixed_precision_training: Native AMP

### Training results

| Training Loss | Epoch   | Step  | Validation Loss | Wer    |
|:-------------:|:-------:|:-----:|:---------------:|:------:|
| 0.1875        | 0.8457  | 1000  | 0.1400          | 0.1099 |
| 0.0852        | 1.6913  | 2000  | 0.1043          | 0.0857 |
| 0.0387        | 2.5370  | 3000  | 0.0914          | 0.0757 |
| 0.0153        | 3.3827  | 4000  | 0.0860          | 0.0818 |
| 0.008         | 4.2283  | 5000  | 0.0878          | 0.0698 |
| 0.005         | 5.0740  | 6000  | 0.0878          | 0.0745 |
| 0.0033        | 5.9197  | 7000  | 0.0834          | 0.0651 |
| 0.0029        | 6.7653  | 8000  | 0.0815          | 0.0627 |
| 0.0014        | 7.6110  | 9000  | 0.0853          | 0.0627 |
| 0.0013        | 8.4567  | 10000 | 0.0861          | 0.0641 |
| 0.0005        | 9.3023  | 11000 | 0.0857          | 0.0633 |
| 0.0005        | 10.1480 | 12000 | 0.0856          | 0.0620 |
| 0.0007        | 10.9937 | 13000 | 0.0866          | 0.0605 |
| 0.0005        | 11.8393 | 14000 | 0.0871          | 0.0614 |
| 0.0002        | 12.6850 | 15000 | 0.0850          | 0.0596 |
| 0.0004        | 13.5307 | 16000 | 0.0849          | 0.0600 |
| 0.0001        | 14.3763 | 17000 | 0.0868          | 0.0592 |
| 0.0002        | 15.2220 | 18000 | 0.0873          | 0.0593 |
| 0.0001        | 16.0677 | 19000 | 0.0875          | 0.0585 |
| 0.0001        | 16.9133 | 20000 | 0.0878          | 0.0590 |


### Framework versions

- Transformers 4.42.0.dev0
- Pytorch 2.3.0+cu121
- Datasets 2.19.1
- Tokenizers 0.19.1
