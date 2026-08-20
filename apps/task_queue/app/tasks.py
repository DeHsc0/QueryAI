from .main import app 
from pydantic import BaseModel 
from typing import Any 


class Chatargs: 
    chats : Any

@app.task( bind=True , max_retries=3 , default_retry_delay=120 )
def insert_chats_in_db ( self , message : str ):

    try: 
        print(message)
    except Exception as exc: 
        raise self.retry(exc=exc , countdown=60 )

