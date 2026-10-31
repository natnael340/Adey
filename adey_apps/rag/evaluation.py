import json
import math
import time
from dataclasses import dataclass, field
from pathlib import Path
from uuid import uuid4

from django.conf import settings
from django.utils import timezone
from django.utils.module_loading import import_string
from langchain_core.messages import AIMessage, HumanMessage

from adey_apps.rag.models import Chat


@dataclass(frozen=True)
class EvalCase:
    question: str
    answerable: bool
    expected_sources: list[str] = field(default_factory=list)
    history: list[str] = field(default_factory=list)
    expected_route: str | None = None


def load_cases(path: str) -> list[EvalCase]:
    with open(path, encoding="utf-8") as f:
        return [EvalCase(**json.loads(line)) for line in f if line.strip()]


def _rate(num: int, den: int):
    return num / den if den else None


def _nearest_rank_percentile(values: list[float], p: float):
    if not values:
        return None
    ordered = sorted(values)
    return ordered[max(math.ceil(p * len(ordered)) - 1, 0)]


def run_eval(chat: Chat, cases: list[EvalCase], pass_name: str) -> dict:
    runner = import_string(settings.AGENT_PASSES[pass_name])(chat)
    rows = []
    for case in cases:
        start = time.perf_counter()
        row = {"question": case.question, "pass": pass_name}
        history = [(AIMessage if i % 2 else HumanMessage)(content=turn) for i, turn in enumerate(case.history)]
        try:
            result = runner.run(case.question, f"eval-{uuid4().hex}", history)
            row |= {"answer": result.answer, "sources": result.sources, "refused": result.refused,
                    "route": result.route}
        except Exception as e:
            row |= {"answer": "", "sources": [], "refused": False, "route": "", "error": f"{type(e).__name__}: {e}"}
        row["ms"] = (time.perf_counter() - start) * 1000
        rows.append(row)
    pairs = list(zip(cases, rows))
    answerable = [(c, r) for c, r in pairs if c.answerable]
    unanswerable = [(c, r) for c, r in pairs if not c.answerable]
    with_sources = [(c, r) for c, r in answerable if c.expected_sources]
    hits = sum(
        any(s["title"] in c.expected_sources for s in r["sources"]) for c, r in with_sources
    )
    routed = [(c, r) for c, r in pairs if c.expected_route and r["route"]]
    times = [r["ms"] for r in rows]
    return {
        "pass": pass_name,
        "answered_rate": _rate(sum(not r["refused"] and "error" not in r for _, r in answerable), len(answerable)),
        "refusal_rate": _rate(sum(r["refused"] for _, r in unanswerable), len(unanswerable)),
        "source_hit_rate": _rate(hits, len(with_sources)),
        "route_accuracy": _rate(sum(r["route"] == c.expected_route for c, r in routed), len(routed)),
        "errors": sum("error" in r for r in rows),
        "p50_ms": _nearest_rank_percentile(times, 0.5),
        "p95_ms": _nearest_rank_percentile(times, 0.95),
        "rows": rows,
    }


def record(path: Path, summary: dict, *, chat: Chat, cases_path: str) -> None:
    line = {k: v for k, v in summary.items() if k != "rows"} | {
        "at": timezone.now().isoformat(timespec="seconds"),
        "chat": chat.slug,
        "chat_id": chat.pk,
        "cases": Path(cases_path).name,
        "jev_model": settings.JEV_MODEL,
        "chat_model": settings.RAG_CHAT_MODEL,
        "answer_model": settings.RAG_ANSWER_MODEL,
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(line) + "\n")
