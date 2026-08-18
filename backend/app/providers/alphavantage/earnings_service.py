from typing import List, Dict, Any
from .client import AlphaVantageClient

class AlphaVantageEarningsService:
    def __init__(self):
        self.client = AlphaVantageClient()

    async def get_earnings(self, ticker: str) -> Dict[str, Any]:
        params = {
            "function": "EARNINGS",
            "symbol": ticker.upper()
        }
        return await self.client.get(params)
