from langchain.tools import tool , ToolRuntime
from sqlmodel import text
from sqlalchemy.engine.cursor import CursorResult
from lib.helpers import decrypt_credentials , get_user_db
from schemas import Creds
import json
from decimal import Decimal 
from sqlglot import ParseError , parse , expressions as exp 
from pydantic import BaseModel , Field

MAX_ROWS = 50 

class Run_Sql_Query(BaseModel):

    query : str = Field(
        description="Sql query"
    )

def validate_read_only(sql_ast):
    if len(sql_ast) != 1:
        return "Only single SELECT statements allowed."

    node = sql_ast[0]
    if not isinstance(node, (exp.Select, exp.With, exp.Union, exp.Subquery)):
        return f"Only SELECT queries allowed. Got: {type(node).__name__}"

    if isinstance(node, exp.Select) and node.args.get("into"):
        return "SELECT INTO is not allowed."

    bad = node.find(
        exp.Insert, exp.Update, exp.Delete, exp.Merge,
        exp.Create, exp.Drop, exp.Alter, exp.TruncateTable, 
        exp.Grant, exp.Copy, exp.Command, exp.Cache
    )

    if bad:
        return f"Write operation not allowed: {type(bad).__name__}"

    return None



@tool(args_schema=Run_Sql_Query)
def run_sql( query : str , runtime : ToolRuntime ): 
    """Runs provided sql query on user's database"""

    try:

        if runtime.context.db_type == "postgresql": 
            dialect = "postgres"

        elif runtime.context.db_type == "microsoft": 
            dialect = "mssql"        
        
        else:  
            dialect = runtime.context.db_type
    
        stmts = parse( query , read=dialect)

    except ParseError as e:
        return f"Invalid SQL syntax: {e}"

    not_valid_query = validate_read_only(sql_ast=stmts)

    if not_valid_query : 
        return not_valid_query

    final_query = stmts[0].sql(dialect=dialect)
    
    raw_creds : str = runtime.context.encrypted_creds

    creds = Creds.model_validate( decrypt_credentials(raw_creds)["creds"] )

    with get_user_db(creds) as (db, engine ) : 

        results : CursorResult = db.exec(

            text(final_query)

        )        

        result = results.mappings().fetchmany( size=MAX_ROWS + 1 )
        temp_res = []

        for el in result: 

            item = dict(el)

            for key , value in item.items():

                if isinstance(value , Decimal):

                    item[key] = float(item[key])

            temp_res.append(item)     

        final_result = json.dumps(temp_res)

    return final_result