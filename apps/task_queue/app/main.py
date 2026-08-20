from celery import Celery

app = Celery(

    "celery", 
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1",
    include=["app.tasks"]

)

app.conf.worker_pool = "solo"