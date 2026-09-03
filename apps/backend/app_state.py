from langchain.agents.middleware.types import (
    AgentState,
    InputAgentState,
    OutputAgentState,
)
from langgraph.graph.state import CompiledStateGraph
from typing import Any , Dict
from agent.init import Context
from dataclasses import dataclass
from langgraph.checkpoint.redis import AsyncRedisSaver


@dataclass
class AppState: 
    agent : CompiledStateGraph[AgentState[Any], Context, InputAgentState, OutputAgentState[Any]]
    checkpointer : AsyncRedisSaver