import logging

from django.conf import settings
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

from adey_apps.rag.constants import RAG_ANSWER_PROMPT, RAG_CONDENSE_PROMPT, RAG_REFUSAL, RAG_SELECT_PROMPT
from adey_apps.rag.models import Chat
from adey_apps.rag.passes import PassResult
from adey_apps.rag.retrieval import Chunk, hybrid_search

logger = logging.getLogger(__name__)

RERANK_TOP_N = 5


class PassageSelection(BaseModel):
    ids: list[str]


class GroundedAnswer(BaseModel):
    # answer first: the model fills fields in order, and deciding answerable up front made it refuse clear answers
    answer: str
    citations: list[str]
    answerable: bool


def label_passages(chunks: list[Chunk]) -> dict[str, Chunk]:
    # "P1", not "1": documents number their own sections, and the model cited those numbers instead
    return {f"P{n}": c for n, c in enumerate(chunks, 1)}


def render_passages(chunks: list[Chunk]) -> str:
    return "\n".join(f'<passage id="{label}">{c.text}</passage>' for label, c in label_passages(chunks).items())


class RagPass:
    def __init__(self, chat: Chat, llm: BaseChatModel | None = None):
        self.chat = chat
        self.fast_llm = llm or ChatOpenAI(model=settings.RAG_CHAT_MODEL, temperature=0)
        self.answer_llm = llm or ChatOpenAI(model=settings.RAG_ANSWER_MODEL, temperature=0)

    def condense(self, question: str, history: list[BaseMessage]) -> str:
        if not any(isinstance(m, HumanMessage) for m in history):
            return question
        system = RAG_CONDENSE_PROMPT.format(company_name=self.chat.business_name)
        reply = self.fast_llm.invoke([SystemMessage(system), *history, HumanMessage(question)])
        return reply.content.strip()

    def select(self, query: str, chunks: list[Chunk]) -> list[Chunk]:
        prompt = RAG_SELECT_PROMPT.format(
            company_name=self.chat.business_name, question=query, passages=render_passages(chunks)
        )
        picked = self.fast_llm.with_structured_output(PassageSelection).invoke([HumanMessage(prompt)])
        labels = label_passages(chunks)
        return [labels[i] for i in dict.fromkeys(picked.ids) if i in labels][:RERANK_TOP_N]

    def generate(self, question: str, history: list[BaseMessage], chunks: list[Chunk]) -> GroundedAnswer:
        system = RAG_ANSWER_PROMPT.format(
            assistant_name=self.chat.assistant_name,
            company_name=self.chat.business_name,
            passages=render_passages(chunks),
        )
        return self.answer_llm.with_structured_output(GroundedAnswer).invoke(
            [SystemMessage(system), *history, HumanMessage(question)]
        )

    def run(self, question: str, session_id: str, history: list[BaseMessage]) -> PassResult:
        retrieved = selected = 0

        def finish(outcome: str, result: PassResult | None = None) -> PassResult:
            logger.info(
                "rag chat=%s retrieved=%d selected=%d outcome=%s", self.chat.slug, retrieved, selected, outcome
            )
            return result or PassResult(answer=RAG_REFUSAL.format(company_name=self.chat.business_name))

        query = self.condense(question, history)
        chunks = hybrid_search(str(self.chat.identifier), query)
        retrieved = len(chunks)
        if not chunks:
            return finish("refused: nothing retrieved")

        picked = self.select(query, chunks)
        selected = len(picked)
        if not picked:
            return finish("refused: nothing selected")

        result = self.generate(question, history, picked)
        if not (result.answerable and result.answer.strip()):
            return finish("refused: not answerable")
        labels = label_passages(picked)
        if not result.citations or not all(c in labels for c in result.citations):
            return finish("refused: invalid citations")

        sources = []
        for c in result.citations:
            meta = labels[c].metadata
            source = {"title": meta.get("title"), "page": meta.get("page")}
            if source not in sources:
                sources.append(source)
        return finish("answered", PassResult(answer=result.answer, sources=sources))
