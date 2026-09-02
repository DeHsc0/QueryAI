from langchain.tools import tool 
from agent.tools.tools_arg_schema import Run_Sql_Query

@tool(args_schema=Run_Sql_Query)
def run_sql( query : str): 
    """Runs provided sql query on user's database"""

    

    return 