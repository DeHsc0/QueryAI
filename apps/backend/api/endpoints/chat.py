

from fastapi import APIRouter , Request
from schemas import Chat
from fastapi.responses import JSONResponse 
from agent.init import get_llm
from langchain_core.messages import HumanMessage , AIMessage , ToolMessage , SystemMessage
from agent.init import Context
from app_state import AppState
from task_queue.tasks import insert_chats_in_db , Turn_data
from typing import  Any , List
from dataclasses import dataclass
from sqlmodel import Session , select
from db.models import Conversations , Turns , UserDatabases 
from fastapi import Depends 
from db.dependency import get_db
from app_state import AppState
from langgraph.checkpoint.redis import AsyncRedisSaver

@dataclass
class Tool_Call: 
    call_id : str | Any
    args : Any 
    tool_name : str | Any


router = APIRouter()

@router.post("/")
async def chat (req : Request , data : Chat , session : Session = Depends(get_db)):

    state : AppState = req.app.state

    user_id : str = req.state.clerk.get("sub")

    new_convo_id = None 
    convo = None 
    recent_turns = None 

    if data.conversation_id is None: 
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

    else :

        state : AppState = req.app.state
        
        checkpointer : AsyncRedisSaver = state.checkpointer

        t = await checkpointer.aget_tuple({

            "configurable" : {

                "thread_id" : f"{data.conversation_id}"

                }
            })

        in_memory = t.checkpoint["channel_values"].get("messages", []) if t else []

        print("\n\n\n\n Length of the REdis short memory :" , len(in_memory) , "\n\n\n\n")

        if not in_memory:

            try: 

                statement = select(Conversations).join(Conversations.user_database).where(Conversations.id == data.conversation_id).where(UserDatabases.user_clerk_id == user_id).where(Conversations.database_id == data.db_id)

                convo = session.exec(statement).first()

                turns = session.exec(

                    select(Turns).where(

                        Turns.conversation_id == convo.id

                    )
                    .order_by(Turns.created_at.desc())
                    .limit(5)

                ).fetchall()


                recent_turns = [ turn for turn in turns ] 

            except Exception as e : 

                return JSONResponse(content={ "message" : "Conversation Dosent Exist" , "success" : False , "data" : str(e) } , status_code=404)

    messages = []

    if recent_turns:

        for turn in recent_turns:
            messages.append(AIMessage(content=turn.ai_response))
            messages.append(HumanMessage(content=turn.user_query))

        messages.reverse()

    messages.append(HumanMessage(content=data.query))

    print("\n\n\n" , messages)

    agent = state.agent 

    tenant_id = f"{user_id}__{data.db_id}"

    config={

        "configurable" : {

            "thread_id" : f"{new_convo_id if new_convo_id else data.conversation_id  }"

            }
        }

    tool_calls : List[Tool_Call] = []

    agent_output : str

    async for chunk in agent.astream( 

        {"messages" : messages}, 

        config=config,

        context=Context( tenant_id=tenant_id , dense_schema=None , db_type=None , encrypted_creds=None),

        version="v3", 

        stream_mode=["updates" , "messages" , "tasks"]

    ):

        chunk_type , chunk_data = chunk

        if chunk_type == "tasks" and chunk_data["name"] == "tools" and chunk_data.get("input") and chunk_data["input"][0]["name"] == "run_sql":

            tool_name = chunk_data["input"][0]["name"]
            call_id = chunk_data["input"][0]["id"]
            args = chunk_data["input"][0]["args"]

            tool_calls.append(Tool_Call(call_id=call_id , tool_name=tool_name , args=args ))

        elif chunk_type == "updates" :

            if chunk_data.get("model") and isinstance( chunk_data["model"]["messages"][0] , AIMessage):

                agent_output = chunk_data["model"]["messages"][0].content
            
            if chunk_data.get("tools"):

                tool_data = chunk_data["tools"]["messages"][0] 

                if isinstance(tool_data , ToolMessage) :
                        
                    for calls in tool_calls:
                        if calls.call_id == tool_data.tool_call_id: 
                            calls.output = tool_data.content     

    print( "\n\n\n" , agent_output , "\n\n\n" )

    sql_queries = [ tool_call.args for tool_call in tool_calls ]

    turn_data = Turn_data( ai_response=agent_output , user_query=data.query , conversation_id=f"{data.conversation_id or new_convo_id }" , database_id=data.db_id , sql_query=sql_queries if len(sql_queries) > 0 else None   )

    result = insert_chats_in_db.delay(turn_data.model_dump())

    return JSONResponse(content={

        "data" : ""

    } , status_code=200)
