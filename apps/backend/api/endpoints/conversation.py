
from fastapi import APIRouter , Request
from fastapi.responses import JSONResponse
from db.dependency import get_db
from db.models import UserDatabases
from fastapi import Depends 
from sqlmodel import Session , select
from schemas import ChatCreation
from agent.init import get_llm
from langchain_core.messages import SystemMessage , HumanMessage 
from db.models import Conversations
from dataclasses import dataclass

router = APIRouter()

@dataclass
class Chat_Turns:
    user_query : str
    ai_response : str
    timestamp : str


@router.post("/")
def create_conversation( req : Request , data : ChatCreation , session : Session = Depends(get_db) ):
    
    user_id : str = req.state.clerk.get("sub")

    database_id = data.database_id


    db = session.exec(
            select(UserDatabases)
            .where(UserDatabases.user_clerk_id == user_id)
            .where(UserDatabases.id == database_id)
        ).first()

    if not db:
        return JSONResponse( content={"message" : "Database not found for this user"} , status=401 )

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

    conversation = Conversations(
        
        user_database=db,
        title=title.content

    )
    
    session.add(conversation)

    session.commit()

    session.refresh(conversation)

    return JSONResponse(content={

        "thread_id" : conversation.id,
        "title" : conversation.title

    } , status_code=200)

    

    

     
