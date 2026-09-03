from langchain.agents import create_agent 
from agent.memory.short import get_checkpointer
from langchain_openai import ChatOpenAI
from agent.tools.retriever import retrieve_context
from agent.tools.run_sql import run_sql
import os
from dataclasses import dataclass
from langgraph.graph.state import CompiledStateGraph
from langchain.agents.middleware.types import (
    AgentState,
    InputAgentState,
    OutputAgentState,
)
from typing import Any , Optional 
from langgraph.checkpoint.redis import AsyncRedisSaver

@dataclass
class Context: 
    tenant_id : str
    dense_schema : Optional[str]
    db_type : Optional[str]

from .middleware import ensure_dense_schema , add_dense_schema

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

def get_llm () -> ChatOpenAI :

    model = ChatOpenAI( model="deepseek-v4-pro" , api_key=DEEPSEEK_API_KEY , base_url="https://api.deepseek.com")

    return model

def get_agent( checkpointer : AsyncRedisSaver) -> CompiledStateGraph[AgentState[Any], Context, InputAgentState, OutputAgentState[Any]] : 

    model = get_llm()

    agent = create_agent(

        model, 
        tools=[retrieve_context , run_sql ],
        checkpointer=checkpointer,
        context_schema=Context,
        system_prompt="""

        You are an experienced database analyst , you take users query and turn them into meaningfull insights based on the dense schema and info you'll get from 
        retrieve_context tool and so on. I want you to understand user query and then fetch appropriate data using the retreive_context tool if needed, you just have to create appropriate search query to retrieve appropriate data. 

        Here is the set of rules you need to follow in order to create appropriate queries : 
        1. Write it as natural language.
        2. Keep it concise and clear.
        3. Include important entities and concepts (film, customer, rental, payment, store, category, actor, revenue, etc.).
        4. Prefer concrete terms that are likely to appear in schema descriptions.
        5. Avoid vague or filler words.
        6. Optimize for hybrid search (meaning + keyword matching).
        7. Generate only one high-quality query. Do not call the tool multiple times with variations. 

        Examples : 
        1) 

        Dense Schema Snippet:
        T:film | cols:15 | J: language
        T:rental | cols:8 | J: customer, inventory, staff
        T:payment | cols:7
        T:film_category | cols:3 | J: category, film
        
        User Query: Show me the best movies

        Search Query: how to rank films by popularity rental count or revenue

        2) 
        Dense Schema Snippet:
        T:customer | cols:11 | J: address, store
        T:payment | cols:7
        T:rental | cols:8 | J: customer, inventory, staff
        
        User Query: Who are the top customers?

        Search Query: customers with the highest total payments or most rentals

        """, 
        middleware=[ensure_dense_schema , add_dense_schema ]

    )

    return agent

