from fastapi import APIRouter , Request
from schemas import Chat
from fastapi.responses import JSONResponse 
from agent.init import get_llm
from langchain_core.messages import HumanMessage , AIMessage , ToolMessage , SystemMessage
from agent.init import Context
from app_state import AppState
from task_queue.tasks import insert_chats_in_db , Turn_data
from typing import  Any , List , Optional 
from dataclasses import dataclass
from sqlmodel import Session , select
from db.models import Conversations , Turns , UserDatabases 
from fastapi import Depends 
from db.dependency import get_db
from app_state import AppState
from langgraph.checkpoint.redis import AsyncRedisSaver
from lib.config import get_redis_client
import json 

@dataclass
class Tool_Call: 
    call_id : str 
    args : str
    tool_name : str 
    output : Optional[str]

router = APIRouter()

@router.post("/")
async def chat (req : Request , data : Chat , session : Session = Depends(get_db)):
    state : AppState = req.app.state

    user_id : str = req.state.clerk.get("sub")

    redis = get_redis_client()    

    db_data = None 

    recent_turns = None

    current_msg = []

    raw_db_data = redis.json().get(f"db_data:{user_id}:{data.db_id}")

    db_data = json.loads(raw_db_data) if raw_db_data else None 

    if not db_data: 

        try: 
            user_db = session.exec(
            
                select(UserDatabases).where(
        
                    UserDatabases.id == data.db_id, 
                    UserDatabases.user_clerk_id == user_id
        
            )
        
            ).first()

            if user_db is None:
                return JSONResponse(content={"message": "Database not found", "success": False}, status_code=404)
            
            db_data = { "encrypted_creds" : user_db.encrypted_creds , "dense_schema": user_db.dense_schema , "db_type" : user_db.database_soft }

            db_cache_key = f"db_data:{user_id}:{data.db_id}"

            redis = get_redis_client()      

            redis.json().set(db_cache_key , "$" , db_data)        

            redis.expire(f"db_data:{user_id}:{data.db_id}" , 60 * 60 * 2)

        except Exception as e:
            return JSONResponse(content={"message" : f"{e}" , "success" : False } , status_code=500)

    new_convo_id = None

    if not data.conversation_id:
        llm = get_llm() 
        
        message = [ 
    
            SystemMessage(
    
                content="""
    
                You are a conversation title generator.Your task is to generate a short, clear and 
                meaningfull title for the conversation based on the query passed on.
    
                Output Rules: 
                - Be concise ( 3 - 8 words concise )
                -  Focus on the user's goal rather than repeating the exact query.
                - If the query is ambiguous, infer the most likely intent and create a reasonable title.
    
                Examples 
                User: "Show me the total revenue generated last month"
                Title: Monthly Revenue Analysis
    
                User: "Which customers have made the most purchases this year?"
                Title: Top Customers Analysis
    
                User: "Find the products that are selling poorly and need attention"
                Title: Low Performing Products
    
                User: "Give me a breakdown of sales by region"
                Title: Regional Sales Breakdown
    
                User: "Can you tell me what needs improvement?"
                Title: Business Improvement Insights
    
                User: "Show me the important numbers from my data"
                Title: Key Business Metrics
    
                User: "Hey"
                Title: New Conversation
    
                User: "Hello"
                Title: New Conversation
    
                User: "Hi, can you help me?"
                Title: New Conversation
    
            """), 
            HumanMessage(content=data.query)
        ]
    
        title = llm.invoke( message , config={
    
            "configurable" : {
    
                "max_tokens" : 40
    
            }
    
        })
    
        conversation = Conversations(
            
            database_id=data.db_id,
            title=title.content
    
        )
        
        session.add(conversation)
    
        session.commit()
    
        session.refresh(conversation)

        new_convo_id = conversation.id 

        print("\n\n\n New Conversation Created :" , new_convo_id , "\n\n\n")

    else:

        t = await state.checkpointer.aget_tuple({"configurable": {"thread_id": str(data.conversation_id)}})
        messages = t.checkpoint["channel_values"].get("messages", []) if t else []

        if not messages:
            try:
                
                conversation = session.exec(
                    select(Conversations).where(
                        Conversations.id == data.conversation_id,
                        Conversations.database_id == data.db_id,
                    )
                ).first() 

                if not conversation:
                    return JSONResponse(
                        content={"message": "Conversation not found", "success": False},
                        status_code=404,
                    )

                turns = session.exec(
                    select(Turns)
                    .where(Turns.conversation_id == conversation.id)
                    .order_by(Turns.created_at.desc(), Turns.id.desc())
                    .limit(5)
                ).fetchall()

                recent_turns = [ turn for turn in turns ]

            except Exception as e: 
                return JSONResponse(content={"message" : e , "success" : False } , status_code=404)        

    if recent_turns:

        for turn in recent_turns:
            current_msg.append(AIMessage(content=turn.ai_response))
            current_msg.append(HumanMessage(content=turn.user_query))

        current_msg.reverse()

    current_msg.append(HumanMessage(content=data.query))

    agent = state.agent 

    tenant_id = f"{user_id}__{data.db_id}"

    config={

        "configurable" : {

            "thread_id" : f"{new_convo_id if new_convo_id else data.conversation_id  }"

            }
        }

    tool_calls : List[Tool_Call] = []

    agent_output = None

    try : 

        async for chunk in agent.astream( 

            {"messages" : current_msg}, 

            config=config,

            context=Context( tenant_id=tenant_id , dense_schema=db_data.get("dense_schema") , db_type=db_data.get("db_type") , encrypted_creds=db_data.get("encrypted_creds") , conversation_id=f"{new_convo_id if new_convo_id else data.conversation_id}"),

            version="v3", 

            stream_mode=["updates" , "messages" , "tasks"]

        ):

            chunk_type , chunk_data = chunk

            if chunk_type == "tasks" and chunk_data["name"] == "tools" and chunk_data.get("input") and chunk_data["input"][0]["name"] == "run_sql" :

                tool_name = chunk_data["input"][0]["name"]
                call_id = chunk_data["input"][0]["id"]
                args = chunk_data["input"][0]["args"]

                tool_calls.append(Tool_Call(call_id=call_id , tool_name=tool_name , args=args , output=None))

            elif chunk_type == "updates" :

                if chunk_data.get("model") and isinstance( chunk_data["model"]["messages"][0] , AIMessage):

                    agent_output = chunk_data["model"]["messages"][0].content
                
                if chunk_data.get("tools"):

                    tool_data = chunk_data["tools"]["messages"][0]

                    if isinstance(tool_data , ToolMessage):

                        for calls in tool_calls: 

                            if tool_data.tool_call_id == calls.call_id: 

                                calls.output = chunk_data["tools"]["messages"][0]    
        
    except Exception as e : 

        return JSONResponse( content={ "message" : "Unable to process your request" , "success" : False } , status_code=500 )

    print( "\n\n\n" , agent_output , "\n\n\n" )

    sql_queries = [ tool_call.args["query"] for tool_call in tool_calls ]

    if agent_output : 
        
        turn_data = Turn_data( ai_response=agent_output , user_query=data.query , conversation_id=f"{data.conversation_id or new_convo_id }" , database_id=data.db_id , sql_query=sql_queries if len(sql_queries) > 0 else None   )
        
        result = insert_chats_in_db.delay(turn_data.model_dump())

    return JSONResponse(content={

        "data" : ""

    } , status_code=200)


