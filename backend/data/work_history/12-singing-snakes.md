---
title: Singing Snakes To Sleep: port, endurance mode, juice pass, level picker
company: SingOneSong
period: Jun - Aug 2026
tags: canvas2d, typescript, game design, vitest, contract-first, testing
---
## Port and detection correctness
Singing Snakes is a Canvas2D game where held notes lull snakes to sleep. She brought it into the game monorepo with voice-guided onboarding (phaser-games PR #85, about +3,550 lines), then a detection-correctness series: gated calibration, a trance stability gate and held-note gating (PRs #121, #130, #119). About 34 PRs on this game, 32 merged, roughly +19,595 and -1,473 lines.

## Endurance mode, contract first
An endurance or breathing mode (PR #250, about +5,011 lines) was built contract-first at the tech lead's request: the spec was written and caveats flagged for the Flutter owner before implementation, and the note unit (absolute MIDI integers) was resolved from app-wide evidence rather than assumption. This PR brought the app its first vitest setup. She later rejected her own shipped fatigue-carry mechanic because it was an invisible mechanic the player cannot read, and redesigned it as the phrase mechanic: one continuous danger bar spanning the phrase is the endurance (PR #279).

## Juice pass with a preview harness
Render-only layers each behind a URL flag, a preview harness that drives the real draw path rather than a mock (her rule after an earlier pass where art shipped that nobody had looked at), scrub controls for timed payoff beats, and CI perf pins set from measured variance so they cannot flake (PR #376, about +3,575 lines; 71 of 71 vitest).

## Level picker
Three authored levels with distinct mechanics, fail-per-snake tally scoring and back-to-back runs (PR #404, about +1,114 lines). A picker-drop bug where every tap launched the default ladder was found and fixed with a real-button verification; 89 to 93 tests.
