---
title: Rebuilding Ride the Pitch's onboarding in an 11.5k-line PR while keeping the grading engine byte-identical
company: SingOneSong
period: Jul - Aug 2026
tags: typescript, phaser, onboarding, tutorial design, testing, collaboration
---
## The situation
Ride the Pitch is a voice game where the player sings target notes as they scroll past. Its tutorial trapped struggling singers: a player who could not master a note was looped forever. In Jiya's words, the loop was longest for exactly the players least able to shorten it. A teammate had a work-in-progress branch for the rebuild.

## What she shipped
She took over the teammate's branch mid-flight and stacked one-concern-per-commit on top of his work without rewriting his commits. The rebuild (phaser-games PR #360, about +11,512 and -2,927 lines) added a tutorial rehearsal with a retry ceiling aligned to the point where assistance plateaus (attempt 3), honest bail copy, a game-native HUD, practice-tier grading parity with real gameplay, and a static-hold rehearsal.

## The constraint that ran through all of it
Every task carried the rule that the grading engine and its config must stay byte-identical, verified with an empty diff at the end and later hardened to MD5 checks. Ride the Pitch's node test suite grew from 270 to 423 tests across the arc.

## Bugs found along the way
A target-lifecycle leak: graded targets could park on screen forever if their resolve tween was killed. She fixed the class of bug with a reap deadline rather than patching the one trigger. A practice-bar parking bug: she killed her own drift hypothesis by measuring the clocks (they agreed within 2 to 13 milliseconds), found that the practice bar parked with its centre on the scoring line instead of its trailing edge, and matched the computed 1,120 millisecond deficit to the 1.05 seconds a teammate had independently measured.

## Follow-on work on the same game
A safe juice batch (phaser-games PR #381): looping splash and results music, verdict stingers, a combo arpeggio and a celebration, every sound routed through a microphone-separate AudioContext with written reasoning per sound about why it cannot bleed into a scoring window. The GOOD verdict is deliberately silent because it is the common case and its tail would land in the next scoring window. Authored levels (phaser-games PR #402, about +2,068 lines): per-target styles and demos, a pure browser-free level catalog, a minimum-span floor that widens a narrow vocal range upward instead of flattening intervals, and a fix for Number(null) === 0 treating every unlocked range as locked. Also a 220 millisecond interval onset grace for late-but-in-tune second notes, with 423 engine tests passing. Later, a voiced tutorial audio arc across six PRs made voiced lines survive the iOS microphone by routing clips through native audio (phaser-games PRs #452, #453, #455, #465, #492 and sos-mobile PRs #1727, #1739, #1796).
