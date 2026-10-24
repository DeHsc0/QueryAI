
from fastapi import APIRouter , Request
from fastapi.responses import JSONResponse
from db.dependency import get_db
from db.models import UserDatabases , Conversations
from fastapi import Depends 
from sqlmodel import select

router = APIRouter()


@router.get("/{db_id}")
def get_conversation(req:Request , db_id : str , session = Depends(get_db)): 

    user_id : str = req.state.clerk.get("sub")

    try :

        db_row = session.exec(
            select(
                UserDatabases.id,
                UserDatabases.database_name,
                UserDatabases.database_soft,
                UserDatabases.description,
                UserDatabases.created_at,
            ).where(
                UserDatabases.id == db_id,
                UserDatabases.user_clerk_id == user_id,
            )
        ).first()

        if not db_row:
            return JSONResponse(content={"message": "Database not found", "success": False}, status_code=404)

        rows = session.exec(
            select(Conversations.id, Conversations.title, Conversations.created_at)
            .where(Conversations.database_id == db_id)
            .order_by(Conversations.created_at.desc())
        ).all()

        return JSONResponse(content={"data": {
            "database": {
                "id": str(db_row.id),
                "database_name": db_row.database_name,
                "database_soft": db_row.database_soft,
                "description": db_row.description,
                "created_at": str(db_row.created_at),
            },
            "conversations": [
                {"id": str(cid), "title": ctitle, "created_at": str(ccreated)}
                for cid, ctitle, ccreated in rows
            ],
        }})

    except Exception as e : 
        return JSONResponse(content={ "message" : "Unable to fetch conversation data bla bla bla bla " , "success" : False , "error" : str(e)} , status_code=301)
