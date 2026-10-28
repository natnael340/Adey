import asyncio
from urllib.parse import quote

import pytest
import sqlalchemy
from django.db import connection
from langchain_core.embeddings import DeterministicFakeEmbedding
from langchain_core.messages import AIMessage

from adey_apps.rag import db as rag_db

CHAT_DATA = {
        "name": "Customer support",
        "assistant_name": "Helen Doe",
        "business_name": "Print Avenue LTD",
        "business_description": "Print on demand business",
        "assistant_characters": ["funny", "innocent"],
        "assistant_picture_data": (
            "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//"
            "gA+Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRy"
            "B2ODApLCBkZWZhdWx0IHF1YWxpdHkK/9sAQwAIBgYHBgUIBwcHCQk"
            "ICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0N"
            "B8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjI"
            "yMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/"
            "8AAEQgAAQABAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAA"
            "BAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSIT"
            "FBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqN"
            "DU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFho"
            "eIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09T"
            "V1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAA"
            "AAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUh"
            "MQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo"
            "1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4i"
            "JipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ"
            "2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A56iiigD/2Q=="
        )
    }


def _clear_shared_caches():
    rag_db.get_vector_engine.cache_clear()
    rag_db._get_vectorstore.cache_clear()
    rag_db.get_embeddings.cache_clear()
    rag_db.get_checkpointer_pool.cache_clear()
    rag_db.get_pg_engine.cache_clear()
    rag_db.get_chunk_store.cache_clear()
    rag_db.get_rag_embeddings.cache_clear()


@pytest.fixture(autouse=True)
def fresh_shared_resources():
    """Every test starts without cached pools and closes the ones it opened."""
    _clear_shared_caches()
    yield
    if rag_db.get_vector_engine.cache_info().currsize:
        engine = rag_db.get_vector_engine()
        if hasattr(engine, "dispose"):
            engine.dispose()
    if rag_db.get_checkpointer_pool.cache_info().currsize:
        pool = rag_db.get_checkpointer_pool()
        if hasattr(pool, "close"):
            pool.close()
    if rag_db.get_pg_engine.cache_info().currsize:
        engine = rag_db.get_pg_engine()
        asyncio.run_coroutine_threadsafe(engine.close(), engine._loop).result()
    _clear_shared_caches()


@pytest.fixture
def pg_vector_db(transactional_db, settings):
    """
    Point PG_VECTOR_DB_URL at the pytest-django test database.

    transactional_db is used because the vector store and checkpointer open their
    own connections, which can't see data inside the test's wrapping transaction.
    """
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1 FROM pg_available_extensions WHERE name = 'vector'")
        if cursor.fetchone() is None:
            pytest.skip("pgvector extension is not available on the test database")
        cursor.execute("CREATE EXTENSION IF NOT EXISTS vector")

    db = connection.settings_dict
    url = (
        f"postgresql://{quote(db['USER'])}:{quote(db['PASSWORD'])}"
        f"@{db['HOST'] or 'localhost'}:{db['PORT'] or 5432}/{db['NAME']}"
    )
    if db["OPTIONS"].get("sslmode"):
        url += f"?sslmode={db['OPTIONS']['sslmode']}"
    settings.PG_VECTOR_DB_URL = url
    rag_db.create_chunk_table(rag_db.get_pg_engine())
    # rag_chunks is not a Django model, so the test database flush doesn't clear it.
    with rag_db.get_vector_engine().begin() as conn:
        conn.execute(sqlalchemy.text("DELETE FROM rag_chunks"))
    return url


@pytest.fixture
def fake_rag_embeddings(mocker):
    mocker.patch.object(rag_db, "get_rag_embeddings", lambda: DeterministicFakeEmbedding(size=1536))


class ScriptedLLM:
    """FIFO-scripted chat model: str replies for invoke(), pydantic objects for structured output."""

    def __init__(self, *replies):
        self.replies = list(replies)
        self.calls = []

    def _pop(self, messages, expect_str):
        self.calls.append(messages)
        assert self.replies, "ScriptedLLM queue is empty"
        reply = self.replies.pop(0)
        assert isinstance(reply, str) == expect_str, f"wrong reply kind for this call: {reply!r}"
        return reply

    def invoke(self, messages):
        return AIMessage(content=self._pop(messages, True))

    def with_structured_output(self, schema):
        outer = self

        class _Structured:
            def invoke(self, messages):
                reply = outer._pop(messages, False)
                assert isinstance(reply, schema), f"expected {schema.__name__}, got {reply!r}"
                return reply

        return _Structured()
