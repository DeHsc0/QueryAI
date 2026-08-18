from fastapi import FastAPI , Request , HTTPException , Depends
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv
from api.router import api_router
from clerk_backend_api import Clerk , AuthenticateRequestOptions
import httpx
import os 
from clerk_backend_api import authenticate_request , authenticate_request_async

load_dotenv() 

app = FastAPI()

auth_token = HTTPBearer() 

origins=[

        "http://localhost:3000"
    
    ]

class ClerkAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch ( self , req : Request , call_next  ): 

        public_paths = {"/", "/health", "/docs", "/openapi.json", "/redoc", "/api/auth/webhook"}

        print(req.url.path)
        
        if req.url.path in public_paths:
        
            return await call_next(req)        

        try:

            http_req = httpx.Request(
                method=req.method,
                url=str(req.url),
                headers=req.headers,
                cookies=req.cookies
            )

            req_state = authenticate_request(
                
                http_req,
                AuthenticateRequestOptions(
                    secret_key=os.getenv("CLERK_SECRET_KEY"),
                    authorized_parties=origins
                )

            )

            print("IS Signed in :" , req_state.is_signed_in)

            print("IS Authenticated :" , req_state.is_authenticated)

            if not req_state.is_signed_in or not req_state.is_authenticated: 
                return JSONResponse(

                    content={

                        "message" : "Unauthorized"

                    },
                    
                    status_code=401

                )   

        except Exception as e:
                return JSONResponse(

                    content={

                        "message" : "Authentication Failed."

                    },

                    status_code=401

                )   
        
        req.state.clerk = req_state.payload 
        
        response = await call_next(req)
        return response 
    
app.add_middleware(ClerkAuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(api_router , prefix="/api")
   