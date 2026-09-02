from fastapi import APIRouter , Request
from schemas import Chat
from fastapi.responses import JSONResponse
from langchain_core.messages import HumanMessage , AIMessage , ToolMessage
from agent.init import Context
from app_state import AppState
from task_queue.tasks import insert_chats_in_db
from langchain_core.language_models.chat_model_stream import ChatModelStream
from langgraph.stream.run_stream import GraphRunStream 
from typing import Dict , Any , List
from dataclasses import dataclass

@dataclass
class Tool_Call: 
    call_id : str | Any
    args : Any 
    tool_name : str | Any
    output : Any


router = APIRouter()

@router.post("/")
async def chat (req : Request , data : Chat):

    state : AppState = req.app.state

    user_id : str = req.state.clerk.get("sub")

    agent = state.agent 

    tenant_id = f"{user_id}__{data.db_id}"

    config={

        "configurable" : {

            "thread_id" : f"{data.conversation_id}"

            }
        }

    tool_calls : List[Tool_Call] = []

    for chunk in agent.stream( 

        {"messages" : [ HumanMessage(content=data.query)]}, 

        config=config,

        context=Context(tenant_id=tenant_id),

        version="v3", 

        stream_mode=["updates" , "messages" , "tasks"]

    ):

         
        chunk_type , chunk_data = chunk

        tool_name = None
        args = None
        call_id = None

        if chunk_type == "tasks" and chunk_data["name"] == "tools" and chunk_data.get("input"):


            tool_name = chunk_data["input"][0]["name"]
            call_id = chunk_data["input"][0]["id"]
            args = chunk_data["input"][0]["args"]

            tool_calls.append(Tool_Call(call_id=call_id , tool_name=tool_name , args=args , output=None ))

        elif chunk_type == "updates" and chunk_data.get("tools"):

            tool_data = chunk_data["tools"]["messages"][0] 

            if isinstance(tool_data , ToolMessage) :
               print(tool_data)
               for calls in tool_calls:
                   if calls.call_id == tool_data.tool_call_id: 
                       calls.output = tool_data.content 

            
        print(tool_calls)

    result = insert_chats_in_db.delay("hello from FastAPI")

    return JSONResponse(content={

        "data" : ""

    } , status_code=200)
