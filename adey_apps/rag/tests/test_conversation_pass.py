import pytest
from langchain_core.messages import AIMessage, HumanMessage

from adey_apps.rag.constants import CONVERSATION_FALLBACK, CONVERSATION_UNANSWERED, RAG_REFUSAL
from adey_apps.rag.conversation_pass import ConversationPass
from adey_apps.rag.passes import PassResult
from adey_apps.rag.tests.conftest import ScriptedLLM

pytestmark = pytest.mark.django_db


class FailingLLM:
    def invoke(self, messages):
        raise RuntimeError("boom")


def system_prompt(llm):
    return llm.calls[0][0].content


def test_replies_with_llm_text(chat):
    llm = ScriptedLLM("Hi! How can I help?")
    assert ConversationPass(chat, llm=llm).run("hello", "s", []) == PassResult("Hi! How can I help?")
    prompt = system_prompt(llm)
    assert chat.business_name in prompt and chat.assistant_name in prompt
    assert "Never state facts" in prompt and "Never say you did, checked, escalated" in prompt


def test_history_and_question_follow_the_prompt(chat):
    llm = ScriptedLLM("Sorry about that.")
    history = [HumanMessage("do you sell cars?"), AIMessage("I don't have information about that.")]
    ConversationPass(chat, llm=llm).run("why didn't you answer?", "s", history)
    assert llm.calls[0][1:] == [*history, HumanMessage("why didn't you answer?")]


def test_unanswered_adds_note_and_stays_refused(chat):
    llm = ScriptedLLM("Sorry, I don't have that.")
    result = ConversationPass(chat, unanswered=True, llm=llm).run("do you sell cars?", "s", [])
    assert system_prompt(llm).endswith(CONVERSATION_UNANSWERED.format(company_name=chat.business_name))
    assert result.refused is True


def test_llm_error_falls_back(chat):
    assert ConversationPass(chat, llm=FailingLLM()).run("hello", "s", []) == PassResult(
        CONVERSATION_FALLBACK.format(company_name=chat.business_name)
    )
    assert ConversationPass(chat, unanswered=True, llm=FailingLLM()).run("cars?", "s", []) == PassResult(
        RAG_REFUSAL.format(company_name=chat.business_name), refused=True
    )


def test_blank_reply_falls_back(chat):
    result = ConversationPass(chat, llm=ScriptedLLM("  ")).run("hello", "s", [])
    assert result == PassResult(CONVERSATION_FALLBACK.format(company_name=chat.business_name))
