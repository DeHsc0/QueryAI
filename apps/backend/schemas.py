from pydantic import BaseModel , ConfigDict , Field
from typing import Literal , Optional

class Creds(BaseModel):
    host : str
    database_type : Literal[ "oracle" , "postgresql" , "mysql" , "microsoft" ]  
    username : str 
    password : str
    port : int
    database : str

    model_config={

        "from_attributes" : True

    }

class Database_Creation(BaseModel):
    database_name : str = Field(
        pattern=r"^[a-z0-9]+$"
    )
    description : str
    creds : Creds

class Chat(BaseModel): 
    query : str
    conversation_id : str
    db_id : str

class ChatCreation(BaseModel):
    database_id : str
    query : Optional[str]