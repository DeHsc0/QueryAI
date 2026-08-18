
from fastapi import APIRouter
from fastapi import Request , Depends
from fastapi.responses import JSONResponse
from schemas import Database_Creation
from lib.helpers import encrypt_credentials , decrypt_credentials , store_schema
from db.dependency import get_db
from db.models import UserDatabases
import json
from config import get_qdrant_client
from sqlmodel import Session, select

router = APIRouter() 
 
@router.post("/")
async def create_database(req : Request ,  data : Database_Creation , session : Session =Depends(get_db)) :

    user_id : str = req.state.clerk.get("sub") 

    existing_database = session.exec(

        select(UserDatabases).where(

            UserDatabases.user_clerk_id == user_id, 
            UserDatabases.database_name == data.database_name

        )

    ).first() 

    if existing_database: 
        return  JSONResponse(content={
    
        "message" : "Database with same name already exists "
    
    } , status_code=301)

    encrypt_data = encrypt_credentials( data.creds )

    database =  UserDatabases(
        user_clerk_id=user_id,
        encrypted_creds=encrypt_data,
        database_name=data.database_name,
        description=data.description,
    )

    session.add(database)

    session.commit()

    session.refresh(database)

    db_id=database.id

    schema = store_schema(data.creds  , db_id=db_id , user_id=user_id)
    
    return JSONResponse(content={
    
        "message" : "Successfully created Database"
    
    } , status_code=200)

