from qdrant_client import QdrantClient , models  
import os 
from dotenv import load_dotenv
from redis import Redis
from mem0 import MemoryClient 

load_dotenv()

def get_qdrant_client () -> QdrantClient :

    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    collection_name = os.getenv("QDRANT_COLLECTION")

    client = QdrantClient(
        url=qdrant_url,
        api_key=qdrant_api_key,
        cloud_inference=True,
    )

    collection_exists = client.collection_exists(collection_name)

    if not collection_exists: 
        collection = client.create_collection(

            collection_name, 
            
            hnsw_config=models.HnswConfigDiff(

                payload_m=16, 
                m=0

            ),
            vectors_config={

                "dense" : models.VectorParams( size=1024 , distance=models.Distance.COSINE )

            }, 

            sparse_vectors_config={

                "sparse" : models.SparseVectorParams( modifier=models.Modifier.IDF )

            }

        )

        if collection : 
            payload_index = client.create_payload_index(

                collection_name, 
                field_name="tenant_id",
                field_schema=models.KeywordIndexParams( is_tenant=True , type=models.KeywordIndexType.KEYWORD )

            )


    return client

def get_redis_client () -> Redis : 

    redis_client = Redis.from_url(os.getenv("REDIS_URL") , decode_responses=True )

    return redis_client

def get_mem0 () -> MemoryClient : 
    
    mem0 = MemoryClient()

    return mem0