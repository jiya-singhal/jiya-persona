---
title: Fixing an accumulating renderer-vs-engine drift in Steady Shred, measured 53px to 16px
company: SingOneSong
period: Jul - Aug 2026
tags: phaser, webgl, performance, debugging, measurement, regression tests
---
## The symptom
During the Steady Shred juice pass (two pull requests of roughly 9,500 lines each, phaser-games PRs #320 and #329), players reported that hop-offs got later the longer they played.

## The cause
The renderer's visual cursor free-ran and latched its lead over the engine's authoritative cursor. That produced an integrated drift that compounded rail over rail. Nothing was individually slow; the two clocks simply were not being reconciled.

## The fix and the measurement
Five times more frequent cursor broadcasts from the engine plus a proportional convergence correction on the renderer side. Measured on an 8-rail harness, the worst-case visual gap dropped from about 53 pixels to about 16 pixels and stayed flat instead of growing. Two regression tests and a debugPerf URL readout pin the result. She then opened a fresh session specifically for an independent code review to defeat the confirmation bias of the session that wrote the code; it came back approve.

## Performance ground truth instead of folklore
For the same passes she patched gl.drawArrays to find the real baseline: 4 GL draws per frame. She empirically disproved the belief that texture switches break the sprite batch (blend-mode changes are what flush). On a Singing Snakes pass she set CI performance pins from measured run-to-run variance so they cannot flake: drawCalls max 775 against a limit of 850, and draw p95 1.5 milliseconds against a limit of 6. Her rule: pin at measured max plus 15 percent, or make it a warning, because a tight pin will flake in CI. She also flagged a passing benchmark as uninformative when the throttle had not actually applied: a measurement that cannot fail cannot detect a regression.

## Other perf and render work
A picture-in-picture recorder bug class: a black game layer in one game came from WebGL preserveDrawingBuffer (the webcam-fine, game-black asymmetry was the fingerprint; phaser-games PR #256), and a 17 second freeze in another came from a hand-rolled recorder diverging from the shared package three ways (no timeslice, a 120 Hz composite on ProMotion screens giving 4x load, misused requestFrame); verified fixed with a 21.59 second clip versus the old 0.03 second one (phaser-games PR #255). An arcade bundle-size pass in September 2026 trimmed sprites and archived web-only posters and an unused bundle out of the shipped mobile assets (phaser-games PR #513, sos-mobile PRs #1909 and #1911).
