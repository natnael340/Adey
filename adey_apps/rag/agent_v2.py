import openai
import importlib

from langchain_core.messages import SystemMessage
from langchain.tools import tool
from langchain.prompts import PromptTemplate
from langchain.chat_models import init_chat_model
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from adey_apps.rag.models import Chat
from django.conf import settings
from adey_apps.rag.constants import PROMPT_TEMPLATE_V2
from adey_apps.rag.workflow import AgentWorkflow
from adey_apps.rag.db import get_checkpointer

openai.api_key = settings.OPENAI_API_KEY


class Agent:
    def __init__(self, chat: Chat):
        self.chat = chat
        self.tools = self.get_tools()

        self.prompt = PromptTemplate(
            template=PROMPT_TEMPLATE_V2, 
            input_variables=["company_name", "assistant_name"]
        )
        self.system_message =  self.prompt.format(
            company_name=self.chat.business_name, 
            assistant_name=self.chat.assistant_name,
        )

        self.model = ChatOpenAI(model="gpt-4o-mini")
    

    def get_tools(self):
        tools = []
        module = importlib.import_module(settings.AGENT_TOOL_PATH)
        for agent_tool in self.chat.tools.all().filter(is_active=True):
            tool_function = getattr(module, agent_tool.tool_path)
            tools.append(tool_function(self.chat, agent_tool))
                       
        return tools

    def setup_chain(self, user_session_id: str, new_chat: bool = False):
        self.user_session_id = user_session_id
        self.llm = init_chat_model("gpt-4o-mini", model_provider="openai")

        self.config = {"configurable": {"thread_id": user_session_id}}
        self.system_message_content = self.prompt.format(
            company_name=self.chat.business_name, 
            assistant_name=self.chat.assistant_name,
        )

    def _query(self, question: str):
        if not self.llm:
            raise ValueError("Chain not initialized.")
        
        agent_executor = create_react_agent(self.llm, self.tools, prompt=self.system_message_content, checkpointer=get_checkpointer())

        for step in agent_executor.stream(
            {"messages": [{"role": "user", "content": question}]},
            stream_mode="values",
            config=self.config, 
        ):
            step["messages"][-1].pretty_print()

        return step["messages"][-1].content
    
    def query(self, question: str, session_id: str):
        if not self.model:
            raise ValueError("Chain not initialized.")
        
        agent = AgentWorkflow(
            model=self.model, 
            tools=self.tools, 
            prompt_template=self.system_message, 
            saver=get_checkpointer(),
        )

        for step in agent.run(inputs=question, session_key=session_id):
            step["messages"][-1].pretty_print()
        
        return step["messages"][-1].content
