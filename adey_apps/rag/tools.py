from langchain.tools import tool

from adey_apps.rag.db import get_vectorstore



def prepare_rag_tool(chat, agent_tool):
    """Prepare the RAG tool for the given chat."""
    vectorstore = get_vectorstore(chat.identifier)

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