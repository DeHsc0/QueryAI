
from cryptography.fernet import Fernet
import os , json
from sqlalchemy.engine import URL
from dotenv import load_dotenv
from sqlmodel import create_engine , inspect
from schemas import Creds
from typing import Dict
from typing import List
from sqlmodel import Session
from contextlib import contextmanager

load_dotenv() 

SAMPLE_DB = {
  "solar_panel": [
    "What's the downtime score for 'Solar Plant West Davidport'?",
    "What's the potential financial hit from our risky plants?",
    "For snapshot PV945724, what's its performance if we adjust for temperature?",
    "For the maintenance event PV937101, what's the ratio of cost to revenue impact?",
    "How many of our plants are real lemons, both running inefficiently and breaking down all the time?"
  ],
  "polar_equipment": [
    "Show me the equipment type, equipment code, overall efficiency, safety index, their ranks, and how much those ranks differ across equipment. Sort the results.",
    "Could you identify all equipment that are fit for harsh weather in our polar database? Show me the equipment, heater status, insulation status, emergency light status, the structure margin, and their readiness label.",
    "For our polar safety assessment, I need to evaluate the safety equipment's reliability. Please provide a report showing the equipment code, equipment type, life support status, reliability score, reliability classification. Also include a JSON summary of oxygen status , medical status, and safety system status as support systems status. Focus only on safety equipment and sort the results.",
    "Provide the location type, station name, number of equipment at each station, how much they rely on renewables, total renewable power, and their classification. Only include equipment that has measurable solar or wind output data, and sort the results.",
    "For each combination of station name and zone type, I need to see station names, zone type, average water quality indices, average WRMI scores, count of systems that need water-saving, classification, and management situation. Group and sort results."
  ],
  "museum_artifact": [
    "Show me a report on our most important artifacts that are at risk.",
    "Find artifacts with a high ERF. Show the artifact ID, name, the score, and a summary of sensitivities. Only show if the score is high.",
    "I need a conservation report for 'Ming' and 'Qing' artifacts. Show the artifact information, its CPI score, and the priority level.",
    "Show dynasty, importance, and budget info for artifacts.",
    "I need a report on artifacts at risk of accelerated deterioration. Show the artifact ID, name, current temp and humidity, number of high sensitivities, and whether it is at high risk. I want to see all artifacts."
  ],
  "archeology_scan": [
    "I'd like to see a quality assessment of scans across our archaeological sites. Show site code, site name, scan quality for each site and rank them.",
    "Could you help me find archaeological sites that might need urgent conservation attention? I'm particularly interested in identifying sites in Risk Zones. For each site, I'd like to see their code, name, structural condition, and status, along with their risk category.",
    "I'm planning our upcoming archaeological scanning sessions and want to understand which sites have the most suitable environments. Could you show me a report with each location's ID, name, and its average scanning suitability? This would help us prioritize places for scanning.",
    "I'm evaluating the quality of our registrations and would like to understand which ones are most reliable. Could you show me the accuracy ratio and confidence levels for each registration? I'd need to see the registration ID, project ID, accuracy measurements, error values, calculated ratio, and what confidence level that translates to.",
    "For our archaeological site evaluation, I need to quantify the preservation metrics across our collection. Please compute a quality index for each location. Present the results in descending order of quality values, displaying only the site code, site designation, and calculated value to facilitate prioritization of our digital preservation resources."
  ],
  "households": [
    "Find the typical bathroom ratio for each area. Show the area code and the average ratio.",
    "Where is the highest concentration of high-risk families?",
    "Give me the IDs of families that are both receiving aid and have a lot of vehicles.",
    "How many apartments qualify for the Space Bonus with more than 20 square meters per resident?",
    "Show me a list of our most well-off, largest households."
  ]
}

ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

if not ENCRYPTION_KEY:
    raise ValueError("ENCRYPTION_KEY environment variable is not set")

fernet = Fernet(ENCRYPTION_KEY)

def encrypt_credentials ( credentials_dict : Creds ): 

    encrypted_creds = fernet.encrypt( json.dumps({ "creds" : credentials_dict.model_dump() }).encode() )    
    
    return encrypted_creds.decode()


def decrypt_credentials ( encrypted_creds : str ):
    
    data_bytes = fernet.decrypt( encrypted_creds )

    data_str = data_bytes.decode("utf-8")

    data = json.loads(data_str)
    
    return data

@contextmanager
def get_user_db (creds : Creds) : 

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

    db = Session(engine)

    try:
        yield db , engine
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
    

def store_schema ( creds : Creds ):

    with get_user_db(creds) as (db, engine): 

        db_dense_schema : List[str] = []

        schema : List[str] = []

        with engine.connect() as conn: 
            inspector = inspect(conn)

            table_names = inspector.get_table_names()

            db_dense_schema.append(f"Number of Tables: {len(table_names)} \n")

            for name in table_names:

                lines = [f"Table : {name} \n\nColumns : "]

                relationships = []
                    
                cols = inspector.get_columns(name)

                db_dense_schema.append(f"T:{name} | cols:{len(cols)}")

                foreign_keys = inspector.get_foreign_keys(name)

                if foreign_keys.__len__() > 0: 

                    last_index_fk = len(foreign_keys) - 1 

                    db_dense_schema.append(" | J:")

                    for fk in foreign_keys:

                        constrained_cols = ", ".join(fk["constrained_columns"])
                        referred_table = fk["referred_table"]
                        referred_cols = ", ".join(fk["referred_columns"])

                        if foreign_keys.index(fk) == last_index_fk: 

                            db_dense_schema.append(f" {referred_table} \n")

                        else : 

                            db_dense_schema.append(f" {referred_table} , ")

                        relationships.append(
                            f"{name}.{constrained_cols} → {referred_table}.{referred_cols}"
                        )
                else: 
                    db_dense_schema.append("\n")

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

        db_dense_schema = "".join(db_dense_schema)


    return schema , db_dense_schema