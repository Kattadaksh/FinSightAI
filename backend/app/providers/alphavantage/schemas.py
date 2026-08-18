from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class NewsArticle(BaseModel):
    article_id: str
    provider: str = "ALPHA_VANTAGE"
    ticker: str
    company_id: Optional[str] = None
    headline: str
    summary: str
    source_name: str
    source_url: str
    published_at: str
    retrieved_at: str
    topics: List[Dict[str, Any]] = []
    provider_sentiment: str
    provider_sentiment_score: Optional[float] = None
    relevance_score: Optional[float] = None
    raw_payload_reference: Optional[str] = None
