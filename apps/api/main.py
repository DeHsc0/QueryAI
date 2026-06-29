from fastapi import FastAPI , Request , HTTPException , Depends
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse
from sqlalchemy import select , update
from clerk_backend_api import Clerk
from schemas import Database_Creation
from lib.utils import encrypt_credentials , decrypt_credentials
from db.dependency import get_db
import os
from db.init import SessionLocal , User
import json 
from svix import Webhook

app = FastAPI()

auth = HTTPBearer()

clerk = Clerk(bearer_auth=os.getenv(""))

WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET")

@app.post("/api/auth/webhook")
async def auth (req : Request):
    
    payload = await req.body()

    headers = {
        "svix-id": req.headers.get("svix-id"),
        "svix-timestamp": req.headers.get("svix-timestamp"),
        "svix-signature": req.headers.get("svix-signature"),
    }

    try:
        wh = Webhook(WEBHOOK_SECRET)
        event = wh.verify(payload, headers)
    
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    event_type = event["type"]
    event_data = event["data"]

    print("Event_type : " , event_type)

    clerk_id = event_data["id"]
    
    email_address = event_data["email_addresses"][0]["email_address"]
    
    username = event_data.get("username")

    user = session.execute(
        select(User).where(User.clerk_id == clerk_id)
    ).scalar_one_or_none()

    session = get_db()
    
    if event_type == "user.created":

        if username == None: 
            return JSONResponse(content={

                "success" : False,
                "message" : "Invalid Username"

            })

        if user != None: 
            return JSONResponse(content={

                "success" : False,
                "message" : "User already exists"

            })

        user = User( username=username , email=email_address , clerk_id=clerk_id)
        session.add(user)

        return JSONResponse(
            content={
                
                "success" : True,
                "message" : "Successfully created a user"

            }
        )

    if event_type == "user.deleted": 

        if user == None:
            return JSONResponse( content={

                "success" : False,
                "message" : "User dosent Exists"

            }) 
 
            
        session.delete(user)

        return JSONResponse(content={

            "success" : True,
            "message" : "User Deleted Successfully"


        })
        
    if event_type == "user.updated":

        if user == None:
            return JSONResponse( content={

                "success" : False,
                "message" : "User dosent Exists"

            }) 
            
        result = session.execute(
            update(User)
            .where( User.clerk_id == clerk_id )
            .values( username , email=email_address )
        )

        return JSONResponse(content={

            "success" : True,
            "message" : "Successfully updated user details"

        })


@app.get("/test")
def test(): 
    
    return JSONResponse(content={
        "hello" : True
    } , status_code=200)



@app.post("/connect_database")
def connect_database( data : Database_Creation , creds = Depends(auth) ) :


    
    encrypt_data = encrypt_credentials(data)    
    
    decrypted_data = decrypt_credentials(encrypt_data)
    
    return JSONResponse(content={
    
        "encrypted_creds" : encrypt_data ,
        "decrypted_data" : decrypted_data.decode()
    
    } , status_code=200)


