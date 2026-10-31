import logging

from django.conf import settings
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from adey_apps.rag.constants import CONVERSATION_FALLBACK, CONVERSATION_PROMPT, CONVERSATION_UNANSWERED, RAG_REFUSAL
from adey_apps.rag.models import Chat
from adey_apps.rag.passes import PassResult

logger = logging.getLogger(__name__)


class ConversationPass:
    def __init__(self, chat: Chat, unanswered: bool = False, llm: BaseChatModel | None = None):
        self.chat = chat
        self.unanswered = unanswered
        # some variety, so greetings don't sound canned
        self.llm = llm or ChatOpenAI(model=settings.RAG_CHAT_MODEL, temperature=0.5)

    def run(self, question: str, session_id: str, history: list[BaseMessage]) -> PassResult:
        company_name = self.chat.business_name
        prompt = CONVERSATION_PROMPT.format(assistant_name=self.chat.assistant_name, company_name=company_name)
        if self.unanswered:
            prompt += CONVERSATION_UNANSWERED.format(company_name=company_name)
        try:
            reply = self.llm.invoke([SystemMessage(prompt), *history, HumanMessage(question)]).text.strip()
        except Exception:
            logger.exception("conversation llm call failed chat=%s", self.chat.pk)
            reply = ""
        logger.info("conversation chat=%s unanswered=%s outcome=%s",
                    self.chat.pk, self.unanswered, "answered" if reply else "error")
        if not reply:
            reply = (RAG_REFUSAL if self.unanswered else CONVERSATION_FALLBACK).format(company_name=company_name)
        return PassResult(answer=reply, refused=self.unanswered)
