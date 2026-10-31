import pytest
import sqlalchemy
from langchain_core.documents import Document

from adey_apps.rag import db as rag_db
from adey_apps.rag.consumers import ChatConsumer
from adey_apps.rag.models import Message
from adey_apps.rag.passes import PassResult

PG_URL = "postgres://adey:secret@db.example.com:5432/adey?sslmode=require"


# --- unit tests (no database needed) -----------------------------------------


@pytest.mark.parametrize("url, expected", [
    ("postgres://u:p@h:5432/d?sslmode=require", "postgresql://u:p@h:5432/d?sslmode=require"),
    ("postgresql://u:p@h:5432/d", "postgresql://u:p@h:5432/d"),
    ("postgresql+psycopg2://u:p@h/d", "postgresql+psycopg2://u:p@h/d"),
])
def test_sqlalchemy_url_normalizes_postgres_scheme(url, expected):
    assert rag_db._sqlalchemy_url(url) == expected


def test_get_vector_engine_is_created_once_with_pool_settings(settings, mocker):
    settings.PG_VECTOR_DB_URL = PG_URL
    settings.PG_VECTOR_POOL_SIZE = 4
    settings.PG_VECTOR_POOL_MAX_OVERFLOW = 1
    create_engine = mocker.patch.object(rag_db.sqlalchemy, "create_engine")

    assert rag_db.get_vector_engine() is rag_db.get_vector_engine()

    create_engine.assert_called_once_with(
        "postgresql://adey:secret@db.example.com:5432/adey?sslmode=require",
        pool_size=4,
        max_overflow=1,
        pool_pre_ping=True,
        pool_recycle=300,
    )


# --- consumer ----------------------------------------------------------------


@pytest.fixture
def consumer(settings, chat, mocker):
    settings.FRONTEND_URLS = ["http://localhost:3000"]
    consumer = ChatConsumer()
    consumer.scope = {
        "headers": [
            (b"cookie", b"user_session_id=session-1"),
            (b"origin", b"http://localhost:3000"),
        ],
        "url_route": {"kwargs": {"chat_id": str(chat.identifier)}},
    }
    mocker.patch.object(consumer, "accept")
    mocker.patch.object(consumer, "send_json")
    mocker.patch("adey_apps.rag.consumers.has_chat_request_permission", return_value=True)
    return consumer


@pytest.mark.django_db
def test_consumer_connect_does_not_answer(consumer, mocker):
    answer = mocker.patch("adey_apps.rag.consumers.answer")

    consumer.connect()

    consumer.accept.assert_called_once()
    answer.assert_not_called()


@pytest.mark.django_db
def test_consumer_answers_message_and_sends_sources(consumer, chat, mocker):
    sources = [{"title": "T", "page": 2}]
    answer = mocker.patch("adey_apps.rag.consumers.answer", return_value=PassResult("answer", sources))
    consumer.connect()

    consumer.receive_json({"type": "message", "message": "hi"})

    answer.assert_called_once_with(chat, "session-1", "hi")
    consumer.send_json.assert_called_with(
        {"type": "message", "message_type": "AI", "message": "answer", "sources": sources}
    )
    assert Message.objects.filter(chat=chat, session_id="session-1", message="answer").count() == 1


@pytest.mark.django_db
def test_consumer_does_not_answer_when_quota_is_exceeded(consumer, mocker):
    mocker.patch("adey_apps.rag.consumers.has_chat_request_permission", return_value=False)
    answer = mocker.patch("adey_apps.rag.consumers.answer")
    mocker.patch.object(consumer, "close")
    consumer.connect()

    consumer.receive_json({"type": "message", "message": "hi"})

    consumer.close.assert_called_once()
    answer.assert_not_called()


# --- integration tests (need a Postgres with the pgvector extension) ---------


@pytest.mark.parametrize("url, expected", [
    ("postgres://u:p@h:5432/d?sslmode=require", "postgresql+psycopg://u:p@h:5432/d?sslmode=require"),
    ("postgresql://u:p@h/d", "postgresql+psycopg://u:p@h/d"),
])
def test_async_url_uses_psycopg_driver(url, expected):
    assert rag_db._async_url(url) == expected


def test_create_chunk_table_is_idempotent(pg_vector_db):
    rag_db.create_chunk_table(rag_db.get_pg_engine())
    rag_db.create_chunk_table(rag_db.get_pg_engine())
    with rag_db.get_vector_engine().connect() as connection:
        columns = set(connection.execute(sqlalchemy.text(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'rag_chunks'"
        )).scalars())
        indexes = set(connection.execute(sqlalchemy.text(
            "SELECT indexname FROM pg_indexes WHERE tablename = 'rag_chunks'"
        )).scalars())
    assert {"langchain_id", "content", "embedding", "chat_id", "content_tsv", "langchain_metadata"} <= columns
    assert {"rag_chunks_content_tsv_idx", "rag_chunks_chat_id_idx"} <= indexes


def test_chunk_store_round_trip_and_delete_by_chat(pg_vector_db, fake_rag_embeddings):
    store = rag_db.get_chunk_store()
    store.add_documents(
        [Document(page_content="alpha", metadata={"chat_id": "a", "title": "A"}),
         Document(page_content="beta", metadata={"chat_id": "b", "title": "B"})],
        ids=["a:1", "b:1"],
    )
    [doc] = store.similarity_search("alpha", k=5, filter={"chat_id": "a"})
    assert (doc.id, doc.page_content, doc.metadata["title"]) == ("a:1", "alpha", "A")
    rag_db.delete_chat_chunks("a")
    assert store.similarity_search("alpha", k=5, filter={"chat_id": "a"}) == []
    assert len(store.similarity_search("beta", k=5, filter={"chat_id": "b"})) == 1


def test_get_pg_engine_disables_prepared_statements(settings, mocker):
    settings.PG_VECTOR_DB_URL = "postgresql://u:p@h/d"
    rag_db.get_pg_engine.cache_clear()
    mock = mocker.patch.object(rag_db.PGEngine, "from_connection_string")
    try:
        rag_db.get_pg_engine()
    finally:
        rag_db.get_pg_engine.cache_clear()
    assert mock.call_args.kwargs["connect_args"] == {"prepare_threshold": None}
