import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import companies, analyst, auth
from app.db import init_db

# Initialize database
init_db()

app = FastAPI(
    title="FinSight AI API",
    description="Backend API for FinSight AI Autonomous Financial Research Platform",
    version="1.0.0"
)

# CORS setup
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(analyst.router, prefix="/api/analyst", tags=["analyst"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

@app.get("/")
def read_root():
    return {"message": "Welcome to FinSight AI API"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
