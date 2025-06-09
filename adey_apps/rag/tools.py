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
        Search your document index for the given keyword and return up to
        the top 3 most relevant passages as plain text. If no matches are found,
        returns: "No relevant context found for the provided keyword."
        :args
        :keyword: The term or phrase to search for.

        :returns: Either the concatenated top-3 passages, or the no-context message.

        examples:
        user: can you tell me about xyz?
        AI: lookup_context("xyz")
        tool: Xyz is a product we ...
        AI: Xyz is a product we ...

        user: can you tell me about abc?
        AI: lookup_context("abc")
        tool: No relevant context found for the provided keyword.
        AI: I don't have information on that subject.
        """
        result = vectorstore.similarity_search(keyword, k=3)
        if result:
            return '\n'.join([res.page_content for res in result])
        else:
            return "No relevant context found for the provided keyword."
        
    return lookup_context


def prepare_calendar_tool(char, user):
    """Prepare the calendar tool for the given chat."""
    # Here you would implement the logic to prepare the calendar tool, e.g., fetching events or scheduling.
    
    @tool
    def get_calendar_events(date: str) -> str:
        """Retrieve calendar events for a specific date."""
        # This is a placeholder implementation.
        print(f"Fetching calendar events for {date} for user {user}.")
        return f"Events for {date}: [Event1, Event2, Event3]"
    
    return get_calendar_events

@tool
def escalate_issue(issue: str, customer_name, customer_email) -> str:
    """Escalate an issue to the support team."""
    # Here you would implement the logic to escalate the issue, e.g., send an email or create a ticket.
    print(f"Escalating issue: {issue} for customer: {customer_name}, email: {customer_email}")
    return f"Issue '{issue}' has been escalated to the support team."