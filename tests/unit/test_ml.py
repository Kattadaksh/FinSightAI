import pytest
from ml.features.feature_extractor import FinancialFeatureExtractor
from ml.anomaly.detector import FinancialAnomalyDetector
from ml.risk.risk_engine import FinancialRiskEngine
from ml.prediction.model import ValuationPredictor

def test_financial_feature_extractor():
    extractor = FinancialFeatureExtractor()
    features = extractor.extract_features("NVDA")
    assert isinstance(features, dict)
    assert "pe_ratio" in features
    assert "profit_margin" in features
    assert "roe" in features
    assert features["pe_ratio"] > 0

def test_financial_anomaly_detector():
    features = {
        "pe_ratio": 72.4,
        "profit_margin": 12.0,
        "debt_equity": 1.5,
        "revenue_growth_yoy": 60.0,
        "sentiment_volatility": 0.25
    }
    detector = FinancialAnomalyDetector()
    result = detector.detect_anomalies(features)
    assert "anomalies" in result
    assert "anomaly_score" in result
    assert "anomalies_count" in result
    assert len(result["anomalies"]) > 0

def test_financial_risk_engine():
    features = {
        "profit_margin": 45.0,
        "debt_equity": 0.2,
        "revenue_growth_yoy": 100.0,
        "pe_ratio": 70.0,
        "sentiment_volatility": 0.1
    }
    anomaly_data = {"anomaly_score": 30}
    engine = FinancialRiskEngine()
    risk = engine.compute_risk_scores(features, anomaly_data)
    assert "scores" in risk
    assert "financial_health" in risk
    assert "overall_risk" in risk
    assert 0 <= risk["financial_health"] <= 100

def test_valuation_predictor():
    predictor = ValuationPredictor()
    features = {"pe_ratio": 50.0, "revenue_growth_yoy": 30.0}
    valuation = predictor.predict_valuation("NVDA", features)
    assert isinstance(valuation, dict)
    assert "fair_pe_estimate" in valuation or "valuation_status" in valuation
