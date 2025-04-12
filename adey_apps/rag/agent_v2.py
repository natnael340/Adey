import openai


from langchain_core.messages import SystemMessage
from langchain.tools import tool
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import PGVector
from langchain.prompts import PromptTemplate
from langchain.chat_models import init_chat_model
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.graph import END, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.prebuilt import create_react_agent
from adey_apps.rag.models import Chat
from django.utils.encoding import force_str
from django.conf import settings

openai.api_key = settings.OPENAI_API_KEY


class Agent:
    def __init__(self, chat: Chat):
        self.chat = chat
        self.tools = self.get_tools()
        PROMPT_TEMPLATE = (
            "Role Definition:\n"
            "You are a customer support agent for {company_name} called {assistant_name}.\n"
            "Behavior & Tone:\n"
            "Act as a knowledgeable, empathetic, and professional representative.\n"
            "Use clear, concise language and always maintain a friendly tone.\n"
            "Task Guidelines:\n"
            "Greet the customer warmly and ask for any missing details if their query is unclear.\n"
            "Provide accurate and short answers using the company’s knowledge base. At most 2 or 3 sentences\n"
            "If the query exceeds your scope (or involves complex issues), inform the customer and "
            "offer to connect them with a human support agent.\n"
            "If no relevant information is found in the knowledge base, apologize and ask if they have another question.\n\n"
            "Engagement Strategy:\n"
            "Always conclude your response with a follow-up question to ensure the customer feels heard"
            " and to maintain engagement.\n\n"
            "use the tool function to retrieve the knowledge base\n\n"
            "Important: All you know about is the retrieved information from the tool."
        )
        
        self.prompt = PromptTemplate(
            template=PROMPT_TEMPLATE, 
            input_variables=["context", "company_name", "assistant_name"]
        )
    
    def get_db_from_collection(self):
        return PGVector(
            collection_name=force_str(self.chat.identifier),
            connection_string=settings.PG_VECTOR_DB_URL,
            embedding_function=OpenAIEmbeddings()
        )

    def get_tools(self):
        vectorstore = self.get_db_from_collection()
        
        @tool
        def lookup_context(keyword: str) -> str:
            """Retrieve information related to a query."""
            result = vectorstore.similarity_search(keyword, k=3)
            if result:
                return '\n'.join([res.page_content for res in result])
            else:
                return "No relevant context found for the provided keyword."
            
        return [lookup_context]


    def setup_chain(self, user_session_id: str, new_chat: bool = False):
        self.user_session_id = user_session_id
        self.llm = init_chat_model("gpt-4o-mini", model_provider="openai")

        self.config = {"configurable": {"thread_id": user_session_id}}
        self.system_message_content = self.prompt.format(
            company_name=self.chat.business_name, 
            assistant_name=self.chat.assistant_name,
        )

    def query(self, question: str):
        if not self.llm:
            raise ValueError("Chain not initialized.")
        
        with PostgresSaver.from_conn_string(f"{settings.PG_VECTOR_DB_URL}?sslmode=disable") as memory:
            agent_executor = create_react_agent(self.llm, self.tools, prompt=self.system_message_content, checkpointer=memory)

            for step in agent_executor.stream(
                {"messages": [{"role": "user", "content": question}]},
                stream_mode="values",
                config=self.config, 
            ):
                step["messages"][-1].pretty_print()
    

        return step["messages"][-1].content