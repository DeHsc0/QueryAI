from celery import Celery
from dotenv import load_dotenv
import os

load_dotenv()

app = Celery(

    "celery", 
    broker=f"{os.getenv("REDIS_URL")}/0",
    backend=f"{os.getenv("REDIS_URL")}/1",
    include=["task_queue.tasks"]

)

app.conf.worker_pool = "solo"
