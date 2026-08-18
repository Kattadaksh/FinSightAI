import pytest
import asyncio
from agents.planner.graph import run_financial_research, planner_node, sec_research_node

@pytest.mark.asyncio
async def test_planner_node():
    state = {"ticker": "NVDA", "query": "Analyze valuation and risk", "execution_steps": []}
    result = await planner_node(state)
    assert "research_plan" in result
    assert len(result["research_plan"]) > 0

@pytest.mark.asyncio
async def test_full_financial_research_pipeline():
    result = await run_financial_research(ticker="NVDA", query="Summary of 2026 performance")
    assert isinstance(result, dict)
    assert "report_markdown" in result
    assert "verification_status" in result
    assert len(result.get("execution_steps", [])) >= 4
