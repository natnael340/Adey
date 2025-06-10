from typing import (
    Annotated,
    Sequence,
    TypedDict,
)
from django.conf import settings
import json
from langchain_core.messages import ToolMessage, SystemMessage
from langchain_core.runnables import RunnableConfig
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.postgres import PostgresSaver


class State(TypedDict):
    """The state of the agent."""

    # add_messages is a reducer
    messages: Annotated[Sequence[BaseMessage], add_messages]



class AgentWorkflow:
    def __init__(self, model, tools, prompt_template: str, saver: PostgresSaver = None):
        self.model = model.bind_tools(tools)
        self.prompt_template = prompt_template
        # map tool name → tool instance
        self.tools_by_name = {tool.name: tool for tool in tools}
        self.saver = saver
        self.graph = self.build_graph()
        
        print(f"Graph compiled with nodes: {self.graph.nodes.keys()}")

    
    def build_graph(self) -> StateGraph:
        graph = StateGraph(State)
        # add our two main nodes
        graph.add_node("agent", self.call_model)
        graph.add_node("tools", self.tool_node)
        # entrypoint
        graph.set_entry_point("agent")
        # conditional edge out of model
        graph.add_conditional_edges(
            "agent",
            self.should_continue,
            {"continue": "tools", "end": END},
        )
        # then back from tools → agent
        graph.add_edge("tools", "agent")
        print(f"Graph nodes: {graph.nodes.keys()}")
        return graph.compile(checkpointer=self.saver)
    
    def tool_node(self, state: State):
        outputs = []
        for tool_call in state["messages"][-1].tool_calls:
            result = self.tools_by_name[tool_call["name"]].invoke(tool_call["args"])
            outputs.append(
                ToolMessage(
                    content=json.dumps(result),
                    name=tool_call["name"],
                    tool_call_id=tool_call["id"],
                )
            )
        return {"messages": outputs}
    
    def call_model(self, state: State, config: RunnableConfig):
        # prepare system prompt + history
        system_prompt = {"role": "system", "content": self.prompt_template}
        response = self.model.invoke([system_prompt] + state["messages"], config)
        return {"messages": [response]}
    
    def should_continue(self, state: State) -> str:
        last = state["messages"][-1]
        return "continue" if last.tool_calls else "end"
    
    def run(self, inputs: str, session_key: str):
        print(f"Running agent workflow with inputs: {inputs} and session_key: {session_key}")
        # Seed the graph's state
        return self.graph.stream(
            {"messages": {"role":"user", "content": inputs}}, 
            {"configurable": {"thread_id": session_key}}, 
            stream_mode="values"
        )