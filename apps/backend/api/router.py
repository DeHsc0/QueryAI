from fastapi import APIRouter 
from .endpoints import auth , database , chat , conversation

api_router = APIRouter()

api_router.include_router(
    
    auth.router,
    prefix="/auth",
    tags=["Auth"]

)

api_router.include_router(
    
    database.router,
    prefix="/database",
    tags=["Auth"]

)

api_router.include_router(

    chat.router,
    prefix="/chat",
    tags=["Auth"]
    

)

api_router.include_router(

    conversation.router, 
    prefix="/conversation",
    tags=["Auth"]

) 