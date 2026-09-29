---
title: Porting the Steady Shred pitch engine from Dart to TypeScript with provable parity
company: SingOneSong
period: May 2026
tags: typescript, dart, flutter, game engine, parity testing, phaser
---
## What the problem was
Steady Shred is a skateboard-themed pitch game: the player holds a sung note steady to ride rails. Its grading engine lived inside the Flutter app in Dart. The web version of the game needed the engine standalone in the shared TypeScript game runtime, and the mobile app needed to be able to switch to the web engine without a risky big-bang cutover.

## What Jiya did
She scoped the port first and identified that about 70 percent of the runtime infrastructure could be reused. She shipped the pluggability seam (a createEngine factory) as its own pull request so the shared code changed in isolation and other games such as Ride the Pitch and Sing the Drop were untouched (phaser-games PRs #21 and #22). Then she ported the engine and renderer from Dart to TypeScript (phaser-games PR #32, roughly +5,289 and -906 lines).

## How she proved the port was correct: 23 of 23 replay parity tests against the Dart engine
Instead of writing unit tests from scratch, she built a pitch-frame replay parity harness that feeds recorded pitch frames through both the live Dart engine and the new TypeScript engine and compares the results. The port passed 23 of 23 frame-replay parity tests. Her reasoning, in her own words: unit tests written from scratch would only validate my interpretation, not actual parity.

## How the cutover stayed reversible
The mobile app switches engines through a single URL parameter (gameplayHost=js), so rolling back to the Dart engine is a one-line change. The earlier Flutter-side rebuild of the game (sos-mobile PR #491, about +10,820 lines across 80 files) and the first-run guided tutorial (sos-mobile PR #450) were separate, earlier pieces of the same game.

## Why this matters
It is the clearest example of how she works: land the seam separately, prove parity against the real thing rather than against her own understanding, and make the risky switch trivially reversible. The governing invariant for all later Steady Shred work came from here too: the engine grades purely by world-cursor X, and anything visual must be provably render-only.
