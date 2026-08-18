import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend")))

from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_company_overview():
    response = client.get("/api/companies/NVDA/overview")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert data.get("ticker") == "NVDA"

def test_non_fortune_500_ticker_rejected():
    response = client.get("/api/companies/RELIANCE/overview")
    assert response.status_code == 404
    response_paytm = client.get("/api/companies/PAYTM/overview")
    assert response_paytm.status_code == 404

def test_ml_analysis_endpoint():
    response = client.post("/api/analyst/ml-analysis", json={"ticker": "NVDA"})
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "NVDA"
    assert "anomaly_analysis" in data
    assert "risk_analysis" in data

def test_user_registration_and_login():
    import uuid
    random_email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    reg_response = client.post("/api/auth/register", json={"email": random_email, "password": "password123"})
    assert reg_response.status_code == 200
    assert reg_response.json()["email"] == random_email

    login_response = client.post("/api/auth/login", data={"username": random_email, "password": "password123"})
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()

def test_hitl_research_workflow():
    # 1. Start research - should return PENDING_HUMAN_REVIEW status and a thread_id
    response = client.post("/api/analyst/research", json={"ticker": "NVDA", "query": "Test query"})
    assert response.status_code == 200
    data = response.json()
    assert data["verification_status"] == "PENDING_HUMAN_REVIEW"
    assert "thread_id" in data
    thread_id = data["thread_id"]
    
    # 2. Resume research with approval
    resume_response = client.post(
        "/api/analyst/research/resume",
        json={"thread_id": thread_id, "approve": True}
    )
    assert resume_response.status_code == 200
    resume_data = resume_response.json()
    assert resume_data["verification_status"] == "VERIFIED_SEC_EDGAR"
    assert "report_markdown" in resume_data

def test_streaming_research_workflow():
    # Test initial streaming endpoint
    response = client.post("/api/analyst/research/stream", json={"ticker": "NVDA", "query": "Test stream"})
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    
    content = response.text
    assert '"event": "step"' in content
    assert '"event": "result"' in content
    assert "PENDING_HUMAN_REVIEW" in content

def test_streaming_resume_workflow():
    # Test resume streaming endpoint
    response = client.post(
        "/api/analyst/research/resume/stream",
        json={"thread_id": "thread_test123", "approve": True}
    )
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    
    content = response.text
    assert '"event": "step"' in content or '"event": "result"' in content

