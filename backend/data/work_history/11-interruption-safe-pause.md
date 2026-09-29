---
title: Interruption-safe pause across all 14 games (merged 15 September 2026)
company: SingOneSong
period: Sep 2026
tags: typescript, phaser, flutter, mobile, lifecycle, cross-cutting systems, testing
---
## What it does
Any interruption on the phone, whether a call, the notification shade, Control Center, the lock screen or an app switch, freezes every game exactly where it stands and opens the shared pause menu. Resume is always the player's own tap. It covers gameplay and tutorials across all 14 mobile-synced games.

## Size and status
phaser-games PR #449, about +9,017 and -286 lines, merged on 15 September 2026. It is her largest merged single pull request to date and a genuine cross-cutting systems change: a shared game-chrome layer that every game adopts rather than 14 separate fixes.

## How the team tested it before merge
To unblock team testing without waiting for merge, she hand-rebuilt all 14 game bundles from the PR head into a deliberate do-not-merge test PR in the Flutter app (sos-mobile PR #1865), with a per-game interruption test script and game-chrome trace lines so bug reports name the failing signal directly. That is the temporary-bundle pattern she had documented in the bundle-sync playbook, used on purpose. A related app-side fix stops the host from judging a host-paused game as render-stalled (sos-mobile PR #1859).

## Why it matters
It is the clearest recent example of ownership across the whole stack: the shared TypeScript chrome, the Flutter host behaviour, the bundle sync, and the test process, in one change.
