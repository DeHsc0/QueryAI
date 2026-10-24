from langchain.agents.middleware import dynamic_prompt , wrap_model_call
from langchain.agents.middleware.types import ModelRequest


@wrap_model_call
async def disable_parallel_tool_calls(
    request: ModelRequest,
    handler,
):
    request.model_settings["parallel_tool_calls"] = False
    return await handler(request)

@dynamic_prompt
def add_dense_schema ( req : ModelRequest ) -> str :

    dense_schema = req.runtime.context.dense_schema
    db_type = req.runtime.context.db_type
    user_prefs = req.runtime.context.user_prefs
    
    return f"{req.system_prompt} \n Database Software : {db_type} \n Dense Schema :\n {dense_schema} \n {f"Here are the User Preferences you should consider before answering: {user_prefs}" if user_prefs else "" }"