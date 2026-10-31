import pytest
import sqlalchemy
from langchain_core.documents import Document
from langchain_core.embeddings import DeterministicFakeEmbedding
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langchain_core.messages import AIMessage
from psycopg.rows import dict_row

from adey_apps.rag import db as rag_db
from adey_apps.rag.consumers import ChatConsumer
from adey_apps.rag.models import Message
from adey_apps.rag.passes import PassResult
from adey_apps.rag.workflow import AgentWorkflow

PG_URL = "postgres://adey:secret@db.example.com:5432/adey?sslmode=require"


class FakeChatModel(GenericFakeChatModel):
    def bind_tools(self, tools, **kwargs):
        return self


def fake_model(*replies):
    return FakeChatModel(messages=iter([AIMessage(content=reply) for reply in replies]))


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


def test_get_vectorstore_shares_engine_and_skips_extension_creation(settings, mocker):
    settings.PG_VECTOR_DB_URL = PG_URL
    engine = mocker.patch.object(rag_db.sqlalchemy, "create_engine").return_value
    mocker.patch.object(rag_db, "OpenAIEmbeddings")
    pgvector = mocker.patch.object(rag_db, "PGVector")

    store_a = rag_db.get_vectorstore("collection-a")
    assert rag_db.get_vectorstore("collection-a") is store_a
    rag_db.get_vectorstore("collection-b")

    assert rag_db.sqlalchemy.create_engine.call_count == 1
    assert pgvector.call_count == 2
    assert rag_db.OpenAIEmbeddings.call_count == 1
    for call, name in zip(pgvector.call_args_list, ["collection-a", "collection-b"]):
        assert call.kwargs["connection"] is engine
        assert call.kwargs["create_extension"] is False
        assert call.kwargs["collection_name"] == name


def test_delete_vector_collection_invalidates_cached_store(settings, mocker):
    settings.PG_VECTOR_DB_URL = PG_URL
    engine = mocker.patch.object(rag_db, "get_vector_engine")
    connection = engine.return_value.begin.return_value.__enter__.return_value
    connection.execute.return_value.scalar_one_or_none.side_effect = ["table", "collection-id"]
    mocker.patch.object(rag_db, "OpenAIEmbeddings")
    pgvector = mocker.patch.object(rag_db, "PGVector", side_effect=[object(), object()])

    first_store = rag_db.get_vectorstore("collection-a")
    rag_db.delete_vector_collection("collection-a")
    second_store = rag_db.get_vectorstore("collection-a")

    assert first_store is not second_store
    assert pgvector.call_count == 2


def test_get_vectorstore_normalizes_uuid_cache_key(settings, mocker):
    from uuid import UUID

    settings.PG_VECTOR_DB_URL = PG_URL
    mocker.patch.object(rag_db, "get_vector_engine")
    mocker.patch.object(rag_db, "OpenAIEmbeddings")
    pgvector = mocker.patch.object(rag_db, "PGVector")
    identifier = UUID("12345678-1234-5678-1234-567812345678")

    assert rag_db.get_vectorstore(identifier) is rag_db.get_vectorstore(str(identifier))
    pgvector.assert_called_once()


def test_checkpointer_pool_is_shared_and_pooler_safe(settings, mocker):
    settings.PG_VECTOR_DB_URL = PG_URL
    settings.CHECKPOINTER_POOL_SIZE = 2
    connection_pool = mocker.patch.object(rag_db, "ConnectionPool")
    postgres_saver = mocker.patch.object(rag_db, "PostgresSaver")

    rag_db.get_checkpointer()
    rag_db.get_checkpointer()

    connection_pool.assert_called_once()
    pool_kwargs = connection_pool.call_args.kwargs
    # The URL is passed through untouched, so its sslmode applies.
    assert pool_kwargs["conninfo"] == PG_URL
    assert pool_kwargs["max_size"] == 2
    assert pool_kwargs["check"] is connection_pool.check_connection
    assert pool_kwargs["kwargs"] == {
        "autocommit": True,
        "prepare_threshold": None,
        "row_factory": dict_row,
    }
    assert postgres_saver.call_count == 2
    postgres_saver.assert_called_with(connection_pool.return_value)


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


def test_vectorstore_add_and_search_through_shared_engine(pg_vector_db, mocker):
    mocker.patch.object(rag_db, "OpenAIEmbeddings", lambda: DeterministicFakeEmbedding(size=1536))

    writer = rag_db.get_vectorstore("integration-collection")
    writer.add_texts(["alpha doc", "beta doc", "gamma doc"])
    reader = rag_db.get_vectorstore("integration-collection")

    assert reader._bind is writer._bind
    results = reader.similarity_search("beta doc", k=1)
    assert [doc.page_content for doc in results] == ["beta doc"]


def test_checkpointer_persists_history_per_session(pg_vector_db):
    rag_db.get_checkpointer().setup()
    model = fake_model("reply 1", "reply 2", "other reply")

    def ask(question, session):
        workflow = AgentWorkflow(model=model, tools=[], prompt_template="system", saver=rag_db.get_checkpointer())
        for step in workflow.run(inputs=question, session_key=session):
            pass
        return [message.content for message in step["messages"]]

    ask("first", "session-a")
    assert ask("second", "session-a") == ["first", "reply 1", "second", "reply 2"]
    assert ask("unrelated", "session-b") == ["unrelated", "other reply"]


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
