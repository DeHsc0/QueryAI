from langchain.agents.middleware import dynamic_prompt , ModelRequest , wrap_model_call 
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


@wrap_model_call
def disable_parallel_tool_calls(
    request: ModelRequest,
    handler,
):
    request.model_settings["parallel_tool_calls"] = False
    return handler(request)

@dynamic_prompt
def add_dense_schema ( req : ModelRequest ) -> str :

    dense_schema = req.runtime.context.dense_schema
    db_type = req.runtime.context.db_type
    user_prefs = req.runtime.context.user_prefs
    
    return f"{req.system_prompt} \n Database Software : {db_type} \n Dense Schema :\n {dense_schema} \n {f"Here are the User Preferences you should consider before answering: {user_prefs}" if user_prefs else "" }"