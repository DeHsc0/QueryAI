
from typing import List , Optional
import os
import uuid 
from dotenv import load_dotenv
from sqlmodel import SQLModel , Field , Relationship , create_engine , Session

load_dotenv()

class User(SQLModel , table=True):
    __tablename__ = "users"
    
    id : uuid.UUID = Field( default_factory=uuid.uuid4 , primary_key=True )
    username : str = Field( unique=True) 
    clerk_id : str = Field( index=True , unique=True )
    email : str = Field( unique=True )
    databases : List[ "UserDatabases" ] = Relationship( back_populates="user" )

class UserDatabases( SQLModel , table=True ):

    __tablename__ = "user_databases"

    id : uuid.UUID = Field( default_factory=uuid.uuid4 , primary_key=True )
    user_clerk_id : str = Field( foreign_key="users.clerk_id" )
    encrypted_creds : str = Field()
    database_name : str = Field( unique=True) 
    description : str = Field()
    user : Optional["User"] = Relationship( back_populates="databases")
    conversations : List["Conversations"] = Relationship( back_populates="user_database" )

class Conversations( SQLModel , table=True):
    __tablename__ = "conversations"

    id : uuid.UUID = Field( default_factory=uuid.uuid4 , primary_key=True)
    database_id : uuid.UUID = Field( foreign_key="user_databases.id")
    turns : Optional[List[Turns]] = Relationship( back_populates="conversations")
    title : str = Field()
    thread_id : str = Field( unique=True )

class Turns ( SQLModel , table=True ):
    __tablename__ = "turns" 

    id : uuid.UUID = Field( default_factory=uuid.uuid4 , primary_key=True)
    conversation_id : uuid.UUID = Field( foreign_key="conversations.id")
    user_query : str 
    ai_response : str 



engine = create_engine(

    os.getenv("DATABASE_URL"),
    echo=False,           
    pool_size=10,        
    max_overflow=20,
    pool_pre_ping=True   

)