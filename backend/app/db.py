import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from .models.user import Base

# Database Configuration abstraction.
# To migrate to PostgreSQL, simply change DATABASE_URL in .env to:
# postgresql://<user>:<password>@<host>:<port>/<dbname>
# And ensure a PostgreSQL driver like psycopg2 or pg8000 is installed.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)

# Enable SQLite Write-Ahead Logging (WAL) mode for concurrency under streaming load.
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
