from langchain.agents import create_agent 
from agent.memory.short import get_checkpointer
from langchain_openai import ChatOpenAI
from agent.tools.retriever import retrieve_context
from agent.tools.test import test_tool
import os
from dataclasses import dataclass
from langgraph.graph.state import CompiledStateGraph
from langchain.agents.middleware.types import (
    AgentState,
    InputAgentState,
    OutputAgentState,
)
from typing import Any 
from langgraph.checkpoint.redis import RedisSaver

@dataclass
class Context: 
    tenant_id : str

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

def get_llm () -> ChatOpenAI :

    model = ChatOpenAI( model="deepseek-v4-pro" , api_key=DEEPSEEK_API_KEY , base_url="https://api.deepseek.com")

    return model

def get_agent( checkpointer : RedisSaver) -> CompiledStateGraph[AgentState[Any], Context, InputAgentState, OutputAgentState[Any]] : 

    model = get_llm()

    agent = create_agent(

        model, 
        tools=[retrieve_context , test_tool],
        checkpointer=checkpointer,
        context_schema=Context,
        system_prompt="Do as user says"

    )

    return agent

