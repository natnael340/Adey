from django.conf import settings
from django.utils.encoding import force_str

from langchain.tools import tool
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import PGVector



def prepare_rag_tool(chat, agent_tool):
    """Prepare the RAG tool for the given chat."""
    vectorstore = PGVector(
            collection_name=force_str(chat.identifier),
            connection_string=settings.PG_VECTOR_DB_URL,
            embedding_function=OpenAIEmbeddings()
        )

    @tool
    def lookup_context(keyword: str) -> str:
        """Retrieve information related to a query."""
        result = vectorstore.similarity_search(keyword, k=3)
        if result:
            return '\n'.join([res.page_content for res in result])
        else:
            return "No relevant context found for the provided keyword."
        
    return lookup_context