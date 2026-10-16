from .main import app 
from pydantic import BaseModel 
from typing import Any 
from db.models import Turns , engine 
import time
from sqlmodel import Session
from sqlalchemy import select 
from typing import Optional , List , Any 
from langchain.messages import AnyMessage
import json 
import os 
from uuid import uuid4
from agent.memory.long import mem0
from lib.helpers import get_qdrant_client
from qdrant_client import models 

class Turn_data(BaseModel):
    conversation_id : str
    database_id : str 
    user_query : str
    ai_response  : str
    sql_query : Any 

class Schema_Data(BaseModel): 
    schema_str : List[str]
    user_id : str
    db_id : str 


@app.task(bind=True , max_retries=3 , default_retry_delay=120 )
def memory_write(self , raw_data : str): 

    try: 

        data = json.loads(raw_data)

        conversation_id = data.get("conversation_id")
        
        db_id = data.get("db_id")

        user_id = data.get("user_id")

        raw_memory = json.loads(data.get("memory"))

        if user_id and db_id and conversation_id and raw_memory :

            result = mem0.add( messages=[{ "role" : "user" , "content" : raw_memory["memory"]}] , user_id=data["user_id"] , run_id=conversation_id , app_id=db_id , metadata={"category": raw_memory["category"], "confidence": raw_memory["confidence_score"]} , infer=False)

        else: 
            raise ValueError("Missing required data")

    except Exception as exc:
        raise self.retry(exc=exc)


@app.task( bind=True , max_retries=3 , default_retry_delay=120 )
def insert_chats_in_db ( self , raw_data : Turn_data ):

    try : 

        data = Turn_data.model_validate(raw_data)

        with Session(engine) as db: 

            turn = Turns(

                conversation_id=data.conversation_id, 
                ai_response=data.ai_response,
                user_query=data.user_query,
                sql_query=data.sql_query

            )

            db.add(turn)
            db.commit()
            db.refresh(turn)

    except Exception as exc:
        raise self.retry(exc=exc)

@app.task( bind=True , max_retries=3 , default_retry_delay=120 )
def ingest_schema (self , raw_data : str) :

    try:

        data = Schema_Data.model_validate_json(raw_data)

        OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
        QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION")

        if not QDRANT_COLLECTION: 
            raise ValueError("QDRANT_COLLECTION environment variable is not set")

        if not OPENROUTER_API_KEY:
            raise ValueError("OPENROUTER_API_KEY environment variable is not set")

        client = get_qdrant_client()
        
        points = []
        
        for schema_data in data.schema_str : 
            
            point = models.PointStruct(

                id=str(uuid4()),
                vector={


                    "dense" : models.Document(

                        text=schema_data,                                          
                        model ="openrouter/nvidia/llama-nemotron-embed-vl-1b-v2:free",
                        options ={

                            "openrouter-api-key" : OPENROUTER_API_KEY,
                            "dimensions" : 1024

                        }  

                    ),
                    "sparse" : models.Document(

                        text=schema_data,
                        model="qdrant/bm25"

                    )

                }, 

                payload={
                
                    "tenant_id" : f"{data.user_id}__{data.db_id}",
                    "page_content" : schema_data
                
                }

            )

            points.append(point)

        client.upload_points(

            collection_name=QDRANT_COLLECTION,
            points=points,
            wait=True

        )
    except Exception as exc:
        raise self.retry(exc=exc)

