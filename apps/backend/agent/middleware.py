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

@before_agent(can_jump_to=["end"])
async def ensure_context_caching ( state : AgentState , runtime : Runtime[Context] ): 

    user_id , db_id = runtime.context.tenant_id.split("__" , 1)

    cache_key = f"dense_schema:{user_id}:{db_id}"

    redis = get_redis_client()

    cached = redis.json().get(cache_key , "$")

    if cached:

        encrypted_creds = cached[0].get("encrypted_creds")
        dense_schema = cached[0].get("dense_schema")
        db_type = cached[0].get("db_type")

        if encrypted_creds and dense_schema and db_type: 

            runtime.context.db_type = db_type
            runtime.context.dense_schema = dense_schema
            runtime.context.encrypted_creds = encrypted_creds                

        return None 

    with Session(engine) as db: 

        user_database = db.exec(

            select(UserDatabases).where(

                UserDatabases.id == db_id, 
                UserDatabases.user_clerk_id == user_id

            )

        ).first()

        if user_database is None: 
            return {
            "messages": [AIMessage("Conversation limit reached.")],
            "jump_to": "end"
        }

        data = { "dense_schema" : user_database.dense_schema , "encrypted_creds" : user_database.encrypted_creds , "db_type" : user_database.database_soft}

        
        redis.json().set(cache_key , "$" , data )

        redis.expire( cache_key , 60 * 60 * 2 )

        runtime.context.db_type = user_database.database_soft
        runtime.context.dense_schema = user_database.dense_schema
        runtime.context.encrypted_creds = user_database.encrypted_creds    

    return None


@dynamic_prompt
def add_dense_schema ( req : ModelRequest ) -> str :

    dense_schema = req.runtime.context.dense_schema
    db_type = req.runtime.context.db_type
    
    return f"{req.system_prompt} \n Database Software : {db_type} \n Dense Schema :\n {dense_schema}"




