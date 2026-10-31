from types import SimpleNamespace

import pytest
from langchain_core.messages import AIMessage, HumanMessage

from adey_apps.rag.skills.clock import ClockNow
from adey_apps.rag.router import Route, route

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
