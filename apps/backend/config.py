from qdrant_client import QdrantClient , models  
from langchain_qdrant import QdrantVectorStore
import os 
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_qdrant import FastEmbedSparse , RetrievalMode
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()

def get_qdrant_client () -> QdrantClient :

    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    collection_name = os.getenv("QDRANT_COLLECTION")

    # sparse_model = HuggingFaceEndpointEmbeddings( model="Qdrant/bm25" )

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