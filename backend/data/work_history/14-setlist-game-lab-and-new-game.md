---
title: Practice cards, setlist, Game Lab, and Paint the Pitch (a new game prototype)
company: SingOneSong
period: Aug - Sep 2026
tags: flutter, typescript, cross-repo, product, game design, orca worktrees
---
## The goal for the week of 18 August 2026
Make each game coherent when played from a practice card in a setlist. Her deliverables spanned the Flutter app and the game monorepo, with the two halves kept in lockstep: one session produced 29 commits across both repos in two days.

## Game Lab and setlist overlays
Game Lab "Launch" (sos-mobile PR #1524, about +1,399 lines): the first five days as tappable practice cards, a goal screen, the real game via preview deploys with a secure-context mic proxy, and host-rendered star results chaining like a setlist; Flutter, 52 tests passing. Setlist level overlays (sos-mobile PR #1515, about +793 lines): plans carry level-parameter overlays picked by setlist ordinal. Review surfaced that the add-gate validated level 1 rather than the level that would actually launch; fixed, plus a test that validates every authored level of every bundled plan (90 of 90).

## Shared contracts and launchers
A shared game-result contract posted by Ride the Pitch and Singing Snakes at run end; a practice-setlist launcher, one shareable page playing every authored level (phaser-games PR #411, about +1,827 lines); deep links by level (PR #414); endurance ladders via boot payload (PR #408). Steady Shred joined the setlist as a first-class card in September: game-result stars and a boot-payload win config on the web side (phaser-games PR #500) and the card activity with 3, 5 and 7 rail presets on the app side (sos-mobile PR #1861), a cross-repo feature pair shipped in two days.

## Playtest-fix burst
On 8 September 2026 she merged six PRs in one day across five games (a wallpaper flash and splash-music toggle, course-text placement, a host-owned result popup, a tunnel-gap render fix, a start card), each in its own parallel worktree lane at 3 to 17 prompts per PR (phaser-games PRs #485 to #489 and #466).

## Paint the Pitch
A new arcade game prototype and her first new-game authorship: sing to spray-paint a mural, with solfege region targets and a voice-painted mandala finale (phaser-games PR #467, about +7,107 lines, open as of mid-September 2026).

## Workflow shift
Around 2 September 2026 she adopted parallel git worktrees managed by Orca: one issue, one worktree, one branch, one PR, several lanes at once. That produced 25 PR-creation events in 15 days against 28 in the entire prior month.
