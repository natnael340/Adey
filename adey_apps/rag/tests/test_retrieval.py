import pytest
from langchain_core.documents import Document

from adey_apps.rag import db as rag_db
from adey_apps.rag.retrieval import Chunk, dense_search, hybrid_search, keyword_query, keyword_search, rrf_fuse


@pytest.mark.parametrize("question, expected", [
    ("What's the price of PA-4471?", "what | the | price | of | pa | 4471"),
    ("C++ & 'price'?! :*", "price"),
    ("???", ""),
    ("🙂🙂", ""),
    ("ዋጋው ስንት ነው", "ዋጋው | ስንት | ነው"),
])
def test_keyword_query_tokenizes_safely(question, expected):
    assert keyword_query(question) == expected


def test_rrf_fuse_rewards_chunks_found_by_both():
    a, b, c = (Chunk(id=i, text=i, metadata={}) for i in "abc")
    assert [x.id for x in rrf_fuse([a, b], [c, b])] == ["b", "a", "c"]


def add_chunks(chat_id, texts):
    rag_db.get_chunk_store().add_documents(
        [Document(page_content=t, metadata={"chat_id": chat_id}) for t in texts],
        ids=[f"{chat_id}:r:{i}" for i in range(len(texts))],
    )


def test_hybrid_search_ranks_exact_term_first(pg_vector_db, fake_rag_embeddings):
    add_chunks("a", ["We print mugs.", "Order code PA-4471 ships in 2 days.", "Contact us anytime."])
    assert hybrid_search("a", "when does PA-4471 arrive", k=3)[0].id == "a:r:1"


def test_hybrid_search_never_crosses_bots(pg_vector_db, fake_rag_embeddings):
    add_chunks("a", ["Bot A secret price list PA-4471."])
    add_chunks("b", ["Bot B shipping policy."])
    assert {c.id for c in hybrid_search("b", "PA-4471 secret price list")} == {"b:r:0"}
    assert hybrid_search("never-built", "PA-4471 secret price list") == []


def test_keyword_search_handles_hostile_input(pg_vector_db):
    assert keyword_search("a", "'); DROP TABLE rag_chunks; -- & | !", k=5) == []


def test_dense_search_does_not_touch_store_search_config(pg_vector_db, fake_rag_embeddings):
    add_chunks("a", ["We print mugs.", "Shipping takes 3 days."])
    dense_search("a", "mugs", k=2)
    dense_search("a", "shipping", k=2)
    config = rag_db.get_chunk_store()._PGVectorStore__vs.hybrid_search_config
    assert config.fts_query == ""
    assert len(dense_search("a", "mugs", k=1)) == 1
