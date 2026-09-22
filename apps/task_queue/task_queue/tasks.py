from .main import app 
from pydantic import BaseModel 
from typing import Any 
from db.models import Turns , engine 
import time
from sqlmodel import Session
from sqlalchemy import select 

class Turn_data(BaseModel):
    conversation_id : str
    database_id : str 
    user_query : str
    ai_response  : str
    

@app.task( bind=True , max_retries=3 , default_retry_delay=120 )
def insert_chats_in_db ( self , message : Turn_data ):

    try: 

        with Session(engine) as db: 

            turn = Turns(

                conversation_id=message.conversation_id, 
                ai_response=message.ai_response,
                user_query=message.user_query

            )

            db.add(turn)
            db.commit()
            db.refresh(turn)

    except Exception as exc: 
        raise self.retry(exc=exc , countdown=60 )

