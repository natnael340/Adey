from django.conf import settings

import openai
from langchain.vectorstores.pgvector import PGVector
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.llms.openai import OpenAI
from django.utils.encoding import force_str
from urllib.parse import urlparse, parse_qsl, unquote_plus

from adey_apps.rag.models import Chat

openai.api_key = settings.OPENAI_API_KEY


def get_db_from_collection(collection_name: str):
    return PGVector(
        collection_name=collection_name,
        connection_string=settings.PG_VECTOR_DB_URL,
        embedding_function=OpenAIEmbeddings()
    )


def query_chat_vector_db(chat: Chat, query: str) -> str:
    db = get_db_from_collection(force_str(chat.identifier))
    retriever = db.as_retriever(search_kwargs={'k': 3})
    # retriever.get_relevant_documents(query)
    qa = RetrievalQA.from_chain_type(llm=OpenAI(), chain_type="stuff", retriever=retriever)
    return qa.run(query)


class Url(object):
    def __init__(self, url) -> None:
        parts = urlparse(url)
        _query = frozenset(parse_qsl(parts.query))
        _path = unquote_plus(parts.path)
        parts = parts._replace(query=_query, path=_path)
        self.parts = parts
    def __eq__(self, other):
        return self.parts == other.parts
    def __hash__(self):
        return hash(self.parts)


def key_value_to_dict(value) -> dict:
    return dict(
        item.strip().split("=") for item in value.split(";")
    )