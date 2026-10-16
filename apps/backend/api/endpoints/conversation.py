
from fastapi import APIRouter , Request
from fastapi.responses import JSONResponse
from db.dependency import get_db
from db.models import UserDatabases , Conversations
from fastapi import Depends 
from sqlmodel import Session , select
from schemas import ChatCreation

router = APIRouter()


@router.get("/{db_id}")
def get_conversation(req:Request , db_id : str , session = Depends(get_db)): 

    user_id : str = req.state.clerk.get("sub")

    try :

        data = session.exec(

            select( Conversations ).join(UserDatabases).where(

                UserDatabases.id == db_id, 
                UserDatabases.user_clerk_id == user_id

            )

        ).all()

        conversation_data = [ {

            "id" : str(conversation.id), 
            "title" : conversation.title

        } for conversation in data ]

        return JSONResponse(content={"data" : conversation_data} , status_code=200)

    except Exception as e : 
        return JSONResponse(content={ "message" : "Unable to fetch conversation data" , "success" : False , "error" : str(e)} , status_code=301)

