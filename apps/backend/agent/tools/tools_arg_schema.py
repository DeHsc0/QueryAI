from pydantic import BaseModel , Field

class Retrieve_Context(BaseModel):

    query : str = Field(

        description="Descriptive query to retrieve context from the vector database"

    )

class Run_Sql_Query(BaseModel):

    query : str = Field(
        description="Sql query"
    )