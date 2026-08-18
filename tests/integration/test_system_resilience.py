import pytest
import sys
import os
import json
import httpx
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.main import app
from app.db import engine
from agents.planner.graph import analyst_synthesis_node, research_stream_generator

client = TestClient(app)

@pytest.mark.asyncio
async def test_llm_fallback_chain():
    # Test fallback chain: Gemini fails -> Claude fails -> Local Markdown Report fallback
    state = {
        "ticker": "NVDA",
        "query": "Test fallback",
        "sec_filings": [{"form_type": "10-K", "filing_date": "2026-01-01", "document_url": "url1"}],
        "news_articles": [{"provider_sentiment": "Bullish"}],
        "execution_steps": []
    }
    
    # Temporarily clean API keys in environ to force local markdown report
    with patch.dict(os.environ, {"OPENAI_API_KEY": "", "GEMINI_API_KEY": "", "ANTHROPIC_API_KEY": ""}):
        result = await analyst_synthesis_node(state)
        assert "report_markdown" in result
        assert "⚠️ AI Analyst Offline" in result["report_markdown"]
        assert "No valid API keys found" in result["report_markdown"]

@pytest.mark.asyncio
async def test_stream_generator_error_yield():
    # Test that a streaming exception yields event: error SSE event
    with patch("agents.planner.graph.build_research_graph") as mock_build:
        mock_graph = MagicMock()
        # Mock astream to raise an Exception
        async def mock_astream(*args, **kwargs):
            raise ValueError("Test stream fail")
            yield {} # Generator type requirement
        mock_graph.astream = mock_astream
        mock_build.return_value = mock_graph
        
        events = []
        async for event in research_stream_generator("NVDA", "query", "thread_id"):
            events.append(event)
            
        # Verify that the error event was yielded
        error_event = next((e for e in events if "event" in e and "error" in e), None)
        assert error_event is not None
        assert "Test stream fail" in error_event

def test_sqlite_wal_mode_active():
    # Test that SQLite engine runs in Write-Ahead Logging (WAL) mode
    from sqlalchemy import text
    with engine.connect() as conn:
        res = conn.execute(text("PRAGMA journal_mode")).scalar()
        assert res.lower() == "wal"

def test_cookie_auth_workflow():
    # Verify secure httpOnly cookie authentication resolution
    import uuid
    random_email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    
    # 1. Register
    reg_response = client.post("/api/auth/register", json={"email": random_email, "password": "password123"})
    assert reg_response.status_code == 200
    
    # 2. Login
    login_response = client.post("/api/auth/login", data={"username": random_email, "password": "password123"})
    assert login_response.status_code == 200
    
    # Assert cookie is present
    cookies = login_response.cookies
    assert "access_token" in cookies
    
    # 3. Test request using cookie
    # Setting the cookie in TestClient jar
    client.cookies.set("access_token", cookies["access_token"])
    profile_response = client.get("/api/companies/NVDA/overview")
    assert profile_response.status_code == 200

def test_split_chunk_reassembly_logic():
    # Simulate client split-line SSE reassembly logic in Python to verify correctness
    split_chunks = [
        'data: {"event": "step"',
        ', "step": "done"}\n\n'
    ]
    
    received_events = []
    partial_chunk = ''
    
    for chunk in split_chunks:
        lines = (partial_chunk + chunk).split('\n')
        partial_chunk = lines.pop()
        
        for line in lines:
            trimmed = line.strip()
            if trimmed.startswith('data: '):
                event_data = json.loads(trimmed[6:])
                received_events.append(event_data)
                
    assert len(received_events) == 1
    assert received_events[0] == {"event": "step", "step": "done"}

def test_rollback_endpoints_workflow():
    # 1. GET checkpoints on non-existent thread returns 404
    non_existent_response = client.get("/api/analyst/research/thread_nonexistent/checkpoints")
    assert non_existent_response.status_code == 404
    
    # 2. Run graph to first checkpoint
    res = client.post("/api/analyst/research", json={"ticker": "NVDA", "query": "Rollback test query"})
    assert res.status_code == 200
    data = res.json()
    assert data["verification_status"] == "PENDING_HUMAN_REVIEW"
    thread_id = data["thread_id"]
    
    # 3. GET checkpoints list - should contain at least 1 checkpoint
    cp_response = client.get(f"/api/analyst/research/{thread_id}/checkpoints")
    assert cp_response.status_code == 200
    checkpoints = cp_response.json()
    assert len(checkpoints) >= 1
    
    first_checkpoint_id = checkpoints[-1]["checkpoint_id"]
    
    # 4. Advance state by requesting revisions (adds a checkpoint)
    rev_response = client.post(
        "/api/analyst/research/resume",
        json={"thread_id": thread_id, "approve": False, "feedback": "Revision 1"}
    )
    assert rev_response.status_code == 200
    
    # Checkpoints list should now have more checkpoints
    cp_response_2 = client.get(f"/api/analyst/research/{thread_id}/checkpoints")
    assert cp_response_2.status_code == 200
    checkpoints_2 = cp_response_2.json()
    assert len(checkpoints_2) > len(checkpoints)
    
    # 5. Rollback to first checkpoint_id
    rollback_response = client.post(
        f"/api/analyst/research/{thread_id}/rollback",
        json={"checkpoint_id": first_checkpoint_id}
    )
    assert rollback_response.status_code == 200
    rb_data = rollback_response.json()
    assert rb_data["restored_from_checkpoint"] == first_checkpoint_id
    
    # 6. Reverting with invalid checkpoint ID should return 400 or 404
    invalid_rb = client.post(
        f"/api/analyst/research/{thread_id}/rollback",
        json={"checkpoint_id": "checkpoint_invalid"}
    )
    assert invalid_rb.status_code in [400, 404]
    
    # 7. Cross-thread state rollback: rollback using another thread's thread_id but first thread's checkpoint_id should return 400
    res_2 = client.post("/api/analyst/research", json={"ticker": "NVDA", "query": "Second thread"})
    assert res_2.status_code == 200
    thread_id_2 = res_2.json()["thread_id"]
    
    cross_thread_rb = client.post(
        f"/api/analyst/research/{thread_id_2}/rollback",
        json={"checkpoint_id": first_checkpoint_id}
    )
    assert cross_thread_rb.status_code == 400
