import httpx
import os
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class SECClient:
    def __init__(self):
        self.base_url = "https://data.sec.gov"
        self.user_agent = os.getenv("SEC_USER_AGENT", "FinSightAI/1.0 (contact@example.com)")
        self.headers = {
            "User-Agent": self.user_agent,
            "Accept-Encoding": "gzip, deflate"
        }
        
    async def get(self, endpoint: str) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=self.headers, timeout=10.0)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error occurred while calling SEC API: {e}")
                raise
            except Exception as e:
                logger.error(f"An error occurred while calling SEC API: {e}")
                raise
