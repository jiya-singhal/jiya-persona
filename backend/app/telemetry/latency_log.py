"""Per-turn latency logger backed by SQLite.

Schema (single table `turns`):
  id INTEGER PK
  turn_id TEXT (uuid, unique)
  channel TEXT ("chat" | "voice")
  message TEXT (truncated user message)
  t_request_start REAL  (epoch sec)
  t_retrieval_end REAL
  t_first_token REAL
  t_response_end REAL
  retrieved_count INTEGER
  tool_calls INTEGER
  error TEXT (NULL if ok)

Computed columns at read time:
  retrieval_ms, ttft_ms, total_ms
"""

import logging
import sqlite3
import time
import uuid
from contextlib import contextmanager
from pathlib import Path
from threading import Lock

logger = logging.getLogger(__name__)

DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "latency.sqlite"
_init_lock = Lock()
_initialized = False


def _conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    return sqlite3.connect(DB_PATH, isolation_level=None)


def _init_db() -> None:
    global _initialized
    with _init_lock:
        if _initialized:
            return
        with _conn() as c:
            c.execute(
                """
                CREATE TABLE IF NOT EXISTS turns (
                  id INTEGER PRIMARY KEY,
                  turn_id TEXT UNIQUE NOT NULL,
                  channel TEXT NOT NULL,
                  message TEXT,
                  t_request_start REAL NOT NULL,
                  t_retrieval_end REAL,
                  t_first_token REAL,
                  t_response_end REAL,
                  retrieved_count INTEGER,
                  tool_calls INTEGER DEFAULT 0,
                  error TEXT
                )
                """
            )
            c.execute("CREATE INDEX IF NOT EXISTS idx_turns_channel ON turns(channel)")
        _initialized = True


class TurnTimer:
    """One-shot per-turn timer. Use as a context manager."""

    def __init__(self, channel: str, message: str = ""):
        _init_db()
        self.turn_id = uuid.uuid4().hex
        self.channel = channel
        self.message = (message or "")[:200]
        self.t_request_start = time.time()
        self.t_retrieval_end: float | None = None
        self.t_first_token: float | None = None
        self.t_response_end: float | None = None
        self.retrieved_count: int = 0
        self.tool_calls: int = 0
        self.error: str | None = None

    def mark_retrieval_end(self, count: int) -> None:
        self.t_retrieval_end = time.time()
        self.retrieved_count = count

    def mark_first_token(self) -> None:
        if self.t_first_token is None:
            self.t_first_token = time.time()

    def increment_tool_call(self) -> None:
        self.tool_calls += 1

    def fail(self, message: str) -> None:
        self.error = message[:500]

    def finish(self) -> None:
        self.t_response_end = time.time()
        try:
            with _conn() as c:
                c.execute(
                    """
                    INSERT OR REPLACE INTO turns
                    (turn_id, channel, message, t_request_start,
                     t_retrieval_end, t_first_token, t_response_end,
                     retrieved_count, tool_calls, error)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        self.turn_id,
                        self.channel,
                        self.message,
                        self.t_request_start,
                        self.t_retrieval_end,
                        self.t_first_token,
                        self.t_response_end,
                        self.retrieved_count,
                        self.tool_calls,
                        self.error,
                    ),
                )
        except Exception as e:
            logger.warning(f"latency log write failed: {e}")

    def __enter__(self) -> "TurnTimer":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        if exc and not self.error:
            self.fail(repr(exc))
        self.finish()


@contextmanager
def timer(channel: str, message: str = ""):
    t = TurnTimer(channel, message)
    try:
        yield t
    finally:
        if t.t_response_end is None:
            t.finish()


def summary() -> dict:
    """Aggregate stats for the eval report."""
    _init_db()
    with _conn() as c:
        rows = c.execute(
            """
            SELECT channel,
                   t_request_start, t_retrieval_end, t_first_token, t_response_end
            FROM turns WHERE error IS NULL
            """
        ).fetchall()

    by_channel: dict[str, list[dict]] = {}
    for ch, tstart, tret, tft, tend in rows:
        if tend is None or tstart is None:
            continue
        d = {
            "total_ms": (tend - tstart) * 1000,
            "retrieval_ms": (tret - tstart) * 1000 if tret else None,
            "ttft_ms": (tft - tstart) * 1000 if tft else None,
        }
        by_channel.setdefault(ch, []).append(d)

    out = {}
    for ch, items in by_channel.items():
        out[ch] = {"n": len(items)}
        for key in ("retrieval_ms", "ttft_ms", "total_ms"):
            vals = sorted(v[key] for v in items if v[key] is not None)
            if not vals:
                continue
            out[ch][f"{key}_p50"] = round(vals[len(vals) // 2], 1)
            p95_idx = max(0, int(len(vals) * 0.95) - 1)
            out[ch][f"{key}_p95"] = round(vals[p95_idx], 1)
    return out
