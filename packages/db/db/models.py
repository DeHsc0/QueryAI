
from typing import List , Optional
from sqlalchemy.dialects.postgresql import ARRAY 
from sqlalchemy import DateTime
from dotenv import load_dotenv
from sqlmodel import SQLModel , Field , Relationship , create_engine , func , Enum , Column , String  
import os , uuid 
from datetime import datetime

load_dotenv()


class DatabaseTypes(str , Enum): 
    "postgresql"
    "mysql"
    "oracle"
    "microsoft"

class User(SQLModel , table=True):
    __tablename__ = "users"
    
    id : uuid.UUID = Field( default_factory=uuid.uuid4 , primary_key=True )
    username : str = Field( unique=True) 
    clerk_id : str = Field( index=True , unique=True )
    email : str = Field( unique=True )
    databases : List[ "UserDatabases" ] = Relationship( back_populates="user" )
    created_at : datetime = Field( default_factory = lambda : datetime.now() ,  sa_type=DateTime(timezone=False) , nullable=False)
    updated_at : datetime = Field(default_factory = lambda : datetime.now() , sa_type=DateTime(timezone=False) , sa_column_kwargs={"onupdate" : lambda : datetime.now() })


class UserDatabases( SQLModel , table=True ):

    __tablename__ = "user_databases"

    id : uuid.UUID = Field( default_factory=uuid.uuid4 , primary_key=True )
    user_clerk_id : str = Field( foreign_key="users.clerk_id" , index=True )
    encrypted_creds : str = Field()
    database_name : str = Field( unique=True) 
    database_soft : str = DatabaseTypes
    description : str = Field()
    dense_schema : str = Field()
    user : Optional["User"] = Relationship( back_populates="databases")
    conversations : List["Conversations"] = Relationship( back_populates="user_database" )
    created_at : datetime = Field( default_factory = lambda : datetime.now() ,  sa_type=DateTime(timezone=False) , nullable=False)
    updated_at : datetime = Field(default_factory = lambda : datetime.now() , sa_type=DateTime(timezone=False) , sa_column_kwargs={"onupdate" : lambda : datetime.now() })
    
    


class Conversations( SQLModel , table=True):
    __tablename__ = "conversations"

    id : uuid.UUID = Field( default_factory=uuid.uuid4 , primary_key=True)
    database_id : uuid.UUID = Field( foreign_key="user_databases.id" , index=True)
    user_database: UserDatabases = Relationship(back_populates="conversations")
    turns : List[Turns] = Relationship( back_populates="conversation")
    title : str = Field()
    created_at : datetime = Field( default_factory = lambda : datetime.now() ,  sa_type=DateTime(timezone=False) , nullable=False)
    updated_at : datetime = Field(default_factory = lambda : datetime.now() , sa_type=DateTime(timezone=False) , sa_column_kwargs={"onupdate" : lambda : datetime.now() })
    
    

class Turns ( SQLModel , table=True ):
    __tablename__ = "turns" 

    id : uuid.UUID = Field( default_factory=uuid.uuid4 , primary_key=True)
    conversation_id : uuid.UUID = Field( foreign_key="conversations.id" , index=True )
    conversation : Conversations = Relationship( back_populates="turns")
    user_query : str 
    sql_query : Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    ai_response : str 
    created_at : datetime = Field( default_factory = lambda : datetime.now() ,  sa_type=DateTime(timezone=False) , nullable=False)
    
    


engine = create_engine(

    os.getenv("DATABASE_URL"),
    echo=False,           
    pool_size=10,        
    max_overflow=20,
    pool_pre_ping=True   

)