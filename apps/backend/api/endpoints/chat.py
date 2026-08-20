from fastapi import APIRouter , Request
from schemas import Chat
from fastapi.responses import JSONResponse
from agent.init import Context
from app_state import AppState
import json

router = APIRouter()

@router.post("/")
async def chat (req : Request , data : Chat):

    state : AppState = req.app.state

    user_id : str = req.state.clerk.get("sub")

    print("Thread ID :" , data.thread_id)

    agent = state.agent 

    tenant_id = f"{user_id}__{data.db_id}"

    result = agent.invoke(

        {"messages": [{"role": "user", "content": data.query}]},

        config={

            "configurable" : {

                "thread_id" : f"{data.thread_id}"

            }

        }, 
        context=Context(tenant_id=tenant_id)

    )

    return JSONResponse(content={

        "data" : json.dumps( result , default=str)

    } , status_code=200)

