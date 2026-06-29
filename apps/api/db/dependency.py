
from db.init import SessionLocal

def get_db():
    db = SessionLocal.begin()
    try:
        yield db
    finally:
        db.close()