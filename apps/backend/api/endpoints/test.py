from fastapi import APIRouter , Request 
from pydantic import BaseModel 
from sqlglot import parse_one , ParseError

router = APIRouter()

class TestModel(BaseModel): 
    raw_creds : str
    query : str

@router.post("/")
def test ( req : Request , data : TestModel ):

    query = data.query

    BANNED_KEYWORDS = [
            "DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE",
            "GRANT", "REVOKE", "CREATE", "REPLACE", "EXECUTE", "CALL"]
    
    try:
    
        result = parse_one( query , read="postgres")
        final_query = result.sql()

    except ParseError as e:
        return f"Invalid SQL syntax: {e}"

    for kw in BANNED_KEYWORDS: 

        if kw in query: 
            return "Error : Not a Read only query"


