---
title: Steady Shred game design and mic-safe audio: coaster redesign, charge-up mount, jungle theme, loudness floor, Start-tap freeze
company: SingOneSong
period: May - Sep 2026
tags: game design, web audio, dsp, phaser, mic safety, root cause, playtesting
---
## Scale of ownership
Steady Shred is the through-line of the internship: about 49 PRs, 37 merged, roughly +105,880 and -6,114 lines across the game monorepo and the Flutter app. She ported its engine, redesigned its onboarding twice, ran two art and juice passes, built its sound system under mic-safety constraints, and fixed its hardest runtime bugs. Tech: TypeScript, Phaser 3, Web Audio, Vite, node test and vitest, Playwright.

## Coaster redesign and deleting her own mechanic
A double-hump loop reusing safe sine-hill math over a broken cycloid. After playtesting showed the engine grades pitch, not vowels, she deleted her own vowel mechanic and replaced it with a pitch-shape bonus as a new pure module with 35 tests that grants juice, never speed. 134 core tests; audio budget 124 KB under a 500 KB cap.

## Charge-up mount
Closing the hole where room noise could mount the rider. The design went through instant mount, settle audition, width audition and a fixed beat, and landed on a fixed 130 millisecond crouch beat with a single width decision (spread at most twice the wobble allowance). She caught the key inconsistency herself: a 35 cent mount gate stricter than the 55 cent hold allowance is backwards, because what distinguishes speech from a sung note is width, not tightness. She specified the negative test matrix (a cough fizzles, a wobbly tone that never settles fizzles rather than force-mounting) before any animation existed. Core suite 131 of 131; independently reviewed in a fresh session.

## Mic-safe sound design
The hard rule: no audio may play in mic-live windows, because the speaker bleeds into pitch detection. She verified from source that two requested sounds were unsatisfiable (grace recovery has no silent window; coins only collect on-rail) and reported the contradiction instead of papering over it. Eight synthesised SFX with tier escalation reuse the existing celebration ladder (PRs #221 and #226).

## Jungle theme
A full art and mechanic retheme behind a theme URL flag with the default theme proven byte-unchanged per commit (PR #287, about +12,270 lines): a two-stage grace warning, 174 of 175 tests, and a hold-tier ladder re-derived after she caught that the plan was built on the wrong constant (240 pixels per second travel, not the 280 scoring knob).

## Honest loudness and the fountain lift
A playtest verdict of "I was pretty loud but did not jump" led to the root cause: the loudness baseline was a symmetric 8 second average that converged to a strong singer's own level, making a +7 dB jump unreachable. She rebuilt it as an asymmetric quiet floor (fall time constant 2.5 seconds, rise 45 seconds) with regression tests including the constant-belter case. The Fountain Lift belt mechanic (PR #428, about +5,004 lines) was still open as of mid-September 2026.

## Start-tap freeze and iOS audio
A post-practice Start-tap freeze was root-caused to an unbounded pitch.start await against a suspended AudioContext, and fixed with a four-layer defence: a synchronous gesture resume, a bounded resume, a 3 second scoped timeout, and proceed-anyway with a drained promise, plus six regression tests. An iOS bug where only the first voiced line played was traced to an HTML5 audio element created outside a user gesture; all web SFX were rerouted through the mic-safe Web Audio bridge. The Vegas-neon start screen and cue chips landed in PRs #384 and #386, with the tutorial runway retuned three times on real feel (1080 to 840 to 660 pixels). A pitch-frame trace and jitter-metrics tool (PR #431) is step one of a Mac pitch-jitter fix; the render-side filter itself is not built yet.
