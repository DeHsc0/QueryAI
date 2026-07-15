from fastapi import APIRouter 
from .endpoints import auth , database

api_router = APIRouter()

api_router.include_router(
    
    auth.router,
    prefix="/webhook",
    tags=["Auth"]

)

api_router.include_router(
    
    database.router,
    prefix="/database",
    tags=["Auth"]

)