from pydantic import BaseModel , Field , model_validator
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
        pattern=r"^[a-z0-9_]+$"
    )
    sample_db : Optional[str]
    description : Optional[str]
    creds : Optional[Creds]

    @model_validator(mode="after")
    def validate_database_source(self):

        if (self.sample_db is None) == (self.creds is None):
      
            raise ValueError(
                "Please provide either 'sample_db' or 'creds'"
            )

        return self

class Chat(BaseModel): 
    query : str
    conversation_id : Optional[str]
    db_id : str

class ChatCreation(BaseModel):
    database_id : str
    query : Optional[str]