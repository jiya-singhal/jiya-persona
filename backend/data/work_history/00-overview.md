---
title: Who Jiya is and what she works on (overview, as of September 2026)
company: SingOneSong
period: Aug 2025 - present
tags: overview, role, timeline, evidence
---
## Current role
Jiya Singhal is a Software Engineering Intern at Sing One Song (written "SingOneSong" in some places; the company's GitHub organisation is private). She joined in August 2025 and is still there as of September 2026, working from Bangalore. Sing One Song is a singing app: a Flutter mobile app that hosts a suite of voice-controlled games built in TypeScript (Phaser 3 and Canvas2D) inside a WebView, backed by Python and Firebase services. Her work sits between backend, real-time audio and game systems: take a messy physical signal (a person's voice), turn it into a reliable number fast enough that a game can react to it, and prove it works.

## Evidence base for everything the persona says about her work
Every claim in these work notes traces to a pull request, a commit, or a measurement. As of 10 September 2026 the record is 244 authored pull requests, 196 of them merged, across 13 Sing One Song repositories, with 60 of those PRs carrying teammate reviews. Across all repositories (work plus personal) she has 1,011 commits in 58 repositories. The Sing One Song code is in private company repositories, so the persona cannot link to it; PR numbers are quoted as evidence only.

## Timeline of the internship
- Sept 2025 to Apr 2026: backend and ML work on the vocal-analysis backend (voice activity detection, gender detection with Resemblyzer, audio enhancement), the noise-robustness research and the pitch-model benchmark, and the voice-onboarding pipeline.
- Jan to Apr 2026: Flutter app work in the mobile repo: song content pipeline, onboarding flows, debug tooling.
- May 2026: ported the Steady Shred game engine from Dart to TypeScript with a replay parity harness.
- Jun to Jul 2026: Singing Snakes port and endurance mode; tooling and CI for the game monorepo (screenshot pipeline, analytics, basic auth, bundle-sync CI).
- Jul to Aug 2026: Ride the Pitch onboarding rebuild, Steady Shred juice passes and cursor-drift fix, mic reliability across the Flutter/WebView boundary, practice cards and setlist work.
- Aug 26 to Sep 16 2026: first authored CI gate, agent skill and company playbook; diagnostic-tip system across six games; interruption-safe pause across all 14 games (merged 15 Sep 2026); a new game prototype, Paint the Pitch.

## Before Sing One Song
Product and Tech Intern at Tradeindia in Noida, January to April 2025. See the Tradeindia note.

## Education
Undergraduate in Computer Science at Scaler School of Technology, Bangalore (July 2023 to present, CGR 7.22), with a B.Sc. (Hons.) in Computer Science through Birla Institute of Technology (BITS), CGPA 7.89. She is a final-year student.

## Where she is heading
She is looking for software, AI/ML engineering, or product roles where the work is close to a real signal: audio, sensors, latency, evaluation. She likes problems where the first explanation is usually wrong and the fix has to be measured.
