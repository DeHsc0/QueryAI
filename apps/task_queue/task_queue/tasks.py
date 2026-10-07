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
from agent.memory.long import mem0

class Turn_data(BaseModel):
    conversation_id : str
    database_id : str 
    user_query : str
    ai_response  : str
    sql_query : Any 



@app.task(bind=True , max_retries=3 , default_retry_delay=120 )
def memory_write(self , raw_data : str): 

    data = json.loads(raw_data)

    print("\n\n\n\n\n\n data :" , data , "\n\n\n\n\n\n\n")

    conversation_id = data.get("conversation_id")
    
    db_id = data.get("db_id")

    user_id = data.get("user_id")

    raw_memory = json.loads(data.get("memory"))

    if user_id and db_id and conversation_id and raw_memory :

        result = mem0.add( messages=[{ "role" : "user" , "content" : raw_memory["memory"]}] , user_id=data["user_id"] , run_id=conversation_id , app_id=db_id , metadata={"category": raw_memory["category"], "confidence": raw_memory["confidence_score"]} , infer=False)

    return data


@app.task( bind=True , max_retries=3 , default_retry_delay=120 )
def insert_chats_in_db ( self , raw_data : Turn_data ):

    try: 

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
        print("\n\n\n\n\n\n\n\n\n" , "It Failed" , "\n\n\n\n\n\n\n\n\n" ) 
        raise self.retry(exc=exc , countdown=60 )
