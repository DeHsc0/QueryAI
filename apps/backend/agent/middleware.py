from langchain.agents.middleware import dynamic_prompt , before_agent 
from langgraph.runtime import Runtime
from langchain.agents.middleware.types import AgentState , ModelRequest
from langchain.messages import SystemMessage
from .init import Context
from db.models import UserDatabases , engine
from db.dependency import get_db
from fastapi import Depends
from sqlmodel import Session , select
from lib.config import get_redis_client
import json

@before_agent
async def ensure_context_caching ( state : AgentState , runtime : Runtime[Context] ): 

    cache_key = f"dense_schema:{runtime.context.tenant_id}"

    user_id , db_id = runtime.context.tenant_id.split("__" , 1)

    redis = get_redis_client()

    cached = redis.getex(cache_key)

    if cached:

        cached_data = json.loads(cached)

        encrypted_creds = cached_data.get("encrypted_creds")
        dense_schema = cached_data.get("dense_schema")
        db_type = cached_data.get("db_type")

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

        data = { "dense_schema" : user_database.dense_schema , "encrypted_creds" : user_database.encrypted_creds , "db_type" : user_database.database_soft}

        redis.setex(cache_key , 3600 , json.dumps(data) )

        runtime.context.db_type = user_database.database_soft
        runtime.context.dense_schema = user_database.dense_schema
        runtime.context.encrypted_creds = user_database.encrypted_creds    

    return None

@dynamic_prompt
def add_dense_schema ( req : ModelRequest ) -> str :

    dense_schema = req.runtime.context.dense_schema
    db_type = req.runtime.context.db_type

    return f"{req.system_prompt} \n Database Software : {db_type} \n Dense Schema :\n {dense_schema}"




