import logging
from dataclasses import dataclass, field
from typing import TypedDict

from django.conf import settings
from django.utils.module_loading import import_string
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage

from adey_apps.rag.skills.base import enabled_skills
from adey_apps.rag.models import Chat, Message, MessageTypeChoices
from adey_apps.rag.router import route

logger = logging.getLogger(__name__)

HISTORY_TURNS = 3


class Source(TypedDict):
    title: str
    page: int | None


@dataclass(frozen=True)
class PassResult:
    answer: str
    sources: list[Source] = field(default_factory=list)


def recent_history(chat: Chat, session_id: str, turns: int = HISTORY_TURNS) -> list[BaseMessage]:
    rows = Message.objects.filter(chat=chat, session_id=session_id).order_by("-id")[: 2 * turns]
    return [
        (HumanMessage if row.message_type == MessageTypeChoices.HUMAN else AIMessage)(content=row.message)
        for row in reversed(rows)
    ]


def answer(chat: Chat, session_id: str, question: str) -> PassResult:
    history = recent_history(chat, session_id)
    return import_string(settings.AGENT_PASSES[settings.AGENT_DEFAULT_PASS])(chat).run(question, session_id, history)


class RouterPass:
    def __init__(self, chat: Chat):
        self.chat = chat

    def run(self, question: str, session_id: str, history: list[BaseMessage]) -> PassResult:
        # imported here because both passes import PassResult from this module
        from adey_apps.rag.rag_pass import RagPass
        from adey_apps.rag.tool_pass import ToolPass

        skills = enabled_skills(self.chat, session_id)
        decision = route(self.chat, question, history, skills)
        logger.info("router chat=%s route=%s reason=%s", self.chat.pk, decision.name, decision.reason)
        if decision.name == "tools":
            return ToolPass(self.chat, skills).run(question, session_id, history)
        return RagPass(self.chat).run(question, session_id, history)

