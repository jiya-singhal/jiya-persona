---
title: Real song transposition on Flutter web with a custom pitch-shift AudioWorklet, plus a CORS threat model
company: SingOneSong
period: 2026
tags: web audio, audioworklet, dsp, flutter web, cors, security, testing
---
## The problem
On the web build of the app, changing a song's key updated the labels but the audio never shifted, because the web media library had no pitch-shift capability. The app claimed to transpose and did not.

## What she built
A granular SOLA (synchronous overlap-add) AudioWorkletProcessor that shifts pitch without warping tempo. A coherence gate makes sure the scoring targets match what the listener actually hears. A degrade path with one rule: original key, never silence. Shipped in sos-mobile PR #1085 (about +679 and -51 lines across 18 files), with the full suite green at plus 2,817 tests.

## The CORS hole and how it was closed
Fetching audio for the worklet exposed a CORS gap. She proved it with a real-SDK probe on a non-allowlisted origin: the preflight response lied and the actual download response did not. The fix used an origins wildcard for GET only, and she justified it in writing: CORS is not access control; the bytes stay gated by signed URLs and tokens, which she verified return 403 without them. She restored two dropped CORS origins and synchronised the apply-cors script with the Pulumi infrastructure definition in a separate infra PR (#6).

## Related web-target work
A web onboarding password-field autoplay freeze fixed over three iterations with negative-control tests proving the guard actually guards (10 ticks produced 10 re-seeks without it). Setlist score return on web. A Ride the Pitch arcade crash on web (sos-mobile PR #1067, about +1,291 lines). She also ran a 52-agent read-only audit of the web target that verified 26 findings, refuted 11 false alarms, and found a real dead-code auth bug: the router strips query parameters from the matched location, so an intent=upgrade check could never fire, and the tests only passed because they fed a literal the router never produces.
