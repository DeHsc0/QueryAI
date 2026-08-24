from db.models import engine
from sqlmodel import Session

def get_db():
    db = Session(engine)
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()