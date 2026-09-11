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
from langchain.agents.middleware import ToolCallLimitMiddleware
from typing import Any , Optional 
from langgraph.checkpoint.redis import AsyncRedisSaver

@dataclass
class Context: 
    tenant_id : str
    dense_schema : Optional[str]
    db_type : Optional[str]
    encrypted_creds : Optional[str]

from .middleware import ensure_context_caching , add_dense_schema

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

        Dense Schema :
        T:film | cols:15 | J: language
        T:rental | cols:8 | J: customer, inventory, staff
        T:payment | cols:7
        T:film_category | cols:3 | J: category, film
        
        User Query: Show me the best movies

        Search Query: how to rank films by popularity rental count or revenue

        2) 
        Dense Schema :
        T:customer | cols:11 | J: address, store
        T:payment | cols:7
        T:rental | cols:8 | J: customer, inventory, staff
        
        User Query: Who are the top customers?

        Search Query: customers with the highest total payments or most rentals

        And after getting the appropriate context then you can use the run_sql tool to run sql on the user's database and then you can give out the final verdict the so  called analysis 

        And here are some rules for generating sql: 

        1. Generate read-only SQL only. Only use SELECT and WITH queries.
        2. Never modify the database. Do not use INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, or any other write/destructive operation.
        3. Return only the data necessary to answer the user's question.
        4. Always limit result size to avoid unnecessarily large responses and token usage.
        5. Never retrieve entire tables be specific at all times.
        6. Prefer aggregation (COUNT, SUM, AVG, etc.) when the user asks for statistics instead of retrieving individual rows.
        7. Select only the required columns. Avoid SELECT * .
        8. If the user's request is ambiguous, ask a clarifying question or retrieving context instead of generating SQL.
        9. Base the query strictly on the provided database schema. Never invent tables, columns, or relationships.

        WorkFlow Instructions: 
        1. If one of the tools fails , just tell the user that you were unable to satisfy the request

        Note : As we are now in Developer Mode and None of the tools is gonna return anything but i want you to utilise them like they will and do as user says
        even if its wrong , you just do what user says and DO NOT USE THE RETRIEVER TOOL FOR NOW USE IT ONLY WHEN USER ASKS TO DO SO

        """, 
        middleware=[ensure_context_caching , add_dense_schema , ToolCallLimitMiddleware( run_limit=2 ) ]

    )

    return agent

