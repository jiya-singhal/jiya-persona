---
title: Why a voice game never heard Android singers: a frame-cadence mismatch, not a mic failure
company: SingOneSong
period: Aug 2026
tags: android, flutter, native bridge, pitch detection, debugging, regression tests
---
## The symptom
Android players of Singing Snakes were never credited for singing during calibration, even when they sang clearly. It looked like a microphone failure.

## The actual cause
The calibration collector accepted one pitch sample per requestAnimationFrame tick. That was tuned for the web, where pitch frames arrive roughly every 50 milliseconds. On Android the native bridge delivers 10 model frames in one 160 millisecond burst, so the per-tick sampler thinned the stream to about 6 samples per second. The lock condition required 12 samples within one second. Crediting the singer was mathematically unreachable, not flaky.

## The fix, and the two bugs behind it
She changed the collector to count every frame, with a regression test that fails on the pre-fix code (phaser-games PR #423). She then made the pitch.start contract honest: an awaitMicReady flag, because the bridge had been resolving with ok true before capture was actually up. Finally she root-caused the follow-on "Tap to retry mic" freeze to a stop-during-start race in the Dart bridge: three interacting bugs, each reproduced by a test (sos-mobile PRs #1587 and #1610).

## Judgment call
Before a stable release she deliberately reverted cross-game changes from the PR and re-scoped it to the one affected game, to keep the blast radius small. When a teammate flagged release risk, she split the mic fix into its own PR rather than arguing.

## Related mic-loss mechanisms she diagnosed separately
Three earlier mic failures had the same symptom and different causes: a JavaScript channel-name collision poisoning host detection (found by disassembling the minified bundle); an iOS AVAudioSession left stale by HTML audio when moving between games, where the WebView path lacked the native path's self-repair; and on Android a leaked permanent audio focus. On the Android one she explicitly recommended re-scoping a PR's claims to iOS rather than letting it claim a fix it did not deliver.
