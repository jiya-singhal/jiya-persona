---
title: Distributed KV-Cache cluster: three nodes, hash-modulo sharding, synchronous replication, 11,820 req/s on AWS
company: personal project
period: Jan 2026
tags: python, asyncio, distributed systems, tcp, replication, sharding, lru, ttl
---
## What it is
A key-value cache server written from scratch in Python with asyncio, speaking a custom text protocol over raw TCP (like Redis, not HTTP), then spread across three nodes so it holds more data and survives one node dying. Public repository jiya-singhal/KV-Cache.

## Which branch has what
The single-node server is on the main branch. The three-node distributed version, with sharding and replication, is on the branch named final-project-submission. If a repo summary describes the project as single-node, it was generated from main.

## Architecture in 20 seconds
Three nodes. Each key belongs to one shard by hash(key) modulo 3. Any node can take a request; if it is not the primary for that key it forwards over TCP. The primary writes locally, then sends the write to its replica with a REPLICATE prefix and waits for OK before answering the client. Inside each node it is the same OrderedDict cache with per-key TTL and bounded LRU eviction. One coroutine per client with asyncio, so no locks are needed inside a node.

## Load test
Load-tested on AWS: 11,820 requests per second, p99 latency 18.8 milliseconds, zero errors over 100,000 requests.

## The honest tradeoffs, in her words
Modulo sharding is not consistent hashing. Real consistent hashing puts keys and nodes on a ring so adding a node only moves about one Nth of the keys; with modulo, changing N moves almost everything. Fine for a fixed three nodes; she would switch to a ring with virtual nodes if nodes could be added at runtime. A real bug she hit: Python's hash() differs between processes, so nodes disagreed on which shard owned a key; fixed by setting PYTHONHASHSEED=0 in every container, and a better fix is a fixed hash such as CRC32 or MD5. If the replica is down during a write, the code logs the failed replication instead of failing the write, which is a gap; correct behaviour is to return an error, retry, or replay from a write-ahead log. There is no automatic failover if the primary dies; the design she would add is heartbeats, promotion of the replica after missed beats, and a 2-of-3 quorum so a cut-off node cannot promote itself (split-brain), which is what Redis Cluster does. Reads always go to the primary; each forward opens a new TCP connection (connection pooling would help); max size is counted in keys, not bytes.

## Why strong consistency
Every write waits for the replica, a deliberate cost paid so that reads always agree. She can argue both that trade and what she would add next.
