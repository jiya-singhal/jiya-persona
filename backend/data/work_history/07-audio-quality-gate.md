---
title: The audio-quality gate: false-positive warnings 5.5% to 0.6% on 355 real recordings
company: SingOneSong
period: 2025 - 2026
tags: audio, dsp, snr, spectral flatness, data quality, voicequal, evaluation
---
## What it does
A gate that decides whether a recording is clean enough to process or whether the user should re-record. It is rules and signal metrics, not a trained model.

## The metrics that shipped
Background level in dB (how loud the room is), SNR (voice power against noise power, in dB), spectral flatness (hiss is flat, voice is peaky) and temporal variance (speech energy moves, hiss does not). An older resume line said spectral entropy, A-weighted dB and VAD; the honest description is the four above. Spectral entropy and spectral flatness measure the same property, how noise-like a spectrum is.

## The result
A false alarm punishes a good singer, so she tuned for precision on warnings. On 355 production recordings the warning rate went from 5.5 percent to 0.6 percent, and false positives went from about 11 to 0.

## Why not machine learning
No labelled data, clear failure modes, and a weighted score is transparent and instant. The same decision logic became her open-source library voicequal, so on her resume the gate now lives under the voicequal project rather than as a separate company bullet, to avoid double counting.
