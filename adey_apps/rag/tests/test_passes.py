from langchain_core.messages import AIMessage, HumanMessage

from adey_apps.rag.models import Message, MessageTypeChoices
import logging

from adey_apps.rag.skills.clock import ClockNow
from adey_apps.rag.passes import PassResult, RouterPass, answer, recent_history
from adey_apps.rag.rag_pass import RagPass
from adey_apps.rag.router import Route


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


def test_router_sends_knowledge_to_rag(db, chat, mocker):
    mocker.patch("adey_apps.rag.passes.route", return_value=Route("knowledge", "chosen:knowledge"))
    rag = mocker.patch("adey_apps.rag.rag_pass.RagPass")
    tool = mocker.patch("adey_apps.rag.tool_pass.ToolPass")
    rag.return_value.run.return_value = PassResult("from rag")
    assert RouterPass(chat).run("refund policy?", "s", []) == PassResult("from rag")
    rag.assert_called_once_with(chat)
    rag.return_value.run.assert_called_once_with("refund policy?", "s", [])
    tool.assert_not_called()


def test_router_sends_tools_to_tool_pass_with_same_instances(db, chat, mocker):
    caps = [ClockNow(chat=chat, session_id="s", config=None)]
    mocker.patch("adey_apps.rag.passes.enabled_skills", return_value=caps)
    route = mocker.patch("adey_apps.rag.passes.route", return_value=Route("tools", "chosen:clock.now"))
    tool = mocker.patch("adey_apps.rag.tool_pass.ToolPass")
    tool.return_value.run.return_value = PassResult("It's Saturday.")
    assert RouterPass(chat).run("what day is it?", "s", []) == PassResult("It's Saturday.")
    assert route.call_args.args[3] is caps
    tool.assert_called_once_with(chat, caps)


def test_router_logs_route_and_reason(db, chat, mocker, caplog):
    mocker.patch("adey_apps.rag.passes.route", return_value=Route("knowledge", "router_error"))
    mocker.patch("adey_apps.rag.rag_pass.RagPass").return_value.run.return_value = PassResult("from rag")
    with caplog.at_level(logging.INFO, logger="adey_apps.rag.passes"):
        RouterPass(chat).run("q", "s", [])
    assert "route=knowledge reason=router_error" in caplog.text


def test_answer_defaults_to_router(db, chat, mocker):
    run = mocker.patch.object(RagPass, "run", return_value=PassResult("from rag"))
    assert answer(chat, "s", "refund policy?") == PassResult("from rag")
    run.assert_called_once_with("refund policy?", "s", [])
