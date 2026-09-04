from langchain.tools import tool , ToolRuntime
from agent.tools.tools_arg_schema import Run_Sql_Query
from sqlmodel import Session , text
from sqlalchemy.engine.cursor import CursorResult
from lib.helpers import get_db_engine , decrypt_credentials
from schemas import Creds

@tool(args_schema=Run_Sql_Query)
def run_sql( query : str , runtime : ToolRuntime ): 
    """Runs provided sql query on user's database"""

    raw_creds : str = runtime.context.encrypted_creds

    creds = Creds.model_validate( decrypt_credentials(raw_creds)["creds"] )

    engine = get_db_engine(creds)

    with Session(engine) as session: 
        result : CursorResult = session.exec(

            text(query)

        )    

        rows = result.all()

        print("\n\n\n Result.all :" , rows , "\n\n\n")
        print("\n\n\n Result.mappings.all :" , result.mappings().all() , "\n\n\n")


    return 