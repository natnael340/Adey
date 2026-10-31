import logging

from django.conf import settings
from langchain.agents import create_agent
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import BaseMessage, HumanMessage, ToolMessage
from langchain_openai import ChatOpenAI

from adey_apps.rag.constants import TOOL_AGENT_PROMPT, TOOL_UNAVAILABLE
from adey_apps.rag.models import Chat
from adey_apps.rag.passes import PassResult
from adey_apps.rag.skills.base import Skill

logger = logging.getLogger(__name__)

RECURSION_LIMIT = 9  # about 4 tool calls


class ToolPass:
    def __init__(self, chat: Chat, skills: list[Skill], llm: BaseChatModel | None = None):
        self.chat = chat
        self.skills = skills
        self.llm = llm or ChatOpenAI(model=settings.RAG_CHAT_MODEL, temperature=0)

    def run(self, question: str, session_id: str, history: list[BaseMessage]) -> PassResult:
        agent = create_agent(
            self.llm,
            tools=[s.as_langchain_tool() for s in self.skills],
            system_prompt=TOOL_AGENT_PROMPT.format(
                assistant_name=self.chat.assistant_name, company_name=self.chat.business_name
            ),
        )
        try:
            result = agent.invoke({"messages": [*history, HumanMessage(question)]}, {"recursion_limit": RECURSION_LIMIT})
        except Exception:
            logger.exception("tool chat=%s calls=0 outcome=error", self.chat.pk)
            return PassResult(answer=TOOL_UNAVAILABLE.format(company_name=self.chat.business_name))
        messages = result["messages"]
        logger.info("tool chat=%s calls=%d outcome=answered", self.chat.pk,
                    sum(isinstance(m, ToolMessage) for m in messages))
        return PassResult(answer=messages[-1].text)
