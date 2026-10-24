from fastapi import APIRouter , Request 
from pydantic import BaseModel , Field
from fastapi.responses import JSONResponse
from sqlmodel import Session , text
from sqlalchemy.engine.cursor import CursorResult
from lib.helpers import get_user_db , decrypt_credentials
from schemas import Creds
from decimal import Decimal 
from sqlglot import ParseError , parse , expressions as exp 
import json


class Run_Sql_Query(BaseModel):

    query : str = Field(
        description="Sql query"
    )

ALLOWED_TOP_LEVEL = (
    exp.Select,
    exp.Union,
    exp.Intersect,
    exp.Except,
    exp.Query,
)

DANGEROUS_NODES = (
    # DML
    exp.Insert,
    exp.Update,
    exp.Delete,
    exp.Merge,
    # DDL
    exp.Drop,
    exp.Create,
    exp.Alter,
    exp.TruncateTable,
    # Other dangerous
    exp.Command,
    exp.Transaction,
    exp.Commit,
    exp.Rollback,
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

def run_sql( query : str , dialect : str = "postgres" , encrypted_creds : str = "gAAAAABqurr0vKfnfnQzza5A6D1kdm-7KILAHelJ3Aucqin5atAMuYmYMKnwHQHaYnjvbFRtdFgbfuCr75fLDdDkRgEDf1Ks5gdCOdAxk9IN4duf9aU7eRx-6IWy180BLFKbsIddV-PjiKwLzGeMEvdNGSM1tU_zRDO6-eGwMtj8VxfqtJHt9L5z-5MRAYGMeEGtFizbBU_32CpnZyCvrcE_Fz4_MCDSZDWTiFhxFXGEYuFUSjxD7gBsPyOdtVl8dXlYcb130PNb"): 
    """Runs provided sql query on user's database"""

    try:
        
        stmts = parse( query , read=dialect)

    except ParseError as e:
        return f"Invalid SQL syntax: {e}"

    is_valid_query = validate_read_only(sql_ast=stmts)

    final_query = stmts[0].sql(dialect=dialect)
    
    raw_creds : str = encrypted_creds

    creds = Creds.model_validate( decrypt_credentials(raw_creds)["creds"] )
        
    engine = get_user_db(creds)

    with Session(engine) as session: 
        results : CursorResult = session.exec(

            text(final_query)

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

router = APIRouter()

@router.get("/")
def test ( req : Request ):

    result = run_sql(query="""SELECT o.weathprofile AS weather_condition,
       AVG(s.snrratio) AS avg_snqi,
       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY s.snrratio) AS median_snqi,
       COUNT(s.snrratio) AS analyzable_signal_count
FROM signals s
JOIN telescopes t ON s.telescref = t.telescregistry
JOIN observatories o ON t.observstation = o.observstation
WHERE s.snrratio IS NOT NULL
  AND o.weathprofile IS NOT NULL
GROUP BY o.weathprofile
ORDER BY avg_snqi DESC;
""")

    return JSONResponse(content={"data" : ""})


