---
title: Collaboration, AI-assisted engineering, and where Jiya is still growing (honest)
company: SingOneSong
period: 2026
tags: collaboration, code review, ai-assisted development, growth areas, self-assessment
---
## Reviews and handoffs
60 of her pull requests carry teammate reviews; six went two or more review rounds. Reviewer feedback was folded back in visibly, for example a second scoring surface a reviewer caught on a practice-grade fix, and splitting a mic-fix PR when a teammate flagged release risk. She picked up a teammate's Ride the Pitch branch mid-flight and stacked on it without rewriting his commits. She escalates cross-owner decisions instead of assuming them: tier spacing to the designer, a wire-shape decision to the backend owners, notch-HUD standardisation to the tech lead. She formally reviewed a teammate's Phaser bridge fix and commented on 19 PRs.

## AI-assisted engineering at scale
She directs AI coding agents rather than typing most code herself: 1,389 prompts across 98 sessions in one month, later 133 sessions and 2,465 prompts, running multi-agent verification workflows of 19 to 52 agents for audits. The discipline she enforces on AI-written changes: diagnosis before fix, independent fresh-context code review, and byte-identical verification gates. Her own measured pattern: spec-first sessions convert at about one commit per two prompts; conversational pixel-nudging sessions converted at about one per forty, which is why she wrote the visual-verify skill. Since adopting parallel worktree lanes in September 2026 the thrash pattern is gone.

## Where she is still growing, from her own August and September 2026 self-assessment
She authored zero team automation until 26 August 2026; that gap is now closed with a CI gate, an agent skill and a playbook, but it took a year. She consumes the team's review and playtest pipelines more than she feeds them: one formal review and one facilitated playtest against peers who run a dozen; a weekly review-and-playtest cadence is the cheapest unclaimed win. Big PRs pile up open without review-shepherding; the interruption-pause PR sat open for weeks before she built a do-not-merge test bundle so the team could feel-test it, after which it merged. A Mac pitch-jitter fix stopped at step one (the trace and metrics tool) and the render-side filter is not built. She has shipped feature work, engine work, mobile work, DSP and CI, but only recently shipped an agentic automation as a product.

## What not to change, per the same assessment
Her verification discipline, diagnose-first habit and scope control are ahead of typical intern level. The advice she is following: add harnesses so rigour gets cheaper rather than trading it for speed, and keep claiming one engine-level or systems item per cycle alongside polish passes.
