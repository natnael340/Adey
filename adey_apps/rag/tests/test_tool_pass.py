import pytest
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langchain_core.messages import AIMessage
from langchain_core.utils.function_calling import convert_to_openai_tool

from adey_apps.rag.skills.base import enabled_skills
from adey_apps.rag.skills.clock import ClockNow
from adey_apps.rag.constants import TOOL_UNAVAILABLE
from adey_apps.rag.models import ChatSkill
from adey_apps.rag.passes import PassResult
from adey_apps.rag.tool_pass import ToolPass

pytestmark = pytest.mark.django_db


class ToolCallingFake(GenericFakeChatModel):
    seen: list = []
    tools: list = []

    def bind_tools(self, tools, **kwargs):
        self.tools.extend(convert_to_openai_tool(t) for t in tools)
        return self

    def _generate(self, messages, *args, **kwargs):
        self.seen.append(messages)
        return super()._generate(messages, *args, **kwargs)


class BrokenModel(ToolCallingFake):
    def _generate(self, messages, *args, **kwargs):
        raise RuntimeError("openai down")


def tool_call(name):
    return AIMessage(content="", tool_calls=[{"name": name, "args": {}, "id": "call_1"}])


def test_calls_skill_and_answers(chat, mocker):
    run = mocker.spy(ClockNow, "run")
    llm = ToolCallingFake(messages=iter([tool_call("clock_now"), AIMessage("It's Friday.")]))
    caps = [ClockNow(chat=chat, session_id="s", config=None)]
    assert ToolPass(chat, caps, llm=llm).run("what day is it?", "s", []) == PassResult("It's Friday.", [])
    assert run.call_count == 1
    assert {t["function"]["name"] for t in llm.tools} == {"clock_now"}


def test_answers_without_tool_call(chat):
    llm = ToolCallingFake(messages=iter([AIMessage("Which order number?")]))
    caps = [ClockNow(chat=chat, session_id="s", config=None)]
    assert ToolPass(chat, caps, llm=llm).run("where is my order?", "s", []).answer == "Which order number?"


def test_agent_error_returns_unavailable(chat):
    caps = [ClockNow(chat=chat, session_id="s", config=None)]
    result = ToolPass(chat, caps, llm=BrokenModel(messages=iter([]))).run("what day is it?", "s", [])
    assert result == PassResult(TOOL_UNAVAILABLE.format(company_name=chat.business_name))


def test_config_never_sent_to_llm(chat):
    ChatSkill.objects.create(chat=chat, key="test.echo_key", config={"api_key": "sk-secret-1234"})
    llm = ToolCallingFake(messages=iter([tool_call("test_echo_key"), AIMessage("Done.")]))
    assert ToolPass(chat, enabled_skills(chat, "s"), llm=llm).run("check my key", "s", []).answer == "Done."
    assert len(llm.seen) == 2
    assert "sk-secret" not in repr(llm.seen) + repr(llm.tools)
