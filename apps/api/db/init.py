from sqlalchemy.orm import DeclarativeBase , sessionmaker
from sqlalchemy import create_engine 
import os
from sqlalchemy.orm import Mapped , mapped_column , relationship
import uuid 
from sqlalchemy import UUID , ForeignKey
from dotenv import load_dotenv

load_dotenv()

class Base(DeclarativeBase):
    pass


class User(Base):
    
    __tablename__ = "users"
    
    id : Mapped[uuid.UUID] = mapped_column( UUID(as_uuid=True) , primary_key=True , default=uuid.uuid4 )
    username : Mapped[str] = mapped_column( unique=True )
    clerk_id : Mapped[str] = mapped_column( unique=True )
    email : Mapped[str] = mapped_column( unique=True )
    databases : Mapped[list["UserDatabases"]] = relationship( back_populates="user")
    
class UserDatabases(Base):
    
    __tablename__ = "user_databases"
    
    id : Mapped[uuid.UUID] = mapped_column( UUID(as_uuid=True) , primary_key=True , default=uuid.uuid4 )
    user_clerk_id : Mapped[str] = mapped_column( ForeignKey("users.clerk_id") )
    encrypted_creds : Mapped[str] = mapped_column()
    user : Mapped["User"] = relationship( back_populates="databases" )


engine = create_engine(os.getenv("DATABASE_URL"))

Base.metadata.create_all(engine)

SessionLocal  = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)