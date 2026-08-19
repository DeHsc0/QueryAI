from pydantic import BaseModel , Field

class Retrieve_Context(BaseModel):
    query : str = Field(

        description="Descriptive query to retrieve context from the vector database"

    )