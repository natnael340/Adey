import re
from dataclasses import dataclass

import sqlalchemy

from adey_apps.rag.db import CHUNK_TABLE, TSV_LANG, get_chunk_store, get_vector_engine

DENSE_TOP_K = 20


@dataclass(frozen=True)
class Chunk:
    id: str
    text: str
    metadata: dict


def keyword_query(question: str) -> str:
    tokens = [t for t in re.findall(r"[^\W_]+", question.lower()) if len(t) >= 2]
    return " | ".join(dict.fromkeys(tokens))


def dense_search(chat_id: str, query: str, k: int) -> list[Chunk]:
    docs = get_chunk_store().similarity_search(
        # no hybrid config: the library would also run its own keyword search and cache the first query on the shared config
        query, k=k, filter={"chat_id": chat_id}, hybrid_search_config=None
    )
    return [Chunk(d.id, d.page_content, dict(d.metadata)) for d in docs]


def keyword_search(chat_id: str, query: str, k: int) -> list[Chunk]:
    tsquery = keyword_query(query)
    if not tsquery:
        return []
    sql = sqlalchemy.text(
        f"""
        SELECT langchain_id, content, langchain_metadata, chat_id
        FROM {CHUNK_TABLE}
        WHERE chat_id = :chat_id
          AND content_tsv @@ to_tsquery('{TSV_LANG}', :query)
        ORDER BY ts_rank_cd(content_tsv, to_tsquery('{TSV_LANG}', :query)) DESC
        LIMIT :k
        """
    )
    with get_vector_engine().connect() as connection:
        rows = connection.execute(sql, {"chat_id": chat_id, "query": tsquery, "k": k}).all()
    return [Chunk(r[0], r[1], {**(r[2] or {}), "chat_id": r[3]}) for r in rows]


def rrf_fuse(*rankings: list[Chunk], k: int = 60) -> list[Chunk]:
    scores: dict[str, float] = {}
    first_seen: dict[str, Chunk] = {}
    for ranking in rankings:
        for rank, chunk in enumerate(ranking, start=1):
            first_seen.setdefault(chunk.id, chunk)
            scores[chunk.id] = scores.get(chunk.id, 0.0) + 1.0 / (k + rank)
    return [first_seen[i] for i in sorted(scores, key=scores.get, reverse=True)]


def hybrid_search(chat_id: str, query: str, k: int = DENSE_TOP_K) -> list[Chunk]:
    return rrf_fuse(dense_search(chat_id, query, k), keyword_search(chat_id, query, k))[:k]
