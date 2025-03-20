import requests

from django.conf import settings

import openai
from langchain_community.vectorstores import PGVector
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_core.documents import Document
from langchain.chains import RetrievalQA
from langchain_community.llms import OpenAI
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


class URLTextLoader:
    """
    A class to load text data from a specified URL.

    Attributes:
        url (str): The URL from which to load the text.

    Methods:
        load(): Fetches and returns the text from the URL.
    """
    def __init__(self, url):
        """
        Constructs all the necessary attributes for the URLTextLoader object.

        Parameters:
            url (str): The URL from which to load the text.
        """
        self.url = url

    def load(self):
        """
        Fetches the text from the specified URL.

        Raises:
            HTTPError: An error occurs from the HTTP request.

        Returns:
            str: The text retrieved from the URL.
        """
        response = requests.get(self.url)
        response.raise_for_status()  # Will raise HTTPError for bad HTTP responses
        return [Document(page_content=response.text, metadata={"source": self.url})]
