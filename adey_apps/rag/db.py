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
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_openai import OpenAIEmbeddings as RagOpenAIEmbeddings
from langchain_postgres import Column, PGEngine, PGVectorStore
from langchain_postgres.v2.hybrid_search_config import HybridSearchConfig
from langgraph.checkpoint.postgres import PostgresSaver
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

RAG_EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536
CHUNK_TABLE = "rag_chunks"
TSV_LANG = "pg_catalog.simple"

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


@lru_cache(maxsize=1)
def get_embeddings() -> OpenAIEmbeddings:
    return OpenAIEmbeddings()


def get_vectorstore(collection_name) -> PGVector:
    return _get_vectorstore(force_str(collection_name))


@lru_cache(maxsize=None)
def _get_vectorstore(collection_name: str) -> PGVector:
    return PGVector(
        connection_string=settings.PG_VECTOR_DB_URL,
        collection_name=collection_name,
        embedding_function=get_embeddings(),
        connection=get_vector_engine(),
        # get_vector_engine ensures the extension exists in the vector database.
        create_extension=False,
    )


def delete_vector_collection(collection_name) -> None:
    collection_name = force_str(collection_name)
    try:
        with get_vector_engine().begin() as connection:
            tables_exist = connection.execute(
                sqlalchemy.text("SELECT to_regclass('langchain_pg_collection')")
            ).scalar_one_or_none()
            if tables_exist is None:
                return
            collection_id = connection.execute(
                sqlalchemy.text(
                    "SELECT uuid FROM langchain_pg_collection WHERE name = :name"
                ),
                {"name": collection_name},
            ).scalar_one_or_none()
            if collection_id is None:
                return
            connection.execute(
                sqlalchemy.text(
                    "DELETE FROM langchain_pg_embedding WHERE collection_id = :collection_id"
                ),
                {"collection_id": collection_id},
            )
            connection.execute(
                sqlalchemy.text("DELETE FROM langchain_pg_collection WHERE uuid = :uuid"),
                {"uuid": collection_id},
            )
    finally:
        _get_vectorstore.cache_clear()


def replace_vector_collection(collection_name, docs: list[Document]) -> None:
    texts = [d.page_content for d in docs]
    embeddings = get_embeddings().embed_documents(texts)
    delete_vector_collection(collection_name)
    get_vectorstore(collection_name).add_embeddings(texts, embeddings, metadatas=[d.metadata for d in docs])


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
        connect_args={"prepare_threshold": None},  # transaction-mode poolers, see CHECKPOINTER_CONNECTION_KWARGS
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
