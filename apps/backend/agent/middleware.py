from langchain.agents.middleware import dynamic_prompt , before_agent , after_agent , ModelRequest , ModelResponse
from langgraph.runtime import Runtime
from langchain.agents.middleware.types import AgentState , ModelRequest
from langchain.messages import SystemMessage , AIMessage , HumanMessage , ToolMessage , AnyMessage
from .context import Context
from db.models import UserDatabases , engine
from db.dependency import get_db
from fastapi import Depends
from sqlmodel import Session , select
from lib.config import get_redis_client
import json
from task_queue.tasks import memory_write
from typing import Callable
from pydantic import BaseModel

@dynamic_prompt
def add_dense_schema ( req : ModelRequest ) -> str :

    dense_schema = req.runtime.context.dense_schema
    db_type = req.runtime.context.db_type
    
    return f"{req.system_prompt} \n Database Software : {db_type} \n Dense Schema :\n {dense_schema}"




