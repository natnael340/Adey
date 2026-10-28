from dataclasses import dataclass, field

from django.conf import settings
from django.utils.module_loading import import_string
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage

from adey_apps.rag.agent_v2 import Agent
from adey_apps.rag.models import Chat, Message, MessageTypeChoices

HISTORY_TURNS = 3


@dataclass(frozen=True)
class PassResult:
    answer: str
    sources: list = field(default_factory=list)  # [{"title": str, "page": int | None}]


def recent_history(chat: Chat, session_id: str, turns: int = HISTORY_TURNS) -> list[BaseMessage]:
    rows = Message.objects.filter(chat=chat, session_id=session_id).order_by("-id")[: 2 * turns]
    return [
        (HumanMessage if row.message_type == MessageTypeChoices.HUMAN else AIMessage)(content=row.message)
        for row in reversed(rows)
    ]


def route(chat: Chat, question: str, history: list[BaseMessage]) -> str:
    """Pick the pass name for this question. The classifier replaces this body."""
    return settings.AGENT_DEFAULT_PASS


def answer(chat: Chat, session_id: str, question: str) -> PassResult:
    history = recent_history(chat, session_id)
    name = route(chat, question, history)
    return import_string(settings.AGENT_PASSES[name])(chat).run(question, session_id, history)


class LegacyAgentPass:
    def __init__(self, chat: Chat):
        self.chat = chat

    def run(self, question: str, session_id: str, history: list[BaseMessage]) -> PassResult:
        return PassResult(answer=Agent(self.chat).query(question, session_id=session_id))
