from fastapi import APIRouter , Request
from typing import Optional
from fastapi.responses import JSONResponse
from db.dependency import get_db
from fastapi import Depends 
from sqlmodel import Session
from app.tasks import insert_chats_in_db
from app_state import AppState
from schemas import ChatCreation
from agent.init import get_llm
from langchain_core.messages import SystemMessage , HumanMessage
from db.models import Conversations
from uuid import uuid4

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

    config = {

            "configurable" : {

                "thread_id" : f"{thread_id}"

            }

        }

    for t in checkpointer.list(config):
        print(t.checkpoint["id"], t.metadata)

    task = insert_chats_in_db.delay(message="Hello world")

    return JSONResponse( content={

        "message" : "Success"

    } , status_code=200)


@router.post("/")
def create_conversation( req : Request , data : ChatCreation , session : Session = Depends(get_db) ):
    
    user_id : str = req.state.clerk.get("sub")

    database_id = data.database_id

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

            "max_tokens" : 10

        }

    } )

    print(title)

    conversation = Conversations(

        thread_id=str(uuid4()),
        database_id=database_id,
        title=title.content

    )
    
    session.add(conversation)

    session.commit()

    session.refresh(conversation)

    return JSONResponse(content={

        "thread_id" : conversation.thread_id,
        "title" : conversation.title

    } , status_code=200)

    

    

     
