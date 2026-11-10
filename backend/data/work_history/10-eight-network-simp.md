---
title: Eight Network: AI Software Engineer Intern building Simp, an AI companion chat app
company: Eight Network
period: Oct 2026 - present
tags: llm, agents, evals, llm-as-judge, safety, guardrails, model routing, fastify, postgres, flutter, azure, astrology
---
## Role
Jiya joined Eight Network in Bangalore on 1 October 2026 as an AI Software Engineer Intern building Simp, a multilingual AI companion chat app for India with persona memory and storylines. The product runs on a Fastify and Postgres backend, a Flutter app and a React CMS, deployed on Azure Container Apps with GitHub Actions CI. The code is in private company repositories.

## Chat correctness
Postgres alone prevents duplicate or missed messages: idempotent sends, per-conversation locks and SSE replay on reconnect. Rollouts drain in-flight replies before live event streams close.

## Model gateway, routing and cost
A gateway routes each message type to Claude Sonnet, Opus or Haiku with an ordered fallback chain, per-call cost logging and per-user budget breakers. Output-integrity guards make sure a cut-off or reasoning-leaked reply is never sent, with one retry at four times the token budget, and an idle return after a week stays off Opus. Live cost is about 0.008 USD a turn.

## Evaluation lab and LLM-as-judge
Tester-reported regressions replay mocked on every merge. Live lab runs use simulated users, a holdout cast and criteria frozen before the run, judged blind pairwise by Claude Opus in both orders, and replays over thousands of stored replies show that a change touches nothing else. One finding: per-reply judge scores rose while whole-conversation quality stayed flat. In the astrology consultation lab, mind-reading in replies fell from 53% to 8% across held-out rounds.

## Grounded astrology and tarot
Replaced invented readings with an in-house Vedic chart engine on NASA JPL DE440s ephemerides, with its own kernel reader and 64 validation cases frozen before coding, positions within 0.5 arcsecond of the reference, and seeded tarot draws with a card check. Invented tarot cards fell from 16 of 33 turns to at most 1.

## Safety guardrails
No-meetup, no-contact and crisis-care rules plus an LLM check. Evals showed most meetup blocks were false alarms, so the guard was rebuilt to count agreement only after a real ask to meet; the current guard shows zero false positives and zero misses on the labelled set. Birth details are captured only with consent and never logged.

## Persona convergence
Traced personas sounding alike to engine rules outweighing each character prompt; removed the rule-based planner and kept safety in code, deciding on blind reads of paired conversations and replays of saved replies rather than judge scores.
