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

@before_agent
async def ensure_dense_schema ( state : AgentState , runtime : Runtime[Context] ): 


    cache_key = f"dense_schema:{runtime.context.tenant_id}"

    user_id , db_id = runtime.context.tenant_id.split("__" , 1)

    redis = get_redis_client()

    cached = redis.getex(cache_key)

    if cached:

        print("Taking in from the cache")

        print("TTL : " , redis.ttl(cache_key))
        
        runtime.context.dense_schema = cached

        return None 

    with Session(engine) as db: 

        dense_schema = db.exec(

            select(UserDatabases).where(

                UserDatabases.id == db_id, 
                UserDatabases.user_clerk_id == user_id

            )

        ).first()

    redis.setex(cache_key , 3600 , dense_schema.dense_schema )

    runtime.context.dense_schema = dense_schema.dense_schema    

    return None

@dynamic_prompt
def add_dense_schema ( req : ModelRequest ) -> str :

    dense_schema = req.runtime.context.dense_schema

    return f"{req.system_prompt} \n {dense_schema}"




