---
title: The voice-onboarding pipeline: FastAPI, Cloud Run, Cloud Tasks, asyncio; cold runs 57s to 37s
company: SingOneSong
period: Sept 2025 - early 2026
tags: fastapi, gcp, cloud run, cloud tasks, asyncio, silero vad, latency, backend
---
## What it does
When a new user records their voice during onboarding, the backend trims silence, analyses pitch and vocal range, and saves the result. It is the first flow every new user hits, so its latency is the first impression of the product.

## What she built
The pipeline from scratch: FastAPI plus Firebase orchestration with retry-safe Cloud Tasks for background work. Then she re-architected it as concurrent orchestration on GCP Cloud Run using asyncio.gather, with Silero VAD silence trimming on the audio before analysis.

## Why asyncio and not threads or more servers
The steps were mostly waiting on other services rather than computing. asyncio.gather runs those waits concurrently on one CPU. Threads would add complexity for the same gain, and more servers only help when the CPU is the bottleneck.

## Why Cloud Tasks, and what idempotency meant here
Cloud Tasks is a queue with retries. A retry means a job can run twice, so every handler is idempotent: same input, same end state, no double side effects, and every handler survives Cloud Tasks redelivery.

## How much faster it got: cold runs 57 seconds to 37 seconds (the honest numbers)
An older version of her resume said p50 latency went from 57 seconds to 15 seconds. The precise statement is: the 57 seconds was a measured cold run; after the change the measured cold run was about 37 seconds; warm runs, where the server was already up, were much faster, and 15 seconds was the target for the warm path. She measured runs by hand, not as a p50 over production traffic. The current resume and website say 57 seconds to 37 seconds, cold-run latency measured end to end.

## Cold versus warm
Cloud Run turns instances off when idle, so the first request after idle has to boot one. The levers are minimum instances (costs money), a smaller image, and lazy model loading.
