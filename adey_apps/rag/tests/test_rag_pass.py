import pytest
from langchain_core.messages import AIMessage, HumanMessage

from adey_apps.rag.constants import RAG_REFUSAL
from adey_apps.rag.passes import PassResult
from adey_apps.rag.rag_pass import GroundedAnswer, PassageSelection, RagPass
from adey_apps.rag.retrieval import Chunk
from adey_apps.rag.tests.conftest import ScriptedLLM

CHUNKS = [Chunk(id=f"c:faq:{i}", text=t, metadata={"title": "FAQ", "page": None})
          for i, t in enumerate(["Shipping takes 3 days.", "Returns within 30 days.", "We print mugs."])]


def test_run_answers_with_cited_sources(db, chat, mocker):
    mocker.patch("adey_apps.rag.rag_pass.hybrid_search", return_value=CHUNKS)
    llm = ScriptedLLM(PassageSelection(ids=[1]),
                      GroundedAnswer(answerable=True, answer="It takes 3 days.", citations=[1]))
    result = RagPass(chat, llm=llm).run("how long is shipping?", "s", [])
    assert result == PassResult("It takes 3 days.", [{"title": "FAQ", "page": None}])


def test_run_refuses_when_nothing_retrieved(db, chat, mocker):
    mocker.patch("adey_apps.rag.rag_pass.hybrid_search", return_value=[])
    llm = ScriptedLLM()
    result = RagPass(chat, llm=llm).run("anything", "s", [])
    assert result.answer == RAG_REFUSAL.format(company_name=chat.business_name) and result.sources == []
    assert llm.calls == []


def test_run_refuses_greeting_without_generating(db, chat, mocker):
    mocker.patch("adey_apps.rag.rag_pass.hybrid_search", return_value=CHUNKS)
    llm = ScriptedLLM(PassageSelection(ids=[]))
    result = RagPass(chat, llm=llm).run("hi", "s", [])
    assert result.answer == RAG_REFUSAL.format(company_name=chat.business_name)
    assert len(llm.calls) == 1


@pytest.mark.parametrize("answer", [
    GroundedAnswer(answerable=False, answer="", citations=[]),
    GroundedAnswer(answerable=True, answer="Made up.", citations=[]),   # no citations
    GroundedAnswer(answerable=True, answer="Made up.", citations=[7]),  # cites a passage it wasn't given
    GroundedAnswer(answerable=True, answer="  ", citations=[1]),
])
def test_run_refuses_invalid_answers(db, chat, mocker, answer):
    mocker.patch("adey_apps.rag.rag_pass.hybrid_search", return_value=CHUNKS)
    result = RagPass(chat, llm=ScriptedLLM(PassageSelection(ids=[1]), answer)).run("q", "s", [])
    assert result.answer == RAG_REFUSAL.format(company_name=chat.business_name)


def test_condense_uses_history_only_when_present(db, chat):
    llm = ScriptedLLM("price of the premium plan")
    rag = RagPass(chat, llm=llm)
    assert rag.condense("how much?", []) == "how much?" and llm.calls == []
    assert rag.condense("how much?", [HumanMessage("tell me about premium"), AIMessage("Premium is...")]) \
        == "price of the premium plan"


def test_select_drops_bad_ids_and_caps_top_n(db, chat):
    chunks = [Chunk(id=str(i), text=str(i), metadata={}) for i in range(8)]
    llm = ScriptedLLM(PassageSelection(ids=[3, 3, 0, 99, 1, 2, 4, 5, 6]))
    assert [c.id for c in RagPass(chat, llm=llm).select("q", chunks)] == ["2", "0", "1", "3", "4"]
