from langchain.tools import tool , ToolRuntime
import json 
from pydantic import BaseModel , Field 
from typing import List
from enum import Enum
from agent.context import Context
from task_queue.tasks import memory_write

class Memory_Category(str , Enum): 
    DB_FACT = "db_fact"
    USER_PREF = "user_preference"

class Memories(BaseModel): 
    
    confidence_score : str = Field( description="How confident you are that this memory is accurate and worth keeping (0.0–1.0)")

    memory : str = Field(description="A clear, self-contained, durable statement that will still be useful in future conversations. One distinct idea only.")
    
    category : Memory_Category = Field(description="user_preference | db_fact")


@tool
def add_memory(data : List[Memories] , runtime : ToolRuntime[Context] ): 
    """
    Store high-quality long-term memories (user preferences, stable facts, or learned database/schema knowledge).
    Only store clear, durable information with confidence ≥ 0.7. One specific fact per memory.
    
    """
    user_id , db_id = runtime.context.tenant_id.split("__" , 1)
    conversation_id = runtime.context.conversation_id

    for memory in data:

        task_data = {"user_id": user_id, "db_id": db_id, "conversation_id": conversation_id, "memory": memory.model_dump_json()}

        memory_write.delay(json.dumps(task_data))

    return "Memories have been Added"

