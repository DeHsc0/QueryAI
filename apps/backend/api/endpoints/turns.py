from fastapi import APIRouter , Request , Depends 
from fastapi.responses import JSONResponse
from typing import Optional
from sqlalchemy import  select 
from sqlmodel import Session
from db.models import Turns , Conversations
from db.dependency import get_db
from app_state import AppState
from langchain_core.messages import  HumanMessage , AIMessage 

router = APIRouter()

@router.get("/")
def get_conversations (req : Request, id : Optional[str] = None , thread_id : Optional[str]  = None,  session : Session =Depends(get_db)) :

    user_id : str = req.state.clerk.get("sub") 

    if id is None or thread_id is None: 
        return JSONResponse(content={

            "message" : "No id provided"

        } , status_code=301)
    
    state : AppState = req.app.state

    checkpointer = state.checkpointer

    config = {"configurable": { "thread_id": thread_id }}

    t = checkpointer.get_tuple(config) 

    turns = []

    if t:
        messages = t.checkpoint.get("channel_values", {}).get("messages", [])
        
        i = 0
        while i < len(messages):
            msg = messages[i]

            if isinstance( msg , HumanMessage): 
                turn = {

                    "user_query" : msg.content, 
                    "ai_response" : None

                }             

            i += 1

            if i < len(messages):

                msg = messages[i]

                if isinstance(msg , AIMessage): 

                    turn["ai_response"] = msg.content
                    i += 1

            turns.append(turn)

        print(turns)

    elif len(turns) > 0:

        return JSONResponse( content={

            "Data" : turns

        } , status_code=200)

    else: 

        results = session.exec(
            select(Conversations)
            .where(

                Conversations.id == thread_id, 
                Conversations.database_id == id

            )
        )

        print(results)

        return JSONResponse(content={ "Data" : ""})
