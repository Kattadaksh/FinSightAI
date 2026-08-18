from typing import Protocol, List, Dict, Any, Optional
from datetime import datetime

class MarketDataProvider(Protocol):
    async def get_daily_bars(self, ticker: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        ...
        
    async def get_snapshot(self, ticker: str) -> Dict[str, Any]:
        ...

class NewsProvider(Protocol):
    async def search_news(self, ticker: str = None, topic: str = None, limit: int = 50) -> Dict[str, Any]:
        ...

class FinancialDataProvider(Protocol):
    async def get_fundamentals(self, ticker: str) -> Dict[str, Any]:
        ...

class FilingProvider(Protocol):
    async def get_filings(self, ticker: str, form_type: Optional[str] = None) -> List[Dict[str, Any]]:
        ...
        
    async def get_company_facts(self, ticker: str) -> Dict[str, Any]:
        ...
