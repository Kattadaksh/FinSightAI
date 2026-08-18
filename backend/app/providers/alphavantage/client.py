import httpx
import os
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class AlphaVantageClient:
    def __init__(self):
        from dotenv import load_dotenv
        env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", ".env"))
        load_dotenv(env_path)
        load_dotenv()
        self.base_url = "https://www.alphavantage.co/query"
        self.api_key = os.getenv("ALPHA_VANTAGE_API_KEY", "demo")
        
    async def get(self, params: Dict[str, Any]) -> Dict[str, Any]:
        params["apikey"] = self.api_key
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(self.base_url, params=params, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                
                if "Error Message" in data:
                    raise Exception(data["Error Message"])
                    
                return data
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error occurred while calling Alpha Vantage: {e}")
                raise
            except Exception as e:
                logger.error(f"Error calling Alpha Vantage: {e}")
                raise
