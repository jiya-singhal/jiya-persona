---
title: The 21,750-case pitch-model benchmark that validated swift-f0 replacing PESTO
company: SingOneSong
period: 2025 - 2026
tags: benchmark, pitch detection, swift-f0, pesto, playwright, evaluation, regression gate
---
## The question it answered
Could a 389 KB pitch model (swift-f0) replace the 16 MB model (PESTO) the games were using, without making pitch detection worse? That is roughly 40 times smaller, about a 97.6 percent size cut.

## How the benchmark is built
Test audio is singer clips mixed with noise at several levels, where the true pitch is known, so a pass means the model recovered the pitch within tolerance. The set is 29 singers times 150 MUSAN noise files times 5 noise-mix levels, which is 21,750 cases. It runs under Playwright because the model runs in the browser, so the benchmark exercises the real browser path rather than a Python copy.

## Honest corrections to older wording
An earlier resume said 30 singers, 5 SNR levels and a 97.5 percent size cut. The accurate figures are 29 singers, 5 noise-mix levels, and about 97.6 percent (40 times smaller).

## The result
swift-f0 passed 98.8 percent of cases against 96.8 percent for PESTO on the previous run of the same benchmark. Smaller and more accurate. A separate, earlier comparison of PESTO against Aubio gave 90 percent and 31 percent, which is why Aubio was ruled out.

## Why it is kept
The benchmark is kept runnable as a standing regression gate so nobody can silently make pitch detection worse later. Related backend PRs in the company's sos repository: a testing framework (#122, #128), a 30-singers analysis (#155), noise-detection algorithm iterations (#195, #196), and the SwiftF0 detector evaluation and test suite (#344, #447).
