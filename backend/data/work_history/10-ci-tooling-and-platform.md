---
title: CI, tooling and platform work on the game monorepo: screenshots on every PR, analytics, auth, bundle sync, a drift gate
company: SingOneSong
period: Jun - Sep 2026
tags: ci, github actions, playwright, posthog, firebase, pulumi, tooling, automation
---
## Cross-game screenshot pipeline
A Playwright runner that boots every hook-ready game headless across device profiles to its real gameplay HUD without a microphone: 13 games, 26 of 26 captures green (phaser-games PR #158, about +1,821 lines). A CI poster embeds the shots inline in each pull request so reviewers keep a durable visual record after preview links expire. It is deliberately a poster, not a gate, with the size math written down. Headless browsers report zero for the notch and safe-area insets, so the runner injects real values or every screenshot would lie. She escalated rather than assumed one finding: only one game's HUD actually responds to injected notch insets, so games were classified as visually notch-verified versus value-assert-only.

## Analytics
PostHog instrumentation across about 20 games (phaser-games PR #179, about +1,542 lines in 16 atomic commits): a site super-property, five games newly wired, and a gameplay heartbeat that solved a real measurement problem, because voice-controlled runs produce no taps and session replay marked players as inactive.

## Auth and infrastructure
HTTP Basic Auth for all 20 live game sites through a host-aware Firebase function, with the 20-site list derived programmatically from the registry so it cannot drift (phaser-games PR #194, about +4,444 lines). Restored two dropped CORS origins and synced the CORS script with Pulumi (infra PR #6). Shared logo mount, themed favicons, and Open Graph and Twitter cards for all games.

## Bundle-sync CI between the game monorepo and the Flutter app
Build-from-main-tip plus serialised runs to stop stale bundles (phaser-games PR #220); vendored asset directories auto-declared in the Flutter pubspec (PR #223) with a severity-ranked threat model written before implementation, because invalid YAML would break every Flutter build; a lockfile fix that unblocked the sync (PR #257). She later documented the human workflow around the sync robot as a company playbook.

## First authored automation (26 August 2026)
Three things merged in one day, each the first of its kind with her name on it. A tutorial-mirror drift check as a PR gate, using a cross-repo sparse checkout of the canonical mobile JSON, green in 28 seconds (phaser-games PR #429); it prevents the drift incident class where a tutorial plays on web but not in the arcade. An agent skill called visual-verify: agents must render the real draw path, capture it, diff against the reference, and self-iterate up to four rounds before reporting, written against her own measured worst pattern of 85 prompts for one commit on visual work (phaser-games PR #430). And the game-bundle-sync playbook in the company's operations repo (nina PR #61).

## Shared packages
A diagnostic-tip system: a shared TipVerdict of line and reason, wired into six games, where one source feeds both the game's result screen and the app's setlist card (phaser-games PR #432, about +2,126 lines; sos-mobile PR #1852). A shared music-toggle package adopted by four games, with localStorage-backed mute and change fan-out (phaser-games PR #498, merged September 2026). A shared pause and watch-tutorial ribbon across six games (PR #425).
