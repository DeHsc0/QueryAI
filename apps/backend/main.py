from fastapi import FastAPI
from fastapi.responses import JSONResponse
from clerk_backend_api import authenticate_request 

app = FastAPI()