from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import sys
import os

# Ensure agents and root path are accessible
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from agents.planner.graph import (
    run_financial_research, 
    resume_financial_research, 
    research_stream_generator, 
    resume_research_stream_generator,
    build_research_graph
)
from ml.features.feature_extractor import FinancialFeatureExtractor
from ml.anomaly.detector import FinancialAnomalyDetector
from ml.risk.risk_engine import FinancialRiskEngine
from ml.prediction.model import ValuationPredictor
from fastapi.responses import StreamingResponse

router = APIRouter()

class ResearchRequest(BaseModel):
    ticker: str
    query: Optional[str] = "Generate comprehensive financial research report"

class ResumeResearchRequest(BaseModel):
    thread_id: str
    approve: bool
    feedback: Optional[str] = None

class RollbackRequest(BaseModel):
    checkpoint_id: str

class MLAnalysisRequest(BaseModel):
    ticker: str

@router.post("/research")
async def execute_research(request: ResearchRequest):
    try:
        ticker = request.ticker.strip().upper()
        if not ticker:
            raise HTTPException(status_code=400, detail="Ticker symbol is required.")
            
        import uuid
        thread_id = f"thread_{uuid.uuid4().hex[:12]}"
        
        result = await run_financial_research(ticker=ticker, query=request.query, thread_id=thread_id)
        
        return {
            "ticker": ticker,
            "query": request.query,
            "thread_id": thread_id,
            "report_markdown": result.get("report_markdown", ""),
            "research_plan": result.get("research_plan", []),
            "verification_status": result.get("verification_status", "UNKNOWN"),
            "sources": result.get("sources", []),
            "execution_steps": result.get("execution_steps", []),
            "sec_filings_count": len(result.get("sec_filings", [])),
            "news_articles_count": len(result.get("news_articles", []))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analyst agent research failed: {str(e)}")

@router.post("/research/resume")
async def resume_research(request: ResumeResearchRequest):
    try:
        # If user approved, we ignore feedback input. Otherwise, we pass it to graph
        feedback = request.feedback if not request.approve else None
        
        result = await resume_financial_research(thread_id=request.thread_id, feedback=feedback)
        
        return {
            "report_markdown": result.get("report_markdown", ""),
            "verification_status": result.get("verification_status", "UNKNOWN"),
            "sources": result.get("sources", []),
            "execution_steps": result.get("execution_steps", []),
            "sec_filings_count": len(result.get("sec_filings", [])),
            "news_articles_count": len(result.get("news_articles", []))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analyst agent research resume failed: {str(e)}")

@router.post("/research/stream")
async def execute_research_stream(request: ResearchRequest):
    try:
        ticker = request.ticker.strip().upper()
        if not ticker:
            raise HTTPException(status_code=400, detail="Ticker symbol is required.")
            
        import uuid
        thread_id = f"thread_{uuid.uuid4().hex[:12]}"
        
        return StreamingResponse(
            research_stream_generator(ticker=ticker, query=request.query, thread_id=thread_id),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analyst agent research streaming failed: {str(e)}")

@router.post("/research/resume/stream")
async def resume_research_stream(request: ResumeResearchRequest):
    try:
        feedback = request.feedback if not request.approve else None
        
        return StreamingResponse(
            resume_research_stream_generator(thread_id=request.thread_id, feedback=feedback),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analyst agent research resume streaming failed: {str(e)}")

@router.get("/research/{thread_id}/checkpoints")
async def get_checkpoints(thread_id: str):
    from datetime import datetime
    try:
        compiled_graph = build_research_graph()
        if compiled_graph is None:
            raise HTTPException(status_code=500, detail="State graph checkpointer is not available.")
            
        config = {"configurable": {"thread_id": thread_id}}
        checkpoints = []
        
        async for state in compiled_graph.aget_state_history(config):
            checkpoint_id = state.config.get("configurable", {}).get("checkpoint_id")
            if not checkpoint_id:
                continue
                
            next_nodes = list(state.next)
            feedback = state.values.get("human_feedback")
            
            if feedback:
                label = f"Revision Request: '{feedback[:30]}...'"
            elif not state.next:
                label = "Report Finalized"
            elif "fact_checker" in state.next:
                label = "Draft Report Ready"
            else:
                label = f"Processed {', '.join(state.next) if state.next else 'Agent Node'}"
                
            timestamp = state.metadata.get("created_at") if state.metadata else None
            
            checkpoints.append({
                "checkpoint_id": checkpoint_id,
                "next_nodes": next_nodes,
                "label": label,
                "timestamp": timestamp or datetime.utcnow().isoformat()
            })
            
        if not checkpoints:
            raise HTTPException(status_code=404, detail="No checkpoint history found for this thread_id.")
            
        return checkpoints
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch checkpoints: {str(e)}")

@router.post("/research/{thread_id}/rollback")
async def rollback_research(thread_id: str, request: RollbackRequest):
    try:
        compiled_graph = build_research_graph()
        if compiled_graph is None:
            raise HTTPException(status_code=500, detail="State graph checkpointer is not available.")
            
        current_config = {"configurable": {"thread_id": thread_id}}
        
        target_snapshot = None
        async for state in compiled_graph.aget_state_history(current_config):
            cid = state.config.get("configurable", {}).get("checkpoint_id")
            if cid == request.checkpoint_id:
                target_snapshot = state
                break
                
        if not target_snapshot:
            raise HTTPException(status_code=400, detail="The checkpoint_id does not belong to this thread_id.")
            
        if target_snapshot.values is None:
            raise HTTPException(status_code=404, detail="Target checkpoint state not found.")
            
        source_node = target_snapshot.metadata.get("source", "analyst_synthesis") if target_snapshot.metadata else "analyst_synthesis"
        valid_nodes = ["planner", "sec_research", "news_research", "analyst_synthesis", "fact_checker"]
        if source_node not in valid_nodes:
            source_node = "analyst_synthesis"
            
        await compiled_graph.aupdate_state(
            current_config,
            target_snapshot.values,
            as_node=source_node
        )
        
        restored_state = target_snapshot.values.copy()
        
        return {
            "restored_from_checkpoint": request.checkpoint_id,
            "ticker": restored_state.get("ticker", ""),
            "query": restored_state.get("query", ""),
            "thread_id": thread_id,
            "report_markdown": restored_state.get("report_markdown", ""),
            "research_plan": restored_state.get("research_plan", []),
            "verification_status": restored_state.get("verification_status", "UNKNOWN"),
            "sources": restored_state.get("sources", []),
            "execution_steps": restored_state.get("execution_steps", []),
            "sec_filings_count": len(restored_state.get("sec_filings", [])) if restored_state.get("sec_filings") else 0,
            "news_articles_count": len(restored_state.get("news_articles", [])) if restored_state.get("news_articles") else 0
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to rollback research state: {str(e)}")



@router.post("/ml-analysis")
async def execute_ml_analysis(request: MLAnalysisRequest):
    try:
        ticker = request.ticker.strip().upper()
        if not ticker:
            raise HTTPException(status_code=400, detail="Ticker symbol is required.")
            
        extractor = FinancialFeatureExtractor()
        features = extractor.extract_features(ticker)
        if not features:
            raise HTTPException(status_code=404, detail=f"Company ticker '{ticker}' was not found on Indian (NSE/BSE) or US (NASDAQ/NYSE) exchanges.")
        
        detector = FinancialAnomalyDetector()
        anomalies_data = detector.detect_anomalies(features)
        
        risk_engine = FinancialRiskEngine()
        risk_data = risk_engine.compute_risk_scores(features, anomalies_data)
        
        predictor = ValuationPredictor()
        valuation_data = predictor.predict_valuation(ticker, features)
        
        return {
            "ticker": ticker,
            "features": features,
            "anomaly_analysis": anomalies_data,
            "risk_analysis": risk_data,
            "valuation_analysis": valuation_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML analysis failed: {str(e)}")
