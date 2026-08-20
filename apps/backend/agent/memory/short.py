from langgraph.checkpoint.redis import RedisSaver
import os 

def get_checkpointer() -> RedisSaver :

    REDIS_URL=os.getenv("REDIS_URL") 
    
    checkpointer = RedisSaver( redis_url=REDIS_URL , ttl={

        "default_ttl" : 60 * 20,
        "refresh_on_read" : True

    } )

    checkpointer.setup()

    return checkpointer    