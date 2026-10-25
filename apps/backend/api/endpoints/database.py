
from fastapi import APIRouter
from fastapi import Request , Depends
from fastapi.responses import JSONResponse
from schemas import Database_Creation , Creds
from lib.helpers import encrypt_credentials , store_schema , SAMPLE_DB
from db.dependency import get_db
from db.models import UserDatabases
import json
from sqlmodel import Session, select
from task_queue.tasks import ingest_schema
from lib.config import get_qdrant_client 
from qdrant_client import models  
import os 
from dataclasses import dataclass

router = APIRouter() 

@router.get("/")
async def get_databases(req : Request , session : Session =Depends(get_db)):

    user_id : str = req.state.clerk.get("sub")     

    try: 

        user_db = session.exec(

            select(
                UserDatabases.id,
                UserDatabases.database_name, 
                UserDatabases.created_at,
                UserDatabases.description,
                UserDatabases.database_soft
                
                ).where(

                UserDatabases.user_clerk_id == user_id,             

            )

        ).all()


        databases = [  
            
            {
                "id": str(database.id),
                "database_name": database.database_name,
                "database_soft": database.database_soft,
                "description": database.description,
                "created_at": str(database.created_at),
            }

                for database in user_db 
        ]

    except Exception as e : 
    
        return JSONResponse( content={ "message" : "Unable to fetch user's database data"  , "success" : False} , status_code=301 )

    return JSONResponse({ "data" : databases })

 
@router.post("/")
async def create_database(req : Request ,  data : Database_Creation , session : Session =Depends(get_db)) :

    user_id : str = req.state.clerk.get("sub") 

    creds = None

    if data.sample_db and not data.creds:

        if data.sample_db in SAMPLE_DB: 
            creds = Creds(
                host=os.getenv("SAMPLE_DB_HOST"),
                port=int(os.getenv("SAMPLE_DB_PORT", 5432)),
                database_type="postgresql",
                username=os.getenv("SAMPLE_DB_USER"),
                password=os.getenv("SAMPLE_DB_PASSWORD"),
                database=data.sample_db,
            
            )
        else: 
            return JSONResponse(content={ "message" : f"Sample database with the name {data.sample_db} dosent exists."} , status_code=201)
    else: 
        creds = data.creds

    try:

        existing_database = session.exec(

            select(UserDatabases).where(

                UserDatabases.user_clerk_id == user_id, 
                UserDatabases.database_name == data.database_name

            )

        ).first() 

    except Exception as e: 
        return JSONResponse(content={ "message" : "Something went wrong"  } , status_code=301 )

    if existing_database: 
        return  JSONResponse(content={
    
        "message" : "Database with same name already exists "
    
    } , status_code=301)


    try:
        
        encrypt_data = encrypt_credentials( creds )

        schema , db_dense_schema = store_schema( creds )


        database =  UserDatabases(
            user_clerk_id=user_id,
            encrypted_creds=encrypt_data,
            database_soft=creds.database_type,
            database_name=data.database_name if not data.sample_db else data.sample_db,
            description=data.description,
            dense_schema=db_dense_schema,
            sample_db=False if not data.sample_db else True
        )

        session.add(database)

        session.commit()

        session.refresh(database)

    except Exception as e: 
        return JSONResponse(content={ "message" : "unable to register the database" , "message" : str(e) } , status_code=301 )

    ingest_schema.delay(json.dumps({ "schema_str" : schema , "user_id" : user_id , "db_id" : str(database.id) }))
    
    return JSONResponse(content={
        
        "data" : {
                    "id": str(database.id),
                    "database_name": database.database_name,
                    "database_soft": database.database_soft,
                    "description": database.description,
                    "created_at": str(database.created_at),
                }
    
    } , status_code=200)

@router.delete("/{db_id}") 
async def delete_database( req : Request , db_id : str , session : Session = Depends(get_db)): 

    try :

        user_id : str = req.state.clerk.get("sub")

        user_db = session.exec( select( UserDatabases ).where( UserDatabases.id == db_id , UserDatabases.user_clerk_id  == user_id) ).first()

        if not user_db: 
            return JSONResponse(content={ "message" : "Database Dosent exists"} , status_code=301)

        session.delete(user_db)
        session.commit()

        qdrant = get_qdrant_client()

        tenant_id = f"{user_id}__{db_id}"

        delete = qdrant.delete(
            collection_name=os.getenv("QDRANT_COLLECTION"),
            points_selector=models.FilterSelector(
                filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="tenant_id",
                            match=models.MatchValue(value=tenant_id),
                        )
                    ]
                )
            ),
            wait=True,  
        )

        return JSONResponse(content={ "message" : "Successfully deleted the registered database."})

    except Exception as e: 
        return JSONResponse(content={ "message" : "Unable to delete the registered database." , "error" : str(e)} , status_code=500)

    