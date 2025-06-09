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
        """
        Given a keyword, return the top 3 most relevant document passages from the vectorstore.
        If matches are found, concatenate and return their text. If none, return 
        “No relevant context found for the provided keyword.”
        """
        result = vectorstore.similarity_search(keyword, k=3)
        if result:
            return '\n'.join([res.page_content for res in result])
        else:
            return "No relevant context found for the provided keyword."
        
    return lookup_context

@tool
def escalate_issue(issue: str, customer_name, customer_email) -> str:
    """Escalate an issue to the support team."""
    # Here you would implement the logic to escalate the issue, e.g., send an email or create a ticket.
    print(f"Escalating issue: {issue} for customer: {customer_name}, email: {customer_email}")
    return f"Issue '{issue}' has been escalated to the support team."