from langchain.tools import tool , ToolRuntime
import json 
from pydantic import BaseModel , Field 
from typing import List
from enum import Enum
from agent.context import Context
from agent.memory.long import mem0

class Search_Db_Facts(BaseModel):
    
    query : str = Field(description=(
        "Natural-language query describing the schema knowledge you need. "
        "Be specific: mention table names, column names, relationships, or "
        "the concept you're trying to map. "
        "Examples: 'which column stores weather conditions', "
        "'how to join signals to observatories', 'meaning of snrratio'"))

@tool(args_schema=Search_Db_Facts) 
def search_db_facts ( query : str , runtime : ToolRuntime[Context] ):

    """Search long-term database facts (schema knowledge, join paths, column meanings,
    null-handling rules, naming conventions) stored from previous conversations.
    Call this before retrieve_context to check if you already know the answer
    from past sessions. Returns memories ranked by relevance."""

    user_id , db_id = runtime.context.tenant_id.split("__" , 1)

    result = mem0.search(
        query,
        filters={
            "AND": [
                {"user_id": user_id},
                {"app_id": db_id},
                {"metadata": {"category": "db_fact"}}
            ]
        },
        top_k=5
    )

    return result