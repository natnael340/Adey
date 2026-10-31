from types import SimpleNamespace

from langchain_core.messages import AIMessage, HumanMessage

from adey_apps.rag.constants import RAG_REFUSAL
from adey_apps.rag.models import ChatSkill, Message, MessageTypeChoices
from adey_apps.rag.passes import PassResult, answer, recent_history
from adey_apps.rag.rag_pass import RagPass


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


def test_answer_defaults_to_router(db, chat, mocker):
    ChatSkill.objects.create(chat=chat, key="clock.now", is_active=False)
    jev = mocker.patch("adey_apps.rag.router.TypeSafeClient").return_value.system_one
    jev.return_value = SimpleNamespace(answers={"route": SimpleNamespace(choice="knowledge", confidence=0.9)})
    run = mocker.patch.object(RagPass, "run", return_value=PassResult("from rag"))
    assert answer(chat, "s", "refund policy?") == PassResult("from rag", route="knowledge")
    run.assert_called_once_with("refund policy?", "s", [])


def test_rag_pass_keeps_fixed_refusal(db, chat, settings, mocker):
    settings.AGENT_DEFAULT_PASS = "rag"
    mocker.patch("adey_apps.rag.rag_pass.hybrid_search", return_value=[])
    result = answer(chat, "s", "hello")
    assert result == PassResult(RAG_REFUSAL.format(company_name=chat.business_name), refused=True)
