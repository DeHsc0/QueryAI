from sqlalchemy.orm import Mapped , mapped_column , relationship
from init import Base 
import uuid 
from sqlalchemy import UUID , ForeignKey

class User(Base):
    
    __tablename__ = "users"
    
    id : Mapped[uuid.UUID] = mapped_column( UUID(as_uuid=True) , primary_key=True , default=uuid.uuid4 )
    username : Mapped[str] = mapped_column( unique=True )
    clerk_id : Mapped[str] = mapped_column( unique=True )
    email : Mapped[str] = mapped_column( unique=True )
    databases : Mapped["User_Databases"] = relationship( back_populates=True)
    
class User_Databases(Base):
    
    __tablename__ = "user_databases"
    
    id : Mapped[uuid.UUID] = mapped_column( UUID(as_uuid=True) , primary_key=True , default=uuid.uuid4 )
    user_clerk_id : Mapped[str] = mapped_column( ForeignKey("users.id") )
    encrypted_creds : Mapped[str] = mapped_column()