from adey_apps.rag.evaluation import EvalCase, is_refusal, load_cases, run_eval
from adey_apps.rag.passes import PassResult


class ScriptedPass:
    replies = {"q1": PassResult("Ships in 3 days.", [{"title": "FAQ", "page": None}]),
               "q2": PassResult("I'm sorry, I don't have information about that."),
               "q3": PassResult("Made up answer.")}

    def __init__(self, chat):
        pass

    def run(self, question, session_id, history):
        return self.replies[question]


def test_load_cases_parses_jsonl(tmp_path):
    path = tmp_path / "cases.jsonl"
    path.write_text('{"question": "q1", "answerable": true, "expected_sources": ["FAQ"]}\n\n'
                    '{"question": "q2", "answerable": false}\n')
    assert load_cases(str(path)) == [EvalCase("q1", True, ["FAQ"]), EvalCase("q2", False)]


def test_is_refusal_matches_both_refusal_styles():
    assert is_refusal("I'm sorry, I don't have information about that. Ask support.")
    assert is_refusal("I’m sorry, I don’t have that information.")
    assert not is_refusal("Sorry for the wait, shipping takes 3 days.")


def test_run_eval_scores_answers_refusals_and_sources(db, chat, settings):
    settings.AGENT_PASSES = {"scripted": "adey_apps.rag.tests.test_evaluation.ScriptedPass"}
    cases = [EvalCase("q1", True, ["FAQ"]), EvalCase("q2", False), EvalCase("q3", False)]
    report = run_eval(chat, cases, "scripted")
    assert report["answered_rate"] == 1.0
    assert report["refusal_rate"] == 0.5
    assert report["source_hit_rate"] == 1.0
    assert len(report["rows"]) == 3


def test_run_eval_empty_cases_gives_none_rates(db, chat, settings):
    settings.AGENT_PASSES = {"scripted": "adey_apps.rag.tests.test_evaluation.ScriptedPass"}
    report = run_eval(chat, [], "scripted")
    assert report["answered_rate"] is None and report["p95_ms"] is None
