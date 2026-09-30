from .main import app 
from pydantic import BaseModel 
from typing import Any 
from db.models import Turns , engine 
import time
from sqlmodel import Session
from sqlalchemy import select 
from typing import Optional , List 

class Turn_data(BaseModel):
    conversation_id : str
    database_id : str 
    user_query : str
    ai_response  : str
    sql_query : Optional[List[str]]
    

@app.task( bind=True , max_retries=3 , default_retry_delay=120 )
def insert_chats_in_db ( self , raw_data : Turn_data ):

    try: 

        data = Turn_data.model_validate(raw_data) if isinstance(raw_data, dict) else raw_data

        print(data)

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

