
from cryptography.fernet import Fernet
import os , json
from sqlalchemy.engine import URL
from dotenv import load_dotenv
from sqlmodel import create_engine , inspect
from schemas import Creds
from typing import Dict
from lib.config import get_qdrant_client
from qdrant_client import models 
from uuid import uuid4
from langchain_core.documents import Document 


load_dotenv() 

ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if ENCRYPTION_KEY is None:
    raise ValueError("ENCRYPTION_KEY environment variable is not set")
if OPENROUTER_API_KEY is None:
    raise ValueError("OPENROUTER_API_KEY environment variable is not set")

fernet = Fernet(ENCRYPTION_KEY)

def encrypt_credentials ( credentials_dict : Creds ): 

    encrypted_creds = fernet.encrypt( json.dumps({ "creds" : credentials_dict.model_dump() }).encode() )    
    
    return encrypted_creds.decode()


def decrypt_credentials ( encrypted_creds : str ):
    
    data_bytes = fernet.decrypt( encrypted_creds )

    data_str = data_bytes.decode("utf-8")

    data = json.loads(data_str)
    
    return data



def store_schema ( creds : Creds , db_id : str , user_id : str ):

    driver_types : Dict[ str , str ] = {

        "mysql" : "mysql+pymysql",
        "microsoft" : "mssql+pyodbc",
        "postgresql" : "postgresql+psycopg2",
        "oracle" : "oracle+oracledb"

    }

    db_url = URL.create(

        drivername=f"{driver_types[creds.database_type]}",
        host=creds.host,
        password=creds.password,
        database=creds.database,
        username=creds.username,
        port=creds.port
        
    )

    engine = create_engine( url=db_url , pool_pre_ping=True)


    schema : list[str] = []

    with engine.connect() as conn: 
        inspector = inspect(conn)

        table_names = inspector.get_table_names()


        for name in table_names:

            relationships = []
                
            cols = inspector.get_columns(name)
            foreign_keys = inspector.get_foreign_keys(name)


            if foreign_keys.__len__() > 0: 

                for fk in foreign_keys:

                    constrained_cols = ", ".join(fk["constrained_columns"])
                    referred_table = fk["referred_table"]
                    referred_cols = ", ".join(fk["referred_columns"])

                    relationships.append(
                        f"{name}.{constrained_cols} → {referred_table}.{referred_cols}"
                    )

            lines = [f"Table : {name} \n\nColumns : "]

            for col in cols: 

                nullable = "nullable" if col.get("nullable" , True) else "not null"

                comment = f"{col['comment']}" if col.get("comment") else ""
                
                lines.append(f"\n- {col["name"]} {str(col.get("type"))}  ({nullable}) {comment}")

            if relationships.__len__() > 0:

                lines.append(f"\nRelationships: ")

                for relations in relationships: 
                    lines.append(f"- {relations}")

            table_schema = "".join(lines)

            schema.append(table_schema)

    client = get_qdrant_client()

    points = []

    for data in schema : 
        
        point = models.PointStruct(

            id=str(uuid4()),
            vector={


                "dense" : models.Document(

                    text=data,                                          
                    model ="openrouter/nvidia/llama-nemotron-embed-vl-1b-v2:free",
                    options ={

                        "openrouter-api-key" : OPENROUTER_API_KEY,
                        "dimensions" : 1024

                  }  

                ),
                "sparse" : models.Document(

                    text=data,
                    model="qdrant/bm25"

                )

            }, 

            payload={
            
               "tenant_id" : f"{user_id}__{db_id}",
               "page_content" : data
            
            }

        )

        points.append(point)

    client.upload_points(

        collection_name="queryai",
        points=points,
        wait=True

    )

    return schema