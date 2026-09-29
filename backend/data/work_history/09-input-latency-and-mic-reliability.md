---
title: Input latency in the voice games and mic reliability across the Flutter/WebView boundary
company: SingOneSong
period: 2026
tags: latency, pitch inference, ios, android, avaudiosession, audio focus, swift, flutter, debugging
---
## The input-lag complaint
A long-standing complaint was that singing did not register instantly in the voice-driven games. She traced it to pitch inference running serially over an oversized analysis window: latency was the window length plus time waiting in line. The tradeoff is that a longer window is more accurate, especially on low notes, but slower, so the job was to find the smallest window that kept accuracy and to stop serialising.

## How it was rolled out
URL-toggled A/B variants with a p50/p95 latency probe, scoped so only one game changed and the nine other games on the shared runtime stayed untouched. There is no single headline latency-delta number she claims for this; the current resume keeps it as the mechanism and the rollout, not a percentage.

## The intermittent mic death
The app is Flutter; the games run in a WebView inside it. The microphone intermittently died when moving between games or after interruptions. She listed four candidate causes and, for each, asked what she would see only if that cause were true, then checked source and logs to eliminate them. Two survived. On iOS, the AVAudioSession category (the phone's "what is audio doing" setting) stayed configured after the WebView was torn down. On Android, audio focus (the "who controls audio" token) was grabbed and never abandoned on dispose. Same disease both times: acquired and never released. Both were fixed with session-repair changes and tests that fail on the old code.

## Hardening the capture path
Bounded auto-restart with backoff, a health stream, and iOS interruption recovery written in Swift (sos-mobile PR #808, about +614 lines); an onset latency trim (sos-mobile PR #919); native audio recorder hardening (sos-mobile PR #1587). In September 2026 an attempt to keep Android noise suppression and iOS voice processing off for pitch games was closed unmerged (sos-mobile PR #1917), which pointed the remaining Mac pitch-jitter thread back at a render-side filter rather than the capture path.
