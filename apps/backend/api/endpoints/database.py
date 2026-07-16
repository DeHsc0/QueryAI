
from fastapi import APIRouter
from fastapi import Request , Depends
from fastapi.responses import JSONResponse
from schemas import Database_Creation
from lib.utils import encrypt_credentials , decrypt_credentials
from db.dependency import get_db
from apps.backend.db.models import UserDatabases

router = APIRouter() 
 
@router.post("/")
async def create_database(req : Request ,  data : Database_Creation , session=Depends(get_db)) :

    user_id = req.state.clerk.get("sub") 

    print( "User_id: " , user_id)

    print("creds :" , data.creds)

    print("Data :" , data)


    encrypt_data = encrypt_credentials(data.creds)

    

    database =  UserDatabases(
        user_clerk_id=user_id,
        encrypted_creds=encrypt_data
        
    )

    session.add(database)

    session.commit()
    
    return JSONResponse(content={
    
        "message" : "Successfully created Database"
    
    } , status_code=200)

