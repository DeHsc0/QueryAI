
from fastapi import APIRouter
from fastapi import Request , Depends
from fastapi.responses import JSONResponse
from schemas import Database_Creation
from lib.helpers import encrypt_credentials , decrypt_credentials , store_schema , ingest_schema
from db.dependency import get_db
from db.models import UserDatabases
import json
from lib.config import get_qdrant_client
from sqlmodel import Session, select

router = APIRouter() 

@router.get("/")
async def get_databases(req : Request , session : Session =Depends(get_db)):

    user_id : str = req.state.clerk.get("sub") 

    user_db = session.exec(

        select(UserDatabases).where(

            UserDatabases.user_clerk_id == user_id,             

        )

    ).all()

    user_db = [ db.model_dump_json() for db in user_db ]

    return JSONResponse({ "data" : user_db })

 
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

    schema , db_dense_schema = store_schema( data.creds )

    database =  UserDatabases(
        user_clerk_id=user_id,
        encrypted_creds=encrypt_data,
        database_soft=data.creds.database_type,
        database_name=data.database_name,
        description=data.description,
        dense_schema=db_dense_schema
    )

    session.add(database)

    session.commit()

    session.refresh(database)



    ingest_schema(schema , user_id=user_id , db_id=database.id)
    
    return JSONResponse(content={
    
        "message" : "Successfully created Database"
    
    } , status_code=200)

