from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class SECFiling(BaseModel):
    provider: str = "SEC"
    source_type: str
    ticker: str
    cik: str
    form_type: str
    accession_number: str
    filing_date: str
    reporting_period: Optional[str] = None
    document_url: str
    retrieved_at: str

class SECCompanyFact(BaseModel):
    provider: str = "SEC"
    ticker: str
    cik: str
    metric: str
    value: float
    unit: str
    period: str
    filing_date: str
    source_url: str
    retrieved_at: str
