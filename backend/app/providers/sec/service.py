from typing import List, Dict, Any, Optional
from datetime import datetime
import json
from .client import SECClient
from .schemas import SECFiling

import httpx
import logging

logger = logging.getLogger(__name__)

class SECFilingService:
    def __init__(self):
        self.client = SECClient()
        self.mock_ciks = {
            "NVDA": "0001045810",
            "AAPL": "0000320193",
            "MSFT": "0000789019",
            "GOOGL": "0001652044",
            "AMZN": "0001018724",
            "TSLA": "0001318605",
            "META": "0001326801",
            "NFLX": "0001065280",
            "INTC": "0000050863",
            "AMD": "0000002488"
        }
        self.ticker_to_cik_cache = {}
        self._initialized = False

    async def _initialize_ticker_map(self):
        if self._initialized:
            return
        try:
            url = "https://www.sec.gov/files/company_tickers.json"
            async with httpx.AsyncClient() as client:
                headers = {
                    "User-Agent": self.client.user_agent,
                    "Accept-Encoding": "gzip, deflate"
                }
                res = await client.get(url, headers=headers, timeout=10.0)
                if res.status_code == 200:
                    data = res.json()
                    mapping = {}
                    for item in data.values():
                        t = item["ticker"].upper()
                        c = str(item["cik_str"]).zfill(10)
                        mapping[t] = c
                    self.ticker_to_cik_cache = mapping
                    self._initialized = True
        except Exception as e:
            logger.error(f"Failed to fetch company_tickers.json from SEC: {e}")

    async def _get_cik(self, ticker: str) -> Optional[str]:
        t_upper = ticker.upper()
        if t_upper in self.mock_ciks:
            return self.mock_ciks[t_upper]
            
        await self._initialize_ticker_map()
        if t_upper in self.ticker_to_cik_cache:
            return self.ticker_to_cik_cache[t_upper]
            
        return None

    async def get_filings(self, ticker: str, form_type: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            cik = await self._get_cik(ticker)
            if not cik:
                return []
                
            endpoint = f"/submissions/CIK{cik}.json"
            data = await self.client.get(endpoint)
            
            recent_filings = data.get("filings", {}).get("recent", {})
            if not recent_filings:
                return []
                
            results = []
            for i in range(len(recent_filings.get("accessionNumber", []))):
                current_form = recent_filings.get("form", [])[i]
                
                if form_type and current_form != form_type:
                    continue
                    
                accession = recent_filings.get("accessionNumber", [])[i]
                primary_doc = recent_filings.get("primaryDocument", [])[i]
                accession_no_dashes = accession.replace("-", "")
                doc_url = f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{accession_no_dashes}/{primary_doc}"
                
                filing = SECFiling(
                    source_type=current_form,
                    ticker=ticker.upper(),
                    cik=cik,
                    form_type=current_form,
                    accession_number=accession,
                    filing_date=recent_filings.get("filingDate", [])[i],
                    reporting_period=recent_filings.get("reportDate", [])[i],
                    document_url=doc_url,
                    retrieved_at=datetime.utcnow().isoformat()
                )
                results.append(filing.model_dump())
                
            return results
        except Exception as e:
            raise e

    async def get_company_facts(self, ticker: str) -> Dict[str, Any]:
        cik = await self._get_cik(ticker)
        if not cik:
            return {}
        endpoint = f"/api/xbrl/companyfacts/CIK{cik}.json"
        data = await self.client.get(endpoint)
        return data
