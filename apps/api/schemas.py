from pydantic import BaseModel

class Database_Creation(BaseModel):
    host : str
    user : str 
    password : str 
    port : int
    database : str


