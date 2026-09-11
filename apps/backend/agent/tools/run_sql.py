from langchain.tools import tool , ToolRuntime
from agent.tools.tools_arg_schema import Run_Sql_Query
from sqlmodel import Session , text
from sqlalchemy.engine.cursor import CursorResult
from lib.helpers import get_db_engine , decrypt_credentials
from schemas import Creds
import json
from typing import Dict
from decimal import Decimal 
from sqlglot import parse_one , ParseError

@tool(args_schema=Run_Sql_Query)
def run_sql( query : str , runtime : ToolRuntime ): 
    """Runs provided sql query on user's database"""

    BANNED_KEYWORDS = [
        "DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE",
        "GRANT", "REVOKE", "CREATE", "REPLACE", "EXECUTE", "CALL"]

    try:
    
        result = parse_one( query , read="postgres")

    except ParseError as e:
        return f"Invalid SQL syntax: {e}"

    for kw in BANNED_KEYWORDS: 

        if kw in query: 
            return "Error : Not a Read only query"

    raw_creds : str = runtime.context.encrypted_creds

    creds = Creds.model_validate( decrypt_credentials(raw_creds)["creds"] )
        
    engine = get_db_engine(creds)

    with Session(engine) as session: 
        results : CursorResult = session.exec(

            text(query)

        )        


        result = results.mappings().all()

        temp_res = []

        for el in result: 

            item = dict(el)

            for key , value in item.items():

                if isinstance(value , Decimal):

                    item[key] = float(item[key])

            temp_res.append(item)     

        final_result = json.dumps(temp_res)

    return final_result