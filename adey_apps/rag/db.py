"""
Shared Postgres resources for the RAG chunk store.

Each is created lazily once per process, so websocket connections, requests and
Celery tasks all reuse the same small pools instead of opening their own.
The SSL mode comes from PG_VECTOR_DB_URL itself (e.g. ``?sslmode=require``).
"""
from functools import lru_cache

import sqlalchemy
from django.conf import settings
from langchain_core.embeddings import Embeddings
from langchain_openai import OpenAIEmbeddings as RagOpenAIEmbeddings
from langchain_postgres import Column, PGEngine, PGVectorStore
from langchain_postgres.v2.hybrid_search_config import HybridSearchConfig

RAG_EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536
CHUNK_TABLE = "rag_chunks"
TSV_LANG = "pg_catalog.simple"


def _sqlalchemy_url(url: str) -> str:
    # SQLAlchemy 2 only accepts the "postgresql" scheme.
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://"):]
    return url


@lru_cache(maxsize=None)
def get_vector_engine() -> sqlalchemy.engine.Engine:
    engine = sqlalchemy.create_engine(
        _sqlalchemy_url(settings.PG_VECTOR_DB_URL),
        pool_size=settings.PG_VECTOR_POOL_SIZE,
        max_overflow=settings.PG_VECTOR_POOL_MAX_OVERFLOW,
        pool_pre_ping=True,
        pool_recycle=300,
    )
    with engine.begin() as connection:
        connection.execute(sqlalchemy.text("CREATE EXTENSION IF NOT EXISTS vector"))
    return engine


def _async_url(url: str) -> str:
    for scheme in ("postgres://", "postgresql://"):
        if url.startswith(scheme):
            return "postgresql+psycopg://" + url[len(scheme):]
    return url


@lru_cache(maxsize=1)
def get_rag_embeddings() -> Embeddings:
    return RagOpenAIEmbeddings(model=RAG_EMBEDDING_MODEL)


# Must stay lazy: never create at import or before a Celery fork (PGEngine's loop thread doesn't survive fork).
@lru_cache(maxsize=1)
def get_pg_engine() -> PGEngine:
    return PGEngine.from_connection_string(
        _async_url(settings.PG_VECTOR_DB_URL),
        pool_size=settings.PG_VECTOR_POOL_SIZE,
        max_overflow=settings.PG_VECTOR_POOL_MAX_OVERFLOW,
        pool_pre_ping=True,
        pool_recycle=300,
        # no server-side prepared statements: transaction-mode poolers (PgBouncer, Neon pooled) don't support them
        connect_args={"prepare_threshold": None},
    )


def chunk_search_config() -> HybridSearchConfig:
    # tsv_column must be explicit: the store only fills the tsvector column on insert when it is set.
    return HybridSearchConfig(
        tsv_column="content_tsv", tsv_lang=TSV_LANG
    )


def create_chunk_table(engine: PGEngine) -> None:
    with get_vector_engine().begin() as connection:
        exists = connection.execute(
            sqlalchemy.text(f"SELECT to_regclass('public.{CHUNK_TABLE}')")
        ).scalar_one_or_none()
    if exists is None:
        engine.init_vectorstore_table(
            CHUNK_TABLE,
            EMBEDDING_DIMENSIONS,
            id_column=Column("langchain_id", "TEXT"),
            metadata_columns=[Column("chat_id", "TEXT", nullable=False)],
            hybrid_search_config=chunk_search_config(),
        )
    with get_vector_engine().begin() as connection:
        connection.execute(sqlalchemy.text(
            f"CREATE INDEX IF NOT EXISTS {CHUNK_TABLE}_content_tsv_idx ON {CHUNK_TABLE} USING GIN (content_tsv)"
        ))
        connection.execute(sqlalchemy.text(
            f"CREATE INDEX IF NOT EXISTS {CHUNK_TABLE}_chat_id_idx ON {CHUNK_TABLE} (chat_id)"
        ))


@lru_cache(maxsize=1)
def get_chunk_store() -> PGVectorStore:
    return PGVectorStore.create_sync(
        engine=get_pg_engine(),
        embedding_service=get_rag_embeddings(),
        table_name=CHUNK_TABLE,
        id_column="langchain_id",
        metadata_columns=["chat_id"],
        hybrid_search_config=chunk_search_config(),
    )


def delete_chat_chunks(chat_id: str) -> None:
    get_chunk_store().delete(filter={"chat_id": chat_id})


def delete_stale_chat_chunks(chat_id: str, keep_ids: list[str]) -> None:
    with get_vector_engine().begin() as connection:
        connection.execute(
            sqlalchemy.text(
                f"DELETE FROM {CHUNK_TABLE} WHERE chat_id = :chat_id AND NOT (langchain_id = ANY(:ids))"
            ),
            {"chat_id": chat_id, "ids": keep_ids},
        )
