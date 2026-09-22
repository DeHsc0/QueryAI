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
from langchain.agents.middleware import ToolCallLimitMiddleware , TodoListMiddleware
from typing import Any , Optional 
from langgraph.checkpoint.redis import AsyncRedisSaver , RedisSaver

@dataclass
class Context: 
    tenant_id : str
    dense_schema : Optional[str]
    db_type : Optional[str]
    encrypted_creds : Optional[str]

from .middleware import ensure_context_caching , add_dense_schema

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

def get_llm (model_name : str = "deepseek-v4-pro") -> ChatOpenAI :

    model = ChatOpenAI( model=model_name , api_key=DEEPSEEK_API_KEY , base_url="https://api.deepseek.com")

    return model

def get_agent( checkpointer : AsyncRedisSaver | RedisSaver) -> CompiledStateGraph[AgentState[Any], Context, InputAgentState, OutputAgentState[Any]] : 

    def custom_tool_error( exc : Exception) -> str :

        if "limit" in str(exc).lower() or isinstance(exc, ValueError):

            return "Custom message: You have reached the maximum allowed tool calls for this session. Please try a different approach. , This is a custom Message"

        return None


    model = get_llm()

    agent = create_agent(

        model, 
        tools=[retrieve_context , run_sql ],
        checkpointer=checkpointer,
        context_schema=Context,
        system_prompt="""

        You are an experienced data analyst , you take users query and turn them into meaningfull insights based on the dense schema and info you'll get from 
        retrieve_context tool and so on. I want you to understand user query and then fetch appropriate data using the retreive_context tool if needed, you just have to create appropriate search query to retrieve appropriate data. 

        Here is the set of rules you need to follow in order to create appropriate queries for retrieve_context tool : 
        1. Write it as natural language.
        2. Keep it concise and clear.
        3. Include important entities and concepts .
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


        CRITICAL RULES FOR Tools:
        - You can Call retrieve_context AT MOST twice per user question and only in very very critical times you are allowed to call it but if you already got the appropriate context from the  first call then you cant call it again.
        - Use the returned schema + the dense schema already in this prompt to map user terms.
        - If a column name is not an exact match of the words from the user query, choose the closest semantic match and either proceed or ask for clarifying questions to the user. Do not search again.
        - Parallel tool calls are forbidden.
        - run_sql tool is for retrieving data for the final insight not for investigating context for the final query which will lead to the final insight.
        - Ask clarifying questions if you are not sure wether you have the appropirate context to answer the question asked by the user 
        
        Protocol to follow if you hit tool call limit 
        There can be multiple reason why you hit the tool call limit: 
        1. If you lacked context and kept calling tools to retrieve context then ask user for clarifying questions 
        2. you had the context but were not able to run the final query on the user's database then just tell the user about the what you understood about the question you dont have to much verbose about it and ask for user approval to proceed and get user the insight. 


        And here are some rules for generating sql: 

        1. Generate read-only SQL only. Only use SELECT and WITH queries.
        2. Never modify the database. Do not use INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, or any other write/destructive operation.
        3. Return only the data necessary to answer the user's question.
        4. Always limit result size to avoid unnecessarily large responses and token usage.
        5. Never retrieve entire tables be specific at all times.
        6. Prefer aggregation (COUNT, SUM, AVG, etc.) when the user asks for statistics instead of retrieving individual rows.
        7. Select only the required columns. Avoid SELECT * .
        8. If the user's request is ambiguous, ask a clarifying question or retrieving context instead of generating SQL.
        9. Base the query strictly on the provided database schema and database type. Never invent tables, columns, or relationships.

        A bit more Context: 
        - So user's query could be very unrelated to the database , user can throw ackronymns , abbrevations or something else. so in such cases dont just start looking for context from the tools , you should ask for clarifying questions so that you know exactly what to look for , what the user actually needs and so on.

        Example : 
        User Query : Classify signals by TOLS Category, and for each group, show the category name, signal count, average Bandwidth-to-Frequency Ratio, and the standard deviation of the anomaly score

        Scenario : You didnt find anything related to TOLS Category ot TOLS iteself

        Clarifying question to be asked : What do you mean TOLS because i didnt find anything related to it in the database.

        """, 
        middleware=[ensure_context_caching , add_dense_schema , ToolCallLimitMiddleware( run_limit=4 )]

    )

    return agent

