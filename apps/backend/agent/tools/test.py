from langchain.tools import tool 

@tool
def test_tool( name : str): 
    "Greeting tool , pass the name of the entity you were asked to greet"

    return f"Good morning {name}"