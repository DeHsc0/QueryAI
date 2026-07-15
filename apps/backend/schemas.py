from pydantic import BaseModel
from enum import Enum

# database.py

class Creds(BaseModel):
    host : str
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
    database_type : Database_types  
    creds : dict[ str , Creds]
