import json
import math
import time
from dataclasses import dataclass, field
from uuid import uuid4

from django.conf import settings
from django.utils.module_loading import import_string

from adey_apps.rag.models import Chat


@dataclass(frozen=True)
class EvalCase:
    question: str
    answerable: bool
    expected_sources: list[str] = field(default_factory=list)


def load_cases(path: str) -> list[EvalCase]:
    with open(path, encoding="utf-8") as f:
        return [EvalCase(**json.loads(line)) for line in f if line.strip()]


def is_refusal(answer: str) -> bool:
    # Legacy prompt uses curly apostrophes; v2 uses straight ones.
    return answer.replace("’", "'").lower().startswith("i'm sorry, i don't have")


def _rate(num: int, den: int):
    return num / den if den else None  # None when there is nothing to measure


def _percentile(values: list[float], p: float):
    if not values:
        return None
    ordered = sorted(values)
    return ordered[max(math.ceil(p * len(ordered)) - 1, 0)]  # nearest-rank


def run_eval(chat: Chat, cases: list[EvalCase], pass_name: str) -> dict:
    runner = import_string(settings.AGENT_PASSES[pass_name])(chat)
    rows = []
    for case in cases:
        start = time.perf_counter()
        result = runner.run(case.question, f"eval-{uuid4().hex}", [])
        ms = (time.perf_counter() - start) * 1000
        rows.append({
            "question": case.question,
            "pass": pass_name,
            "answer": result.answer,
            "sources": result.sources,
            "refused": is_refusal(result.answer),
            "ms": ms,
        })
    pairs = list(zip(cases, rows))
    answerable = [(c, r) for c, r in pairs if c.answerable]
    unanswerable = [(c, r) for c, r in pairs if not c.answerable]
    with_sources = [(c, r) for c, r in answerable if c.expected_sources]
    hits = sum(
        any(s["title"] in c.expected_sources for s in r["sources"]) for c, r in with_sources
    )
    times = [r["ms"] for r in rows]
    return {
        "pass": pass_name,
        "answered_rate": _rate(sum(not r["refused"] for _, r in answerable), len(answerable)),
        "refusal_rate": _rate(sum(r["refused"] for _, r in unanswerable), len(unanswerable)),
        "source_hit_rate": _rate(hits, len(with_sources)),
        "p50_ms": _percentile(times, 0.5),
        "p95_ms": _percentile(times, 0.95),
        "rows": rows,
    }
