from fastapi import APIRouter, Depends, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlmodel import Session
from db.models import Conversations, Turns, UserDatabases
from db.dependency import get_db

router = APIRouter()

@router.get("/{db_id}/{conversation_id}")
async def get_conversations(
    req: Request,
    db_id: str,
    conversation_id: str,
    session: Session = Depends(get_db),
):

    user_id: str = req.state.clerk.get("sub")

    try:

        user_db = session.exec(
            select(UserDatabases).where(
                UserDatabases.id == db_id,
                UserDatabases.user_clerk_id == user_id,
            )
        ).first()

    except Exception as e: 
        return JSONResponse(content={ "message" : "Unable to verify database access" , "success": False} , status_code=301)

    if not user_db:
        return JSONResponse(
            content={
                "message": "User does not have access to this database.",
                "success": False,
            },
            status_code=403,
        )

    try: 

        conversation = session.exec(
            select(Conversations).where(
                Conversations.id == conversation_id,
                Conversations.database_id == db_id,
            )
        ).first()

    except Exception as e: 
        return JSONResponse(content={ "message" : "Unable to verify if the conversation exists or not" , "success": False} , status_code=301)

    if not conversation:
        return JSONResponse(
            content={"message": "Conversation does not exist", "success": False},
            status_code=404,
        )

    try: 

        turns = session.exec(
            select(Turns)
            .where(Turns.conversation_id == str(conversation[0].id))
            .order_by(Turns.created_at.desc(), Turns.id.desc())
            .limit(5)
        ).fetchall()

        turns_data = [turn[0].dict() for turn in turns]

    except Exception as e : 
        return JSONResponse(content={ "message" : "Unable to fetch turns", "success": False} , status_code=301)

    return JSONResponse(content=jsonable_encoder({"data": turns_data}), status_code=200)