import logging
from dataclasses import dataclass
from typing import Literal

from django.conf import settings
from langchain_core.messages import BaseMessage, HumanMessage
from typesafe_sdk import Choice, RetryPolicy, TypeSafeClient

from adey_apps.rag.skills.base import Skill
from adey_apps.rag.constants import KNOWLEDGE_ROUTE_CRITERIA, ROUTER_INSTRUCTIONS
from adey_apps.rag.models import Chat

logger = logging.getLogger(__name__)

KNOWLEDGE = "knowledge"
JEV_TIMEOUT_SECONDS = 2.0


@dataclass(frozen=True)
class Route:
    name: Literal["knowledge", "tools"]
    reason: str


def route(chat: Chat, question: str, history: list[BaseMessage], skills: list[Skill]) -> Route:
    if not skills:
        return Route(KNOWLEDGE, "no_tools")
    criteria = {
        KNOWLEDGE: KNOWLEDGE_ROUTE_CRITERIA.format(
            company_name=chat.business_name, business_description=chat.business_description
        ),
        **{c.key: c.description for c in skills},
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
    return Route("tools", f"chosen:{answer.choice}")
