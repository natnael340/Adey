import openai
import importlib

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
from adey_apps.rag.constants import PROMPT_TEMPLATE, PROMPT_TEMPLATE_V2
from adey_apps.rag.tools import escalate_issue

openai.api_key = settings.OPENAI_API_KEY


class Agent:
    def __init__(self, chat: Chat):
        self.chat = chat
        self.tools = self.get_tools()

        self.prompt = PromptTemplate(
            template=PROMPT_TEMPLATE_V2, 
            input_variables=["company_name", "assistant_name"]
        )
    
    def get_db_from_collection(self):
        return PGVector(
            collection_name=force_str(self.chat.identifier),
            connection_string=settings.PG_VECTOR_DB_URL,
            embedding_function=OpenAIEmbeddings()
        )

    def get_tools(self):
        tools = []
        module = importlib.import_module(settings.AGENT_TOOL_PATH)
        for agent_tool in self.chat.tools.all().filter(is_active=True):
            tool_function = getattr(module, agent_tool.tool_path)
            tools.append(tool_function(self.chat, agent_tool))

        
        return tools + [escalate_issue]


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