from fastapi import FastAPI , Request , HTTPException
from fastapi.responses import JSONResponse
from clerk_backend_api import authenticate_request 
from db.init import User
from schemas import Database_Creation
from lib.utils import encrypt_credentials , decrypt_credentials
import os
import json 
from svix import Webhook

app = FastAPI()

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

        print(event)
    
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid signature")

    return JSONResponse(
        content={
            
            "data" : event,
            "sad" : "Done"
        }
    )





@app.get("/test")
def test(): 
    
    User.email.has("hello World")
    
    return JSONResponse(content={
        "hello" : True
    } , status_code=200)



@app.post("/connect_database")
def connect_database(data : Database_Creation) :
    
    encrypt_data = encrypt_credentials(data)    
    
    decrypted_data = decrypt_credentials(encrypt_data)
    
    return JSONResponse(content={
    
        "encrypted_creds" : encrypt_data ,
        "decrypted_data" : decrypted_data.decode()
    
    } , status_code=200)