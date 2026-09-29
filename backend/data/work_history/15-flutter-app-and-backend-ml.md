---
title: Flutter app work beyond the games, and the early backend and ML work
company: SingOneSong
period: Sept 2025 - Aug 2026
tags: flutter, dart, python, librosa, crepe, resemblyzer, firebase, cloud functions, onboarding
---
## The Flutter app by the numbers
104 pull requests in the mobile repo, 92 merged, roughly +61,979 and -6,369 lines, 228 commits between January and August 2026.

## Onboarding flows (March to April 2026)
Trainer mic test (sos-mobile PR #184, about +1,350 lines), hum-to-reveal (#192), a tone-deaf test with retry and verdict (#197, #200), error-handling screens (#206), the dive-bar flow (#241), auto-start and countdown polish (#220), the voice-analysis result and song-matches API (#254, #251), and personalised name audio pre-generation (#394).

## Debug tooling (March 2026)
A pitch chart with drag-to-zoom and pan (#146), an offset sweep for alignment debugging (#150, about +871 lines), tagging, deep links and Firestore word scores (#156, #162, #181), and a vocal range override (#479).

## Arcade and WebView platform
Deferred WebView load until bounds settle (#416), safe-area inset forwarding (#422), recoverable JavaScript error handling (#384), a fix for missing arcade tutorials plus a 15-beat tutorial restore (#1585), and tutorial source-of-truth drift resolved in both directions (#1339, #1348).

## Song content pipeline (January to March 2026)
Transcriptions (#24, about +5,820 lines), a timing-alignment series for one song (#104, #120), and a day-2 featured song (#1110).

## Backend and ML (September 2025 to April 2026)
The vocal-analysis backend, 7 PRs: a quick-test mode (#6, about +1,179 lines), a mic-check endpoint (#9), a Voice Activity Detection task (#13), gender detection v2 using Resemblyzer (#18) with the classifier service in a separate Resemblyzer repo (#1), and audio enhancement v2 (#21). Syllable-level data with corrected timing and CREPE pitch detection (be-scratch-workspace PR #10, about +7,898 lines). Firebase Cloud Functions getNoteName (sos #99) and getSongMatches (sos #550). Earlier prototypes: pitch-detection tuning for soft voices, first-note detection and octave correction in Sing-Space; gameplay, mic and reference-tone separation, and mobile responsiveness in singshot. Tech: Python, librosa, numpy, CREPE, Resemblyzer, Docker, Firebase Cloud Functions.

## Playtesting
She facilitated a 56 minute moderated remote playtest in August 2026 and ran the team's review-video pipeline on it, then turned playtest verdicts into engine redesigns the same week.
