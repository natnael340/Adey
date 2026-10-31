import logging
from dataclasses import dataclass, replace
from typing import Literal

from django.conf import settings
from langchain_core.messages import BaseMessage, HumanMessage
from typesafe_sdk import Choice, RetryPolicy, TypeSafeClient

from adey_apps.rag.constants import CONVERSATION_ROUTE_CRITERIA, KNOWLEDGE_ROUTE_CRITERIA, ROUTER_INSTRUCTIONS
from adey_apps.rag.conversation_pass import ConversationPass
from adey_apps.rag.models import Chat
from adey_apps.rag.passes import PassResult
from adey_apps.rag.rag_pass import RagPass
from adey_apps.rag.skills.base import Skill, enabled_skills
from adey_apps.rag.tool_pass import ToolPass

logger = logging.getLogger(__name__)

KNOWLEDGE = "knowledge"
CONVERSATION = "conversation"
JEV_TIMEOUT_SECONDS = 2.0


@dataclass(frozen=True)
class Route:
    name: Literal["knowledge", "tools", "conversation"]
    reason: str


def route(chat: Chat, question: str, history: list[BaseMessage], skills: list[Skill]) -> Route:
    criteria = {
        KNOWLEDGE: KNOWLEDGE_ROUTE_CRITERIA.format(
            company_name=chat.business_name, business_description=chat.business_description
        ),
        CONVERSATION: CONVERSATION_ROUTE_CRITERIA.format(company_name=chat.business_name),
        **{s.key: s.description for s in skills},
    }
    turns = [f"{'Customer' if isinstance(m, HumanMessage) else 'Assistant'}: {m.content}" for m in history]
    state = "\n".join([*turns, f"Customer: {question}"])
    try:
        # Retries are off so a slow Jev falls back to RAG within the timeout instead of stalling the reply.
        client = TypeSafeClient(model=settings.JEV_MODEL, timeout=JEV_TIMEOUT_SECONDS, retry=RetryPolicy(max_retries=0))
        response = client.system_one(
            state=state, questions={"route": Choice(instructions=ROUTER_INSTRUCTIONS, criteria=criteria)}
        )
        answer = response.answers["route"]
    except Exception:
        logger.exception("router jev call failed chat=%s", chat.pk)
        return Route(KNOWLEDGE, "router_error")
    if answer.choice == KNOWLEDGE:
        return Route(KNOWLEDGE, f"chosen:{KNOWLEDGE}")
    if answer.confidence < settings.ROUTER_MIN_CONFIDENCE:
        return Route(KNOWLEDGE, f"low_confidence:{answer.choice}:{answer.confidence:.2f}")
    if answer.choice == CONVERSATION:
        return Route(CONVERSATION, f"chosen:{CONVERSATION}")
    return Route("tools", f"chosen:{answer.choice}")


class RouterPass:
    def __init__(self, chat: Chat):
        self.chat = chat

    def run(self, question: str, session_id: str, history: list[BaseMessage]) -> PassResult:
        skills = enabled_skills(self.chat, session_id)
        decision = route(self.chat, question, history, skills)
        logger.info("router chat=%s route=%s reason=%s", self.chat.pk, decision.name, decision.reason)
        if decision.name == "tools":
            result = ToolPass(self.chat, skills).run(question, session_id, history)
        elif decision.name == CONVERSATION:
            result = ConversationPass(self.chat).run(question, session_id, history)
        else:
            result = RagPass(self.chat).run(question, session_id, history)
            if result.refused:
                result = ConversationPass(self.chat, unanswered=True).run(question, session_id, history)
        return replace(result, route=decision.name)
