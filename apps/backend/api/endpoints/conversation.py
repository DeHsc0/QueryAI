from fastapi import APIRouter , Request
from typing import Optional
from fastapi.responses import JSONResponse
from db.dependency import get_db
from fastapi import Depends 
from sqlmodel import Session
from app.tasks import insert_chats_in_db

router = APIRouter()

@router.get("/")
def get_conversations (req : Request , id : Optional[str] ,  session : Session =Depends(get_db)) :

    print(type(req.state.clerk))
    print(req.state.clerk)

    # user_id : str = req.state.clerk.get("sub") 

    # task = insert_chats_in_db.delay(message="Hello world")

    # print(task)

    if id is None: 
        return JSONResponse(content={

            "message" : "No id provided"

        } , status_code=301)

    

    

    

     
