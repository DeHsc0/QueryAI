from langchain.agents.middleware.types import (
    AgentState,
    InputAgentState,
    OutputAgentState,
)
from langgraph.graph.state import CompiledStateGraph
from typing import Any 
from agent.init import Context
from dataclasses import dataclass
from langgraph.checkpoint.redis import RedisSaver

@dataclass
class AppState: 
     agent : CompiledStateGraph[AgentState[Any], Context, InputAgentState, OutputAgentState[Any]]
     checkpointer : RedisSaver