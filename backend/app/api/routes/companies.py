from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from ...dependencies import get_filing_provider, get_news_provider
from ...providers.interfaces import FilingProvider, NewsProvider
from ...providers.company_metadata import get_company_overview_data

router = APIRouter()

@router.get("/{ticker}/overview")
async def get_overview(ticker: str):
    try:
        data = get_company_overview_data(ticker)
        if not data:
            raise HTTPException(status_code=404, detail=f"Company with ticker {ticker} not found.")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ticker}/financials")
async def get_financials(ticker: str, provider: FilingProvider = Depends(get_filing_provider)):
    try:
        filings = await provider.get_filings(ticker)
        cik = await provider._get_cik(ticker)
        cik_status = "ok" if cik else "unmapped"
        return {"ticker": ticker, "filings": filings, "cik_status": cik_status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ticker}/news")
async def get_news(ticker: str, provider: NewsProvider = Depends(get_news_provider)):
    try:
        res = await provider.search_news(ticker=ticker)
        return {
            "ticker": ticker,
            "news": res.get("news", []),
            "status": res.get("status", "ok"),
            "message": res.get("message")
        }
    except Exception as e:
        return {"ticker": ticker, "news": [], "status": "error", "message": str(e)}

