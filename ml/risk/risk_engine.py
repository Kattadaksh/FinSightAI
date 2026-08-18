from typing import Dict, Any

class FinancialRiskEngine:
    """
    Computes quantitative risk ratings: Financial Health, Market Risk, Competition Risk, and Overall Risk.
    """
    def compute_risk_scores(self, features: Dict[str, float], anomaly_data: Dict[str, Any]) -> Dict[str, Any]:
        margin = features.get("profit_margin", 20.0)
        debt = features.get("debt_equity", 0.5)
        growth = features.get("revenue_growth_yoy", 15.0)
        anomaly_score = anomaly_data.get("anomaly_score", 0)

        # 1. Financial Health Score (0-100, higher is better)
        health_base = 70.0 + (margin * 0.4) - (debt * 15.0)
        financial_health = max(10, min(99, int(health_base)))

        # 2. Market Risk Score (0-100, lower is better)
        market_risk_base = 30.0 + (anomaly_score * 0.3) + (features.get("sentiment_volatility", 0.1) * 50)
        market_risk = max(10, min(95, int(market_risk_base)))

        # 3. Competition Risk Score (0-100, lower is better)
        competition_base = 45.0 + (features.get("pe_ratio", 25.0) * 0.2)
        competition_risk = max(15, min(90, int(competition_base)))

        # 4. Overall Risk Score (0-100, composite weighted rating)
        overall_risk = int((100 - financial_health) * 0.4 + market_risk * 0.3 + competition_risk * 0.3)

        return {
            "scores": [
                {"label": "Financial Health", "value": financial_health, "color": "var(--success)" if financial_health >= 70 else "var(--warning)"},
                {"label": "Market Risk", "value": market_risk, "color": "var(--success)" if market_risk < 50 else "var(--warning)"},
                {"label": "Competition Risk", "value": competition_risk, "color": "var(--success)" if competition_risk < 50 else "var(--warning)"},
                {"label": "Overall Risk", "value": overall_risk, "color": "var(--success)" if overall_risk < 50 else "var(--warning)"}
            ],
            "financial_health": financial_health,
            "market_risk": market_risk,
            "competition_risk": competition_risk,
            "overall_risk": overall_risk
        }
