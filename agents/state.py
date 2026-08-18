from typing import TypedDict, List, Dict, Any, Optional

class FinancialResearchState(TypedDict):
    """
    LangGraph state schema for multi-agent financial research workflows.
    Tracks state across planner, sec_research, news_research, analyst_synthesis, and fact_checker nodes.
    """
    query: str
    ticker: str
    research_plan: List[str]
    sec_filings: List[Dict[str, Any]]
    company_facts: Dict[str, Any]
    news_articles: List[Dict[str, Any]]
    report_markdown: str
    verification_status: str
    sources: List[Dict[str, Any]]
    execution_steps: List[str]
    human_feedback: Optional[str]
