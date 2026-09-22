from fastapi import APIRouter , Request 
from pydantic import BaseModel 
from sqlglot import parse_one , ParseError
from task_queue.tasks import insert_chats_in_db
from fastapi.responses import JSONResponse

router = APIRouter()

class TestModel(BaseModel): 
    raw_creds : str
    query : str

@router.post("/")
def test ( req : Request , data : TestModel ):

    result = insert_chats_in_db(message="hello from FastAPI")

    

    print( "\n\n\n Result: " , result)
    print( "\n\n\n Type of Result: " , type(result))


    return JSONResponse(content={"data" : ""})


