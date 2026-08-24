from fastapi import APIRouter , Request
from schemas import Chat
from fastapi.responses import JSONResponse
from langchain_core.messages import HumanMessage , AIMessage
from agent.init import Context
from app_state import AppState
from task_queue.app.tasks import insert_chats_in_db
from langgraph.stream.run_stream import GraphRunStream

router = APIRouter()

@router.post("/")
async def chat (req : Request , data : Chat):

    state : AppState = req.app.state

    user_id : str = req.state.clerk.get("sub")

    agent = state.agent 

    tenant_id = f"{user_id}__{data.db_id}"

    config={

        "configurable" : {

            "thread_id" : f"{data.conversation_id}"

            }
        }

    stream : GraphRunStream = agent.stream_events( 

        {"messages" : [ HumanMessage(content=data.query)]}, 

        config=config,

        context=Context(tenant_id=tenant_id),

        version="v3"

    )

    ai_resonse = stream.output


        
        # for chunk in message.tool_calls:
        #     print(f"tool call chunk: {chunk}")

        # finalized = message.tool_calls.get()
    


    return JSONResponse(content={

        "data" : ""

    } , status_code=200)

