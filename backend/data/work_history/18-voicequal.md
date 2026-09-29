---
title: voicequal, an open-source audio-quality library on PyPI, and its honest benchmark
company: personal project
period: 2026
tags: python, pypi, dsp, snr, hnr, spectral flatness, benchmark, dart port, open source
---
## What it is
voicequal is a Python library, published on PyPI (pip install voicequal), that decides whether a recording is actually usable: it computes SNR, spectral flatness, spectral concentration, background level and noise floor per frame, keeps rolling statistics, and returns a four-tier verdict (excellent, good, fair, poor) with a reason. It has a CLI, a live microphone mode with a hysteresis buffer so the tier does not flicker, and auto-calibration per machine. MIT licensed. Repository jiya-singhal/voicequal.

## The benchmark is published in full
The benchmark is 200 labelled clips mixed from VocalSet and MUSAN. She publishes the whole result rather than a favourable subset, because numbers you cannot reproduce are not numbers.

## Versions and numbers (as of 30 September 2026)
Version 0.1.1, which is the version currently on PyPI, scores 46.0 percent exact-tier accuracy and 82.0 percent within one tier. Its weak spot was spectral SNR overrating loud vocals buried in noise: about 28 dB off the true mixing SNR, giving only 5 percent exact accuracy on the very-loud-low-SNR category. Version 0.2.0 in the GitHub repository (committed 26 September 2026) gates the tier decision on harmonics-to-noise ratio (HNR) instead, which is about 4.4 dB off the true mixing SNR, and scores 55.5 percent exact and 89.5 percent within one tier, with 106 tests, CI, ruff and mypy. The 0.2.0 PyPI release is next; until it ships, the pip package is still 0.1.1. Still modest, still published.

## Dart port with parity tests
She ported the decision layer to Dart inside the company's Flutter app with 26 parity tests matching the pip package to about 9 significant figures (49 Dart tests total). The port surfaced three genuine bugs, and she deliberately preserved one windowing inconsistency because fixing it would break parity with the Python reference.

## Relationship to work
The same decision logic is the audio-quality gate in Sing One Song's onboarding, where on 355 production recordings it cut false-positive quality warnings from 5.5 percent to 0.6 percent.
