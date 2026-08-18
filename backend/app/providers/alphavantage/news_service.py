from typing import List, Dict, Any
from datetime import datetime
import hashlib
from .client import AlphaVantageClient
from .schemas import NewsArticle

class AlphaVantageNewsService:
    def __init__(self):
        self.client = AlphaVantageClient()

    def _generate_id(self, url: str) -> str:
        return hashlib.md5(url.encode()).hexdigest()

    async def search_news(self, ticker: str = None, topic: str = None, limit: int = 50) -> Dict[str, Any]:
        params = {
            "function": "NEWS_SENTIMENT",
            "limit": str(limit)
        }
        if ticker:
            params["tickers"] = ticker
        if topic:
            params["topics"] = topic
            
        try:
            data = await self.client.get(params)
            
            # Catch Alpha Vantage specific api limit warnings
            if "Note" in data:
                return {"news": [], "status": "rate_limited", "message": data["Note"]}
            if "Error Message" in data:
                return {"news": [], "status": "auth_error", "message": data["Error Message"]}
                
            feed = data.get("feed", [])
            results = []
            for item in feed:
                sentiment = item.get("overall_sentiment_label", "Neutral")
                score = item.get("overall_sentiment_score")
                
                ticker_relevance = None
                if ticker:
                    ticker_data = next((t for t in item.get("ticker_sentiment", []) if t.get("ticker") == ticker.upper()), None)
                    if ticker_data:
                        ticker_relevance = float(ticker_data.get("relevance_score", 0))
                        sentiment = ticker_data.get("ticker_sentiment_label", sentiment)
                        score = float(ticker_data.get("ticker_sentiment_score", 0)) if ticker_data.get("ticker_sentiment_score") else score
                
                article = NewsArticle(
                    article_id=self._generate_id(item.get("url", "")),
                    ticker=ticker.upper() if ticker else "GENERAL",
                    headline=item.get("title", ""),
                    summary=item.get("summary", ""),
                    source_name=item.get("source", ""),
                    source_url=item.get("url", ""),
                    published_at=item.get("time_published", ""),
                    retrieved_at=datetime.utcnow().isoformat(),
                    topics=item.get("topics", []),
                    provider_sentiment=sentiment,
                    provider_sentiment_score=float(score) if score is not None else None,
                    relevance_score=ticker_relevance
                )
                results.append(article.model_dump())
                
            return {"news": results, "status": "ok"}
        except Exception as e:
            err_str = str(e).lower()
            if "invalid api key" in err_str or "apikey" in err_str or "auth" in err_str or "unauthorized" in err_str:
                status = "auth_error"
            elif "rate limit" in err_str or "note" in err_str or "standard API call frequency" in err_str:
                status = "rate_limited"
            else:
                status = "network_error"
            return {"news": [], "status": status, "message": str(e)}
