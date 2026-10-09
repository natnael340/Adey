"""
Shared Postgres resources for the vector store and the LangGraph checkpointer.

Each is created lazily once per process, so websocket connections, requests and
Celery tasks all reuse the same small pools instead of opening their own.
The SSL mode comes from PG_VECTOR_DB_URL itself (e.g. ``?sslmode=require``).
"""
from functools import lru_cache

import sqlalchemy
from django.conf import settings
from django.utils.encoding import force_str
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import PGVector
from langgraph.checkpoint.postgres import PostgresSaver
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

# prepare_threshold=None disables server-side prepared statements, which
# transaction-mode poolers (PgBouncer, Neon/Supabase pooled endpoints) don't support.
CHECKPOINTER_CONNECTION_KWARGS = {
    "autocommit": True,
    "prepare_threshold": None,
    "row_factory": dict_row,
}


def _sqlalchemy_url(url: str) -> str:
    # SQLAlchemy 2 only accepts the "postgresql" scheme.
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://"):]
    return url


@lru_cache(maxsize=None)
def get_vector_engine() -> sqlalchemy.engine.Engine:
    return sqlalchemy.create_engine(
        _sqlalchemy_url(settings.PG_VECTOR_DB_URL),
        pool_size=settings.PG_VECTOR_POOL_SIZE,
        max_overflow=settings.PG_VECTOR_POOL_MAX_OVERFLOW,
        pool_pre_ping=True,
        pool_recycle=300,
    )


def get_vectorstore(collection_name) -> PGVector:
    return PGVector(
        connection_string=settings.PG_VECTOR_DB_URL,
        collection_name=force_str(collection_name),
        embedding_function=OpenAIEmbeddings(),
        connection=get_vector_engine(),
        # The extension is created by migration rag.0028.
        create_extension=False,
    )


@lru_cache(maxsize=None)
def get_checkpointer_pool() -> ConnectionPool:
    return ConnectionPool(
        conninfo=settings.PG_VECTOR_DB_URL,
        min_size=1,
        max_size=settings.CHECKPOINTER_POOL_SIZE,
        max_idle=300,
        kwargs=CHECKPOINTER_CONNECTION_KWARGS,
        # Managed providers drop idle connections (e.g. Neon autosuspend).
        check=ConnectionPool.check_connection,
        open=True,
    )


def get_checkpointer() -> PostgresSaver:
    return PostgresSaver(get_checkpointer_pool())
