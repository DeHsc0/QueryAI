from langchain.tools import tool , ToolRuntime
from agent.tools.arg_schema import Retrieve_Context
from lib.helpers import get_qdrant_client
import os
from qdrant_client import models

@tool(args_schema=Retrieve_Context) 
def retrieve_context ( query : str ,  runtime : ToolRuntime ): 

    """Retrieve context from the vector db"""

    tenant_id = runtime.context.tenant_id

    collection_name = os.getenv("QDRANT_COLLECTION")

    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

    client = get_qdrant_client() 

    query_filter = models.Filter(

        must=[ models.FieldCondition(

            key="tenant_id",
            match=models.MatchValue(value=tenant_id)

        )]
        
    )

    dense_query = models.Document(text=query , model=models.Document(

                    text=query,                                          
                    model ="openrouter/nvidia/llama-nemotron-embed-vl-1b-v2:free",
                    options ={

                        "openrouter-api-key" : OPENROUTER_API_KEY,
                        "dimensions" : 1024

                  }  

                ))

    sparse_query= models.Document(

                    text=query,
                    model="qdrant/bm25"

                )

    results = client.query_points(

        collection_name=collection_name, 

        prefetch=[

            models.Prefetch(

                query=dense_query,
                using="dense",
                limit=10

            ),

            models.Prefetch(

                query=sparse_query,
                using="sparse",
                limit=5

            )

        ], 

        query=models.FusionQuery(

            fusion=models.Fusion.RRF

        ),

        query_filter=query_filter,

        limit=10

    )

    print(results)





