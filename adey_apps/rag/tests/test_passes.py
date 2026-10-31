from langchain_core.messages import AIMessage, HumanMessage

from adey_apps.rag.models import Message, MessageTypeChoices
from adey_apps.rag.passes import LegacyAgentPass, PassResult, answer, recent_history


class EchoPass:
    def __init__(self, chat):
        self.chat = chat

    def run(self, question, session_id, history):
        return PassResult(answer=f"{question}|{len(history)}", sources=[{"title": "T", "page": None}])


def test_recent_history_returns_last_turns_oldest_first(db, chat):
    for i in range(8):
        Message.objects.create(chat=chat, session_id="s", message=f"m{i}",
                               message_type=MessageTypeChoices.HUMAN if i % 2 else MessageTypeChoices.AI)
    history = recent_history(chat, "s", turns=2)
    assert [m.content for m in history] == ["m4", "m5", "m6", "m7"]
    assert isinstance(history[1], HumanMessage) and isinstance(history[0], AIMessage)


def test_answer_runs_the_routed_pass(db, chat, settings):
    settings.AGENT_PASSES = {"echo": "adey_apps.rag.tests.test_passes.EchoPass"}
    settings.AGENT_DEFAULT_PASS = "echo"
    assert answer(chat, "s", "hello") == PassResult("hello|0", [{"title": "T", "page": None}])


def test_legacy_agent_pass_wraps_agent_v2(db, chat, mocker):
    agent = mocker.patch("adey_apps.rag.passes.Agent")
    agent.return_value.query.return_value = "old answer"
    assert LegacyAgentPass(chat).run("q", "s", []) == PassResult("old answer")
    agent.return_value.query.assert_called_once_with("q", session_id="s")
