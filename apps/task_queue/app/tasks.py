from .main import app 
from pydantic import BaseModel 
from typing import Any 
from db.models import Turns

class Turn_data(BaseModel):
    conversation_id : str
    database_id : str 
    user_query : str
    ai_response  : str
    

@app.task( bind=True , max_retries=3 , default_retry_delay=120 )
def insert_chats_in_db ( self , data : Turn_data):

    try: 
        print(data)
    except Exception as exc: 
        raise self.retry(exc=exc , countdown=60 )

