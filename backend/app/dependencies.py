from fastapi import Depends
import os

from .providers.interfaces import FilingProvider, NewsProvider
from .providers.sec.service import SECFilingService
from .providers.alphavantage.news_service import AlphaVantageNewsService

# Dependency functions for FastAPI endpoints
# These act as factories that return the correct Provider based on config

def get_filing_provider() -> FilingProvider:
    # In the future, this could return a MockProvider if os.getenv("ENV") == "test"
    return SECFilingService()

def get_news_provider() -> NewsProvider:
    # Returning Alpha Vantage as the primary News Provider as per README
    return AlphaVantageNewsService()

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from .services.auth import SECRET_KEY, ALGORITHM
from .db import SessionLocal
from sqlalchemy.orm import Session
from .models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from fastapi import Request

def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        # Fall back to Authorization header to avoid breaking tests or API clients
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user
