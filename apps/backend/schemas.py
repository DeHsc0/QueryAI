from pydantic import BaseModel , ConfigDict
from enum import Enum

class Creds(BaseModel):
    host : str
    database_type : Database_types  
    user : str 
    password : str
    port : int
    database : str

class Database_types(str , Enum):
    MYSQL = "mysql"
    POSTGRESQL = "postgresql"
    ORACLE = "oracle"
    MICROSOFT = "microsoft"

class Database_Creation(BaseModel):
    database_name : str
    description : str
    creds : Creds