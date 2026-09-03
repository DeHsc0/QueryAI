from langgraph.checkpoint.redis import AsyncRedisSaver
import os 

async def get_checkpointer() -> AsyncRedisSaver :

    REDIS_URL=os.getenv("REDIS_URL") 
    
    checkpointer = AsyncRedisSaver( redis_url=REDIS_URL , ttl={

        "default_ttl" : 60 * 20,
        "refresh_on_read" : True

    } )

    await checkpointer.setup()

    return checkpointer