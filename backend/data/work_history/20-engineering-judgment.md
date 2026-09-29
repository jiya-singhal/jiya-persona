---
title: How Jiya works: engineering judgment in her own words
company: SingOneSong
period: Jul - Sep 2026
tags: engineering judgment, verification, debugging, scope, tradeoffs, code review, process
---
## Where these quotes come from
Verbatim lines Jiya wrote while directing work in 133 recorded engineering sessions between July and September 2026. They show how she thinks, not just what she shipped.

## Verification is a postcondition, not a vibe
Nearly every Ride the Pitch and Steady Shred task for a month carried: "engine.ts / config.ts stay byte-identical. Verify that at the end", later hardened to MD5 checks. On tests: "the unit tests must prove the REJECTION cases, not just the happy path ... what it turns away matters more than what it lets through." On a green benchmark: "60fps under 4x CPU throttle is a baseline showing no stress at all, which means it can't detect a regression." She matches the verification method to the bug: "this is a visual problem, confirm it by eye, not just by reading code."

## Diagnose before fix
"What is TRUE on the runway before rails 0-1 that is FALSE from rail 3 onward? Answer that with code, not with a story. Do NOT propose or apply a fix until the cause is identified with file:line evidence." After ten to fifteen failed colour changes: "do NOT just change a color property, that's what's been failing. The gold is clearly produced by some other mechanism. Diagnose the paint mechanism BEFORE changing anything." And the stale-build split: "is the code wrong, or am I testing a stale build?"

## Killing her own hypotheses
"Measured it. Clocks agree (2-13ms, no drift), drift hypothesis is dead. The real bug: the practice bar parks with its CENTRE on the scoring line instead of its trailing edge ... exactly the 1.05s a teammate measured." She also names her own scoping mistakes: "Everything we traced today was the arcade path; we explicitly set the practice miss emission aside as irrelevant. It wasn't."

## Scope and blast radius
"SPLIT INTO TWO PRs ... S0 is an engine change that has to be mirrored in Dart; burying it inside a cosmetic PR makes it harder to review, harder to roll back." Before a stable release: "in any of our PRs, do we touch code that affects other games? Let's create a fresh PR for the mic fix then." Back-compat as a tested invariant: "With none of the new params present, behaviour must be byte-identical to today. Prove it with a test."

## Design tradeoffs argued, not asserted
Re-sequencing a plan: "Putting it first means that if it overruns, what gets squeezed is the visible juice, which is the entire point of the pass." Catching a threshold inconsistency: "a note steady enough to KEEP grinding wasn't steady enough to mount, that's backwards." On flaky CI pins: "the baseline itself moved 575 to 591 between two runs, so a tight pin will flake in CI. Pin at measured-max plus 15 percent."

## Independence and correcting the AI
"STOP building. I asked for a DESIGN, not an implementation." "NEW SESSION, independent code review. Don't just agree; this feature went through several wrong turns and I want a real second opinion." Protecting a teammate's work in history: "my commits stacked on his commit. Keep his commit intact." Blocking a destructive auto-fix: "Do NOT run a sync to fix the drift; the branch has intended, uncommitted work and reconciling direction is my call, not yours."

## Turning failures into process
"J0 is a PREVIEW HARNESS, before any art commit. Non-negotiable: on the Steady Shred pass we shipped art nobody had looked at." "Standing rule from here: if the screen goes blank and the build is green, that's context exhaustion. Don't spend more than one attempt." Her read-only audit protocol, reused across at least six sessions: no drive-by fixes, file:line evidence for every claim, and an explicit "unverified" label instead of plausible inference.

## Her prompt template for AI-assisted work
Context and constraints first (what must not change). Diagnose before fix for bugs; read first and report the map for changes, with the premise stated so a wrong premise is a stop condition. Acceptance criteria and the verification method stated up front. Stop conditions. One concern per commit, build after each.
