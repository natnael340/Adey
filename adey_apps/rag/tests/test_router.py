import logging
from types import SimpleNamespace

import pytest
from langchain_core.messages import AIMessage, HumanMessage

from adey_apps.rag.passes import PassResult
from adey_apps.rag.router import Route, RouterPass, route
from adey_apps.rag.skills.clock import ClockNow

pytestmark = pytest.mark.django_db


@pytest.fixture
def jev(mocker):
    client_cls = mocker.patch("adey_apps.rag.router.TypeSafeClient")

    def answer(choice, confidence=0.9):
        client_cls.return_value.system_one.return_value = SimpleNamespace(
            answers={"route": SimpleNamespace(choice=choice, confidence=confidence)}
        )
        return client_cls

    return answer


@pytest.fixture
def clock(chat):
    return [ClockNow(chat=chat, session_id="s", config=None)]


def test_no_skills_skips_jev(chat, jev):
    client_cls = jev("clock.now")
    assert route(chat, "what day is it?", [], []) == Route("knowledge", "no_tools")
    client_cls.assert_not_called()


def test_tool_choice_routes_to_tools(chat, jev, clock):
    client_cls = jev("clock.now", 0.9)
    assert route(chat, "what day is it?", [], clock) == Route("tools", "chosen:clock.now")
    question = client_cls.return_value.system_one.call_args.kwargs["questions"]["route"]
    assert set(question.criteria) == {"knowledge", "clock.now"}
    assert question.criteria["clock.now"] == ClockNow.description
    assert chat.business_name in question.criteria["knowledge"]


def test_knowledge_choice_routes_to_knowledge(chat, jev, clock):
    jev("knowledge", 0.95)
    assert route(chat, "what's your refund policy?", [], clock) == Route("knowledge", "chosen:knowledge")


def test_low_confidence_tool_falls_back(chat, jev, clock):
    jev("clock.now", 0.4)
    assert route(chat, "hmm", [], clock) == Route("knowledge", "low_confidence:clock.now:0.40")


def test_jev_error_falls_back(chat, jev, clock):
    jev("clock.now").return_value.system_one.side_effect = RuntimeError("boom")
    assert route(chat, "what day is it?", [], clock) == Route("knowledge", "router_error")


def test_history_is_in_state(chat, jev, clock):
    client_cls = jev("knowledge")
    route(chat, "and tomorrow?", [HumanMessage("hi"), AIMessage("hello, how can I help?")], clock)
    state = client_cls.return_value.system_one.call_args.kwargs["state"]
    assert state == "Customer: hi\nAssistant: hello, how can I help?\nCustomer: and tomorrow?"


def test_router_sends_knowledge_to_rag(chat, mocker):
    mocker.patch("adey_apps.rag.router.route", return_value=Route("knowledge", "chosen:knowledge"))
    rag = mocker.patch("adey_apps.rag.router.RagPass")
    tool = mocker.patch("adey_apps.rag.router.ToolPass")
    rag.return_value.run.return_value = PassResult("from rag")
    assert RouterPass(chat).run("refund policy?", "s", []) == PassResult("from rag")
    rag.assert_called_once_with(chat)
    rag.return_value.run.assert_called_once_with("refund policy?", "s", [])
    tool.assert_not_called()


def test_router_sends_tools_to_tool_pass_with_same_instances(chat, mocker):
    skills = [ClockNow(chat=chat, session_id="s", config=None)]
    mocker.patch("adey_apps.rag.router.enabled_skills", return_value=skills)
    route = mocker.patch("adey_apps.rag.router.route", return_value=Route("tools", "chosen:clock.now"))
    tool = mocker.patch("adey_apps.rag.router.ToolPass")
    tool.return_value.run.return_value = PassResult("It's Saturday.")
    assert RouterPass(chat).run("what day is it?", "s", []) == PassResult("It's Saturday.")
    assert route.call_args.args[3] is skills
    tool.assert_called_once_with(chat, skills)


def test_router_logs_route_and_reason(chat, mocker, caplog):
    mocker.patch("adey_apps.rag.router.route", return_value=Route("knowledge", "router_error"))
    mocker.patch("adey_apps.rag.router.RagPass").return_value.run.return_value = PassResult("from rag")
    with caplog.at_level(logging.INFO, logger="adey_apps.rag.router"):
        RouterPass(chat).run("q", "s", [])
    assert "route=knowledge reason=router_error" in caplog.text
