# FinSight AI — Autonomous Financial Research & Intelligence Platform

> **A production-oriented hybrid ML + GenAI + Agentic AI financial research platform that autonomously researches companies, analyzes financial data, evaluates news and filings, runs ML models, verifies claims, detects contradictions, and generates evidence-backed research reports.**

---

## 1. Project Vision

FinSight AI is **not a stock-prediction chatbot**.

It is an autonomous financial research system that combines:

- **Agentic AI** for planning, tool selection, research, reasoning, verification, and iterative investigation.
- **Generative AI** for synthesis, explanations, report generation, and conversational research.
- **RAG** for grounding answers in SEC filings, earnings transcripts, financial documents, and trusted sources.
- **Machine Learning** for sentiment classification, anomaly detection, risk scoring, and quantitative market signals.
- **Traditional financial analysis** for ratios, valuation, DCF, scenario analysis, and competitor comparisons.
- **Human-in-the-loop controls** for low-confidence or high-impact conclusions.
- **Backend engineering** for APIs, persistence, asynchronous workflows, caching, observability, and security.

The core principle is:

> **ML detects and predicts. RAG provides evidence. Agents investigate and reason. LLMs explain and synthesize.**

---

# 2. Primary User Experience

A user should be able to enter a question such as:

> "Analyze NVIDIA and tell me whether its current valuation is justified."

or:

> "Compare NVIDIA and AMD and explain what changed in their competitive positions over the last two quarters."

or:

> "Why did NVIDIA's stock fall recently?"

The system should autonomously determine:

1. What information is required.
2. Which agents/tools are needed.
3. Which documents and data sources should be retrieved.
4. Which ML models should be invoked.
5. Which calculations should be performed.
6. Whether evidence is sufficient.
7. Whether conflicting information exists.
8. Whether more research is required.
9. How confident each conclusion is.
10. How to produce the final evidence-backed report.

---

# 3. Core Architecture

```text
                           USER
                             |
                             v
                    +------------------+
                    | Research Planner |
                    |      Agent       |
                    +--------+---------+
                             |
                 Dynamic Research Plan
                             |
          +------------------+------------------+
          |                  |                  |
          v                  v                  v
   +-------------+    +-------------+    +-------------+
   | SEC / Docs  |    | News Agent  |    | Financial   |
   |    Agent    |    |             |    | Data Agent  |
   +------+------+    +------+------+    +------+------+
          |                  |                  |
          v                  v                  v
      RAG / Docs        Sentiment ML       Financial ML
          |                  |                  |
          +------------------+------------------+
                             |
                 +-----------+-----------+
                 |                       |
                 v                       v
          Competitor Agent        Earnings Agent
                 |                       |
                 +-----------+-----------+
                             |
                             v
                    +------------------+
                    |  Analyst Agent   |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    | Fact Checker     |
                    |     Agent        |
                    +--------+---------+
                             |
                             v
                  +----------------------+
                  | Contradiction /      |
                  | Evidence Validator   |
                  +----------+-----------+
                             |
                    Evidence sufficient?
                       /            \
                     NO              YES
                     |                |
                     v                v
               Re-research       Report Generator
                     |                |
                     +-------+--------+
                             |
                             v
                    Final Research Report
```

---

# 4. Complete Feature List

## 4.1 User Dashboard

### Company Search

Users can search for companies by:

- Company name
- Ticker symbol
- Industry
- Sector

Example:

```text
Search:
[NVIDIA                         🔍]
```

### Company Overview

Display:

- Company name
- Ticker
- Sector
- Industry
- Market capitalization
- Current/last available price
- Revenue
- Net income
- EPS
- P/E
- P/S
- EV/EBITDA
- ROE
- ROA
- Free cash flow
- Debt/equity
- Revenue growth
- Profit margin

### AI Scores

Display normalized scores such as:

```text
Financial Health       91/100
Market Risk            42/100
Competition Risk       67/100
Overall Risk           48/100
```

Every score must show:

- Score
- Interpretation
- Supporting factors
- Model/version used
- Timestamp
- Confidence where applicable

---

# 5. Research Query System

Users can ask natural-language research questions.

Examples:

```text
Analyze NVIDIA.

Why did NVIDIA decline recently?

Compare NVIDIA and AMD.

Is NVIDIA's valuation justified?

What are NVIDIA's biggest risks?

What changed since my previous NVIDIA analysis?

What are the major catalysts for NVIDIA?
```

The system should classify the query and dynamically construct a research plan.

---

# 6. Research Planner Agent

The Planner Agent is the entry point for complex research.

### Responsibilities

- Understand the user's question.
- Identify required research areas.
- Select appropriate agents/tools.
- Determine research priority.
- Determine whether ML models are needed.
- Determine whether RAG is needed.
- Define verification requirements.
- Create a structured research plan.

Example:

```json
{
  "query": "Is NVIDIA overvalued?",
  "tasks": [
    "retrieve_latest_financials",
    "calculate_valuation_ratios",
    "run_dcf",
    "compare_competitor_valuations",
    "analyze_growth",
    "analyze_recent_news",
    "run_ml_risk_model",
    "generate_bull_base_bear_scenarios",
    "verify_final_claims"
  ]
}
```

### Important requirement

Do not implement the system as a permanently fixed:

```text
Agent A -> Agent B -> Agent C
```

The planner should dynamically determine which agents are required.

---

# 7. Financial Data Agent

The Financial Data Agent retrieves and normalizes structured financial data.

### Metrics

- Revenue
- Gross profit
- Operating income
- Net income
- EPS
- EBITDA
- Free cash flow
- Cash
- Debt
- Assets
- Liabilities
- Equity
- Shares outstanding
- Market capitalization

### Calculated ratios

- Revenue growth
- EPS growth
- Gross margin
- Operating margin
- Net margin
- ROE
- ROA
- Debt/equity
- Current ratio
- Free cash flow margin
- FCF growth

### Historical analysis

Compare:

- QoQ
- YoY
- 3-year trend
- 5-year trend
- Industry/competitor benchmarks

---

# 8. SEC / Financial Document Agent

The system should ingest and analyze:

- Annual reports
- Quarterly reports
- SEC filings
- Earnings releases
- Investor presentations
- Earnings-call transcripts
- Other trusted financial documents

### RAG pipeline

```text
Document
   |
Parser
   |
Cleaner
   |
Chunker
   |
Metadata extraction
   |
Embedding model
   |
Vector database
   |
Retriever
   |
LLM
```

Each document chunk should retain metadata:

- Company
- Document type
- Filing date
- Reporting period
- Section
- Source URL
- Page/section reference where available

---

# 9. Evidence-Based RAG

Every important answer should be grounded in retrieved evidence.

Example:

```text
Claim:
Revenue increased significantly.

Evidence:
Q4 Annual Report
Section: Revenue
Period: FY2026

Confidence:
97%
```

The system should support:

- Source citations
- Evidence snippets
- Document metadata
- Retrieval scores
- Claim-to-source relationships

Avoid unsupported LLM statements.

---

# 10. News Research Agent

The News Agent retrieves relevant financial news.

### Pipeline

```text
News Sources
    |
Retriever
    |
Relevance Filter
    |
Deduplication
    |
Sentiment ML
    |
LLM Financial Impact Analysis
    |
Evidence Store
```

### Features

- Recent news search
- News relevance ranking
- Duplicate article detection
- Event clustering
- Positive/negative/neutral classification
- Financial impact estimation
- Catalyst detection
- Risk detection
- News timeline

---

# 11. Financial Sentiment ML

Implement a financial sentiment classifier.

### Classes

```text
POSITIVE
NEUTRAL
NEGATIVE
```

Possible implementation:

- FinBERT baseline
- Optional custom classifier
- Logistic Regression / XGBoost comparison
- Confidence probability

Example:

```text
Article sentiment:
POSITIVE

Confidence:
0.91

LLM interpretation:
Positive catalyst for data-center demand.
```

The ML model should provide a quantitative signal while the LLM explains the financial implications.

---

# 12. Stock / Market Signal ML

Implement a quantitative ML pipeline.

### Candidate features

#### Price features

- Open
- High
- Low
- Close
- Adjusted close
- Returns
- Rolling volatility
- Moving averages
- RSI
- MACD
- Momentum
- Volume

#### Fundamental features

- Revenue growth
- EPS growth
- P/E
- P/S
- EV/EBITDA
- ROE
- Debt/equity
- FCF
- Profit margin

#### Sentiment features

- Average news sentiment
- Positive article percentage
- Negative article percentage
- News volume
- Sentiment momentum

### Prediction

Prefer probabilistic classification instead of direct investment instructions:

```text
Probability of significant upside: 0.63
Probability of neutral movement:   0.22
Probability of downside:            0.15
```

Possible model:

- XGBoost
- Random Forest baseline
- Logistic Regression baseline
- Optional LSTM/Temporal model for experimentation

### Important ML requirements

Use:

- Time-based train/validation/test split
- No future-data leakage
- Feature versioning
- Model versioning
- Evaluation metrics
- Backtesting
- Calibration analysis

---

# 13. Financial Anomaly Detection

Use ML to detect unusual behavior in financial data.

### Detect anomalies in

- Revenue
- Margins
- EPS
- Free cash flow
- Debt
- Trading volume
- Price movement
- Valuation multiples

Possible models:

- Isolation Forest
- Statistical z-score baseline
- Autoencoder for advanced version

Example:

```text
ANOMALY DETECTED

Operating margin is significantly outside
the historical distribution.

Anomaly score: 0.91
```

Then the agent must investigate the anomaly.

```text
ML anomaly
    |
    v
Research Agent
    |
    +--> SEC documents
    +--> Earnings call
    +--> News
    +--> Financial data
    |
    v
Explanation
```

---

# 14. Earnings Analysis Agent

Analyze earnings reports and transcripts.

Extract:

### Management guidance

- Revenue outlook
- EPS outlook
- Margin outlook
- CapEx
- Demand outlook
- Supply expectations

### Management concerns

- Competition
- Regulation
- Supply chain
- Pricing
- Customer concentration
- Macro conditions
- Product risks

### Analyst questions

Identify:

- Repeated concerns
- Important unanswered questions
- Topics with increasing attention

---

# 15. Management Sentiment Tracking

Compare management language over time.

Example:

```text
Q1:
"Strong demand"

Q2:
"Healthy demand"

Q3:
"Demand remains solid"

Q4:
"Demand environment is uncertain"
```

The system should detect a shift toward cautious language.

Features:

- Quarter-to-quarter comparison
- Sentiment trend
- Keyword trend
- Guidance change detection
- Confidence level
- Supporting transcript evidence

---

# 16. Competitor Analysis Agent

Automatically identify relevant competitors.

Example:

```text
NVIDIA
  |
  +-- AMD
  +-- Intel
  +-- Other relevant competitors
```

Compare:

- Revenue
- Revenue growth
- Gross margin
- Operating margin
- Net margin
- P/E
- P/S
- EV/EBITDA
- FCF
- ROE
- Debt/equity
- Market cap

The agent should produce both:

1. Quantitative comparison.
2. Qualitative competitive analysis.

---

# 17. Valuation Engine

Implement quantitative valuation.

### Multiples

- P/E
- P/S
- EV/EBITDA
- PEG

### DCF

```text
Revenue forecast
      |
Operating assumptions
      |
Free cash flow
      |
Discount rate
      |
Terminal value
      |
Enterprise value
      |
Equity value
      |
Intrinsic value
```

Display:

```text
Current Price:       $XXX
Estimated Value:     $XXX
Potential Difference: XX%
```

Every DCF output must show its assumptions.

---

# 18. Bull / Base / Bear Scenario Engine

Generate three scenarios.

## Bull

- Strong revenue growth
- Strong margins
- Strong demand
- Favorable competition
- Positive catalysts

## Base

- Expected growth
- Normal margins
- Expected competitive conditions
- Current consensus-like assumptions where available

## Bear

- Lower growth
- Margin compression
- Strong competition
- Regulatory/macro risks
- Negative catalysts

Show:

```text
Scenario     Growth     Margin     Estimated Value
Bull         XX%        XX%        $XXX
Base         XX%        XX%        $XXX
Bear         XX%        XX%        $XXX
```

Do not hide assumptions.

---

# 19. Risk Scoring ML

Build a risk model using features such as:

- Volatility
- Maximum drawdown
- Debt/equity
- Interest coverage
- Revenue volatility
- Margin volatility
- Valuation
- Liquidity
- Competition indicators
- Negative sentiment
- Regulatory events

Output:

```text
Financial Risk       18/100
Market Risk          62/100
Liquidity Risk       21/100
Competition Risk     71/100
Valuation Risk       68/100

Overall Risk         54/100
```

The LLM should explain the score using model features and evidence.

---

# 20. Analyst Agent

The Analyst Agent synthesizes:

- Financial data
- SEC evidence
- News
- Earnings
- Competitors
- ML signals
- Valuation
- Risk scores
- Historical trends

It should produce structured conclusions.

The Analyst Agent must never invent numbers.

All numeric claims should originate from:

- Database
- Financial calculation engine
- ML output
- Retrieved evidence

---

# 21. Fact Checker Agent

The Fact Checker validates every major claim.

Pipeline:

```text
Analyst Claim
     |
Evidence Retrieval
     |
Source Verification
     |
Numerical Verification
     |
Classification
```

Statuses:

```text
VERIFIED
PARTIALLY_SUPPORTED
UNSUPPORTED
CONTRADICTED
```

Example:

```text
Claim:
Revenue grew 40%.

Status:
VERIFIED

Source:
Annual Report

Confidence:
0.97
```

If unsupported, the workflow should trigger additional research.

---

# 22. Contradiction Detection

Detect conflicts between:

- News sources
- SEC filings
- Earnings calls
- Financial datasets
- Analyst conclusions
- ML signals

Example:

```text
Source A:
Demand is increasing.

Source B:
Management expects demand uncertainty.

CONTRADICTION DETECTED
```

The system should:

1. Record both claims.
2. Compare source authority.
3. Check timestamps.
4. Search for additional evidence.
5. Ask the Resolution Agent to reconcile them.
6. Explain the final interpretation.

---

# 23. Confidence Scoring

Every major conclusion should have:

- Confidence score
- Evidence count
- Source quality
- Model confidence
- Contradiction count
- Recency
- Uncertainty explanation

Example:

```text
Revenue outlook: 87%

Evidence:
✓ SEC filing
✓ Earnings call
✓ Financial data
✓ News
✓ ML sentiment

Uncertainty:
Future macroeconomic conditions.
```

---

# 24. Research Memory

Persist research history.

Example:

```text
NVIDIA
 |
 +-- July Research
 +-- August Research
 +-- September Research
```

Allow:

> "What changed since my previous analysis?"

Compare:

- Financial metrics
- Valuation
- News
- Sentiment
- Management language
- ML predictions
- Risks
- Competitor position

---

# 25. Research Chat

After a report is generated, users can ask follow-up questions.

Examples:

```text
Why do you think NVIDIA is expensive?

Show me the evidence.

Which risk has the highest confidence?

What changed from last quarter?

Prove that AI demand is the main catalyst.

What assumptions drive the DCF?
```

The chat must use the current research context and evidence store.

---

# 26. Agent Execution Timeline

Display real-time progress.

Example:

```text
✓ Planner created research plan

✓ Financial Agent retrieved financial data

✓ SEC Agent analyzed annual report

✓ News Agent analyzed 38 articles

✓ Sentiment model classified news

✓ ML model generated quantitative signal

✓ Competitor Agent analyzed AMD

✓ Analyst generated thesis

✓ Fact Checker verified 27 claims

⚠ Contradiction detected

✓ Additional research completed

✓ Final report generated
```

Use streaming through SSE/WebSocket where appropriate.

---

# 27. Human-in-the-Loop

When confidence is low or evidence conflicts:

```text
Research completed.

3 conclusions have low confidence.

[View Evidence]
[Research Again]
[Generate Report]
```

Optional approval points:

- Final thesis
- Low-confidence conclusions
- Contradiction resolution
- DCF assumptions
- Automated watchlist alerts

---

# 28. Watchlist

Users can create a company watchlist.

Example:

```text
My Watchlist

NVIDIA
AMD
Microsoft
Google
Amazon
```

Each company can display:

- Price movement
- Financial health
- Risk score
- News sentiment
- ML signal
- Major events
- Recent research changes

---

# 29. Event Detection

Detect important company events:

- Earnings release
- Earnings call
- Product launch
- Acquisition
- Leadership change
- Regulatory action
- Major contract
- Guidance change
- Major lawsuit/news event
- Significant financial anomaly

Events should be stored and linked to research reports.

---

# 30. Automated Research Reports

Generate reports containing:

1. Executive summary
2. Company overview
3. Financial performance
4. Valuation
5. Competitive position
6. News analysis
7. Earnings analysis
8. ML signals
9. Risk analysis
10. Bull/base/bear scenarios
11. Key catalysts
12. Key risks
13. Final research thesis
14. Confidence/uncertainty
15. Evidence and citations

Export options:

- Markdown
- PDF
- JSON

---

# 31. Source & Evidence Graph

Maintain relationships:

```text
Claim
 |
 +-- Evidence
       |
       +-- Source
       +-- Document
       +-- Date
       +-- Section
```

Optional advanced visualization:

```text
Company
 |
 +-- Revenue Claim
 |     |
 |     +-- 10-K
 |
 +-- Demand Claim
 |     |
 |     +-- Earnings Call
 |     +-- News
 |
 +-- Risk Claim
       |
       +-- SEC Filing
       +-- News
```

---

# 32. Research Audit Trail

Persist:

- User query
- Research plan
- Agent calls
- Tool calls
- Retrieved documents
- ML predictions
- Model versions
- Claims
- Evidence
- Verification results
- Contradictions
- Retries
- Final report

This makes the system explainable and debuggable.

---

# 33. Model & Token Tracking

Track:

- LLM model
- Prompt/version
- Token usage
- Latency
- Estimated cost
- Agent execution time
- ML model version
- Retrieval latency

Dashboard example:

```text
Research Run

LLM calls:       18
Tokens:          42,300
Agent runtime:   31.4 sec
ML runtime:       2.1 sec
Sources:            47
Claims checked:     29
Retries:              2
```

---

# 34. Caching

Use Redis for:

- Financial API responses
- News results
- Company metadata
- Embeddings where appropriate
- Repeated research queries
- Temporary agent state

Use TTLs appropriate to data freshness.

---

# 35. Security

Implement:

- JWT authentication
- Password hashing
- Role-based authorization
- API key management
- Rate limiting
- Input validation
- Secure secrets management
- CORS configuration
- Request logging
- Audit logs

Never expose provider API keys to the frontend.

---

# 36. Observability

Implement:

- Structured logs
- Request IDs
- Research run IDs
- Agent execution logs
- Error tracking
- Latency metrics
- LLM usage metrics
- ML prediction logs
- Database metrics

Every research execution should have a traceable ID.

---

# 37. Error Handling

Agents should handle:

- API failures
- Rate limits
- Missing financial data
- Invalid ticker
- Document parsing failure
- Retrieval failure
- LLM timeout
- ML model failure
- Contradictory data
- Stale data

Use retries with exponential backoff where appropriate.

Do not blindly retry expensive LLM calls.

---

# 38. Fallback Architecture

If one LLM provider fails:

```text
Primary LLM
    |
    X
    |
Fallback LLM
```

Similarly:

```text
Primary Financial Data Provider
        |
        X
        |
Fallback Provider
```

Provider adapters should isolate external API implementations.

---

# 39. Recommended Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- TanStack Query
- React Router

## Backend

### Recommended architecture

```text
React
  |
  v
FastAPI
  |
  +--> Agent Service
  +--> ML Service
  +--> Financial Data Service
  +--> RAG Service
  +--> PostgreSQL
  +--> Redis
  +--> Qdrant
```

Technologies:

- Python
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic
- Celery or an async job system where needed

### Optional Java layer

If demonstrating enterprise backend engineering is a priority:

```text
React
  |
Spring Boot
  |
Python AI/ML Service
```

Use Spring Boot for:

- Authentication
- API gateway/business APIs
- User management
- Research persistence
- Watchlists

Use Python for:

- LangGraph
- ML
- RAG
- Data processing

---

# 40. AI / Agentic Stack

- LangGraph
- LangChain where useful
- Gemini or another capable LLM
- Structured output / JSON schemas
- Tool calling
- Prompt versioning
- Agent state management

The agent workflow should favor **deterministic tools for calculations** and LLMs for reasoning/synthesis.

---

# 41. ML Stack

- Python
- NumPy
- Pandas
- scikit-learn
- XGBoost
- PyTorch
- Transformers
- FinBERT or another financial NLP model
- MLflow for experiment/model tracking (recommended)

---

# 42. RAG Stack

- Document parsers
- Embedding model
- Qdrant
- PostgreSQL metadata store
- Hybrid retrieval if practical
- Reranking model (advanced)

Retrieval should support:

- Semantic search
- Metadata filtering
- Company filtering
- Date filtering
- Document type filtering

---

# 43. Data Storage

## PostgreSQL

Store:

- Users
- Companies
- Financial metrics
- News metadata
- Research reports
- Research runs
- Agent execution logs
- Claims
- Evidence
- Model predictions
- Risk scores
- Watchlists
- Events

## Qdrant

Store:

- Financial document embeddings
- Earnings transcripts
- SEC filing chunks
- Research knowledge chunks

## Redis

Store:

- Cache
- Sessions
- Short-lived agent state
- Job state
- Frequently requested data

---

# 44. Infrastructure

- Docker
- Docker Compose
- GitHub Actions
- Nginx or equivalent reverse proxy
- Environment variables
- CI/CD
- Health checks

Optional production deployment:

- AWS / GCP / Azure
- Managed PostgreSQL
- Managed Redis
- Managed vector database
- Container orchestration

Do not introduce Kubernetes unless the project actually benefits from it.

---

# 45. Suggested Repository Structure

```text
finsight-ai/
|
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── charts/
│   │   └── types/
│   └── package.json
|
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── workers/
│   │   └── main.py
│   └── tests/
|
├── agents/
│   ├── planner/
│   ├── financial/
│   ├── sec/
│   ├── news/
│   ├── competitor/
│   ├── earnings/
│   ├── analyst/
│   ├── fact_checker/
│   └── contradiction/
|
├── ml/
│   ├── sentiment/
│   ├── prediction/
│   ├── anomaly/
│   ├── risk/
│   ├── features/
│   ├── training/
│   ├── evaluation/
│   └── models/
|
├── rag/
│   ├── ingestion/
│   ├── chunking/
│   ├── embeddings/
│   ├── retrieval/
│   └── reranking/
|
├── data/
│   ├── raw/
│   ├── processed/
│   └── samples/
|
├── prompts/
│   ├── planner/
│   ├── analyst/
│   ├── fact_checker/
│   └── report_generator/
|
├── infra/
│   ├── docker/
│   ├── migrations/
│   └── monitoring/
|
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── agent/
│   └── ml/
|
├── docker-compose.yml
├── .env.example
├── README.md
└── LICENSE
```

---

# 46. API Design

Example endpoints:

```text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/companies
GET    /api/companies/{ticker}
GET    /api/companies/{ticker}/financials
GET    /api/companies/{ticker}/news
GET    /api/companies/{ticker}/events
GET    /api/companies/{ticker}/risk
GET    /api/companies/{ticker}/prediction

POST   /api/research
GET    /api/research/{research_id}
GET    /api/research/{research_id}/stream
GET    /api/research/{research_id}/sources
GET    /api/research/{research_id}/claims
GET    /api/research/{research_id}/agents

POST   /api/research/{research_id}/follow-up

POST   /api/compare

GET    /api/watchlist
POST   /api/watchlist
DELETE /api/watchlist/{ticker}

POST   /api/chat
```

---

# 47. Example Agent State

Use structured state rather than passing arbitrary strings between agents.

```python
class ResearchState:
    query: str
    companies: list
    research_plan: list
    financial_data: dict
    documents: list
    news: list
    competitor_data: dict
    ml_predictions: dict
    risk_scores: dict
    claims: list
    evidence: list
    contradictions: list
    confidence_scores: dict
    final_report: dict
```

---

# 48. Example Research Workflow

For:

> "Analyze NVIDIA vs AMD and determine which company has the stronger competitive position."

Expected workflow:

```text
1. Planner
   |
   +--> Identify NVIDIA
   +--> Identify AMD
   +--> Determine research requirements

2. Financial Agent
   |
   +--> Retrieve financials
   +--> Calculate ratios

3. SEC Agent
   |
   +--> Retrieve filings
   +--> Analyze competitive disclosures

4. News Agent
   |
   +--> Retrieve recent news
   +--> Run sentiment model

5. Earnings Agent
   |
   +--> Analyze management guidance
   +--> Compare earnings calls

6. Competitor Agent
   |
   +--> Build comparison

7. ML Agent
   |
   +--> Run sentiment
   +--> Run risk model
   +--> Run anomaly detection
   +--> Generate quantitative signal

8. Analyst
   |
   +--> Synthesize findings

9. Fact Checker
   |
   +--> Verify claims

10. Contradiction Detector
    |
    +--> Detect conflicts

11. If unresolved:
    |
    +--> Research again

12. Report Generator
    |
    +--> Final report
```

---

# 49. ML Evaluation

Do not only display model predictions.

Track model quality.

## Classification

Use:

- Accuracy
- Precision
- Recall
- F1
- ROC-AUC
- PR-AUC
- Calibration

## Regression

Use:

- MAE
- RMSE
- R²

## Time-series/market prediction

Use:

- Walk-forward validation
- Backtesting
- Sharpe-like research metrics where appropriate
- Maximum drawdown
- Hit rate

Avoid random train/test splitting for temporal market data.

---

# 50. Agent Evaluation

Evaluate the agent system separately from ML.

Metrics:

### Research quality

- Source relevance
- Citation correctness
- Claim verification rate
- Unsupported claim rate

### Agent behavior

- Tool selection accuracy
- Plan completion rate
- Retry rate
- Contradiction resolution rate
- Research efficiency

### System performance

- End-to-end latency
- Cost per research run
- Number of LLM calls
- Number of retrieved documents

---

# 51. Testing Strategy

## Unit Tests

Test:

- Financial calculations
- Indicators
- Risk calculations
- DCF
- Data normalization
- ML feature generation

## Integration Tests

Test:

- API → database
- Agent → tools
- RAG → vector database
- ML → agent workflow

## Agent Tests

Create known research questions and verify:

- Correct tools are selected.
- Required evidence is retrieved.
- Unsupported claims are rejected.
- Contradictions trigger additional research.

## ML Tests

Test:

- Feature leakage
- Missing values
- Model serialization
- Prediction schema
- Model versioning

---

# 52. Non-Functional Requirements

The application should be:

### Reliable

- Retry external APIs.
- Gracefully handle missing data.
- Never fabricate unavailable data.

### Explainable

Every major conclusion should answer:

```text
What?
Why?
Evidence?
Confidence?
```

### Observable

Every research run must have an ID and execution trace.

### Secure

No secrets in frontend or Git repository.

### Performant

Use:

- Async I/O
- Redis caching
- Parallel independent agents
- Background jobs for expensive research

### Cost-aware

Do not invoke an LLM when a deterministic calculation or database query is sufficient.

---

# 53. Important Design Principle: Agent vs Tool

Do not make every component an LLM agent.

Use deterministic services where appropriate.

```text
Financial ratio calculation
        -> deterministic Python service

DCF calculation
        -> deterministic Python service

Stock indicators
        -> deterministic Python service

ML prediction
        -> ML model

Document retrieval
        -> RAG service

Research planning
        -> Agent

Financial interpretation
        -> Agent/LLM

Contradiction resolution
        -> Agent/LLM

Report synthesis
        -> Agent/LLM
```

This makes the architecture cheaper, more reliable, and easier to test.

---

# 54. Antigravity Build Prompt

Use the following section as the **master implementation prompt** for Antigravity.

## Master Prompt

```text
You are the lead software architect and implementation engineer for a project called FinSight AI.

Build a production-quality full-stack Autonomous Financial Research & Intelligence Platform.

The application must combine:

1. Agentic AI
2. Generative AI
3. RAG
4. Machine Learning
5. Financial analytics
6. Modern backend engineering
7. A polished React dashboard
8. Observability and testing

CORE PRINCIPLE:

ML detects/predicts patterns.
RAG retrieves evidence.
Agents plan, investigate, reason, verify, and decide what to research next.
LLMs synthesize and explain.
Deterministic services perform financial calculations.

DO NOT build a simple financial chatbot.
DO NOT hard-code a fixed linear chain of agents.
Build a genuine agentic research workflow with dynamic planning, tool selection, verification, contradiction handling, and iterative re-research.

==================================================
TECH STACK
==================================================

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- TanStack Query
- React Router

Backend:
- Python
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic

AI:
- LangGraph
- LangChain where useful
- Gemini or configurable LLM provider
- Structured outputs
- Tool calling

ML:
- Python
- NumPy
- Pandas
- scikit-learn
- XGBoost
- PyTorch
- Transformers
- FinBERT
- MLflow if practical

RAG:
- Qdrant
- Embedding model
- Metadata filtering
- Optional reranking

Database:
- PostgreSQL

Cache / state:
- Redis

Infrastructure:
- Docker
- Docker Compose
- GitHub Actions
- Nginx/reverse proxy if required

==================================================
CORE FEATURES
==================================================

1. AUTHENTICATION

Implement:
- Registration
- Login
- JWT authentication
- Password hashing
- Protected routes
- User-specific watchlists and research history

2. COMPANY SEARCH

Support:
- Company name search
- Ticker search
- Company profile
- Sector
- Industry

3. COMPANY DASHBOARD

Display:
- Current/last available price
- Market cap
- Revenue
- Net income
- EPS
- P/E
- P/S
- EV/EBITDA
- ROE
- ROA
- FCF
- Debt/equity
- Revenue growth
- Profit margins

Display AI/ML scores:
- Financial health
- Market risk
- Competition risk
- Valuation risk
- Overall risk

4. RESEARCH QUERY

Allow natural-language queries such as:

"Analyze NVIDIA."

"Why did NVIDIA fall?"

"Compare NVIDIA and AMD."

"Is NVIDIA overvalued?"

"What changed since last quarter?"

5. RESEARCH PLANNER AGENT

Create a LangGraph planner.

Responsibilities:
- Parse query
- Identify companies
- Decompose the research problem
- Determine required agents/tools
- Determine whether ML is needed
- Determine whether RAG is needed
- Create structured research plan

Do not hard-code every workflow.

6. FINANCIAL DATA AGENT

Retrieve and normalize:
- Revenue
- Net income
- EPS
- EBITDA
- FCF
- Debt
- Cash
- Assets
- Liabilities
- Equity
- Market cap

Calculate:
- Growth
- Margins
- ROE
- ROA
- Debt/equity
- FCF growth

7. SEC/DOCUMENT AGENT

Implement document ingestion and RAG.

Pipeline:
Document -> parser -> cleaner -> chunker -> metadata -> embeddings -> Qdrant -> retrieval -> reranking if available -> LLM

Store metadata:
- Company
- Document type
- Date
- Period
- Section
- Source URL

8. NEWS AGENT

Retrieve relevant financial news.

Pipeline:
News -> relevance -> deduplication -> sentiment ML -> financial impact analysis

Support:
- News search
- News timeline
- Event clustering
- Sentiment
- Catalysts
- Risks

9. SENTIMENT ML

Implement financial sentiment classification:
- Positive
- Neutral
- Negative

Use FinBERT or configurable financial NLP model.

Return:
- label
- probability
- model version

10. MARKET SIGNAL ML

Build an XGBoost-based baseline.

Features:
- Price
- Returns
- Volume
- Volatility
- Moving averages
- RSI
- MACD
- Fundamental ratios
- News sentiment

Output probabilities:
- Upside
- Neutral
- Downside

Do NOT output personalized buy/sell instructions.

Use time-aware validation and prevent future-data leakage.

11. ANOMALY DETECTION

Implement Isolation Forest or equivalent.

Detect unusual:
- Revenue
- Margin
- EPS
- FCF
- Debt
- Volume
- Price movements

When an anomaly is detected, trigger agent research to explain it.

12. EARNINGS AGENT

Analyze:
- Earnings releases
- Earnings calls
- Management guidance
- Analyst questions
- Risks
- Demand outlook
- Margin outlook

13. MANAGEMENT SENTIMENT

Compare management language across quarters.

Detect:
- Increasing confidence
- Decreasing confidence
- Cautious language
- Guidance changes

Provide supporting evidence.

14. COMPETITOR AGENT

Identify competitors and compare:
- Revenue
- Growth
- Margins
- Valuation
- FCF
- ROE
- Debt
- Market cap

15. VALUATION ENGINE

Implement:
- P/E
- P/S
- EV/EBITDA
- PEG
- DCF

DCF must expose assumptions.

16. SCENARIO ENGINE

Generate:
- Bull
- Base
- Bear

Show assumptions and estimated valuation.

17. RISK MODEL

Build a quantitative risk score.

Use:
- Volatility
- Drawdown
- Debt
- Liquidity
- Margin stability
- Revenue volatility
- Valuation
- Sentiment
- Competition

Return normalized risk scores.

18. ANALYST AGENT

Synthesize:
- Financials
- SEC evidence
- News
- Earnings
- Competitors
- ML signals
- Valuation
- Risks

Never invent numerical values.

19. FACT CHECKER AGENT

For every major claim:
- Retrieve evidence
- Verify source
- Verify numerical consistency
- Assign status

Statuses:
VERIFIED
PARTIALLY_SUPPORTED
UNSUPPORTED
CONTRADICTED

20. CONTRADICTION DETECTION

Compare claims from different sources.

When contradiction is detected:
- Store both claims
- Compare source authority
- Compare timestamps
- Search for more evidence
- Resolve if possible
- Explain uncertainty

21. ITERATIVE RESEARCH LOOP

This is mandatory.

Workflow:

Planner
 -> Research
 -> Analyst
 -> Fact Checker
 -> Contradiction Detector
 -> Evidence sufficient?
    -> NO: Planner/research again
    -> YES: Report

Do not simply generate a report after one pass.

22. CONFIDENCE SCORING

Every major conclusion should include:
- Confidence
- Evidence count
- Source quality
- Model confidence
- Contradictions
- Recency
- Uncertainty

23. RESEARCH MEMORY

Store reports and allow:

"What changed since my previous analysis?"

Compare:
- Financials
- News
- Valuation
- Sentiment
- ML predictions
- Risk
- Competitors
- Management language

24. FOLLOW-UP CHAT

After a report:
- Ask why
- Ask for evidence
- Ask for deeper research
- Ask what changed
- Ask about assumptions

Use research context.

25. HUMAN-IN-THE-LOOP

For low confidence or contradictions:
- Show evidence
- Allow research again
- Allow final report generation

26. WATCHLIST

Users can:
- Add company
- Remove company
- View company cards
- View risk
- View ML signal
- View recent events
- View latest research

27. EVENTS

Detect:
- Earnings
- Product launches
- Acquisitions
- Leadership changes
- Regulatory events
- Guidance changes
- Major contracts
- Significant anomalies

28. REPORT GENERATION

Report sections:
- Executive summary
- Company overview
- Financial performance
- Valuation
- Competitive analysis
- News
- Earnings
- ML signals
- Risks
- Bull/base/bear
- Catalysts
- Key risks
- Research thesis
- Confidence
- Sources

Support:
- Markdown
- PDF
- JSON

29. AUDIT TRAIL

Persist:
- Research query
- Research plan
- Agent execution
- Tool calls
- Retrieved documents
- ML predictions
- Claims
- Evidence
- Verification
- Contradictions
- Retries
- Final report

30. OBSERVABILITY

Add:
- Structured logs
- Research run IDs
- Request IDs
- Agent timing
- Error logs
- LLM token usage
- Model version
- Retrieval latency

31. PERFORMANCE

Use:
- Async I/O
- Redis caching
- Parallel independent research tasks
- Background jobs
- Streaming progress through SSE/WebSocket

32. SECURITY

Implement:
- JWT
- Password hashing
- Input validation
- Rate limiting
- CORS
- Secure configuration
- No secrets in frontend
- No secrets committed to Git

==================================================
DATABASE
==================================================

Use PostgreSQL.

Core tables should include:

users
companies
financial_metrics
news_articles
documents
research_runs
research_plans
agent_executions
claims
evidence
ml_predictions
risk_scores
research_reports
watchlists
events
model_versions

Use Qdrant for document vectors.

Use Redis for cache and transient state.

==================================================
API
==================================================

Implement:

POST /api/auth/register
POST /api/auth/login

GET /api/companies
GET /api/companies/{ticker}
GET /api/companies/{ticker}/financials
GET /api/companies/{ticker}/news
GET /api/companies/{ticker}/events
GET /api/companies/{ticker}/risk
GET /api/companies/{ticker}/prediction

POST /api/research
GET /api/research/{id}
GET /api/research/{id}/stream
GET /api/research/{id}/sources
GET /api/research/{id}/claims
GET /api/research/{id}/agents

POST /api/research/{id}/follow-up

POST /api/compare

GET /api/watchlist
POST /api/watchlist
DELETE /api/watchlist/{ticker}

POST /api/chat

==================================================
FRONTEND PAGES
==================================================

Build a polished modern dashboard with:

1. Login
2. Register
3. Home/Dashboard
4. Company Search
5. Company Detail
6. Research Workspace
7. Research Execution Timeline
8. Research Report
9. Evidence Viewer
10. Compare Companies
11. Watchlist
12. Research History
13. Research Chat
14. ML Insights
15. Settings

The UI should feel like a serious financial intelligence product, not a generic chatbot.

Use:
- Responsive layout
- Cards
- Tables
- Charts
- Tabs
- Status badges
- Loading states
- Error states
- Skeleton loaders
- Streaming agent progress

==================================================
AGENT STATE
==================================================

Use structured state similar to:

ResearchState:
- query
- companies
- research_plan
- financial_data
- documents
- news
- competitor_data
- earnings_data
- ml_predictions
- anomaly_results
- risk_scores
- claims
- evidence
- contradictions
- confidence_scores
- final_report

Use typed schemas.

==================================================
IMPORTANT ENGINEERING RULES
==================================================

1. Never hallucinate financial numbers.
2. Never fabricate sources.
3. Every important numeric claim must have a source or deterministic calculation.
4. Never expose API keys to the frontend.
5. Use structured JSON between agents.
6. Use deterministic code for financial calculations.
7. Use ML models for quantitative prediction/classification.
8. Use agents for planning and reasoning.
9. Use RAG for document-grounded claims.
10. Use fact checking before final report.
11. Trigger re-research when evidence is insufficient.
12. Track model versions.
13. Track research execution.
14. Handle API failures gracefully.
15. Do not use random train/test splits for time-series financial prediction.
16. Prevent future-data leakage.
17. Keep external data providers behind adapter interfaces.
18. Keep LLM prompts versioned.
19. Make configuration environment-driven.
20. Make the entire project runnable with Docker Compose.

==================================================
PROJECT PHASES
==================================================

Phase 1:
- Project scaffolding
- Docker Compose
- PostgreSQL
- Redis
- FastAPI
- React
- Authentication
- Company search
- Basic dashboard

Phase 2:
- Financial data
- Financial calculations
- Charts
- Company detail page

Phase 3:
- Document ingestion
- Embeddings
- Qdrant
- RAG
- SEC/document agent

Phase 4:
- LangGraph planner
- Financial agent
- News agent
- Competitor agent
- Earnings agent
- Analyst agent

Phase 5:
- Sentiment ML
- Anomaly detection
- Risk model
- Market signal model

Phase 6:
- Fact checker
- Contradiction detection
- Confidence scoring
- Re-research loop

Phase 7:
- Research memory
- Follow-up chat
- Watchlist
- Event detection
- Report generation

Phase 8:
- Observability
- Testing
- Security hardening
- CI/CD
- Performance optimization

==================================================
DEFINITION OF DONE
==================================================

The project is considered complete when a user can:

1. Create an account.
2. Search for a company.
3. Open its dashboard.
4. Start a natural-language research query.
5. Watch the Planner create a research plan.
6. Watch multiple agents execute.
7. See financial data being analyzed.
8. See relevant documents retrieved through RAG.
9. See news analyzed.
10. See ML sentiment generated.
11. See ML risk/anomaly/market signals.
12. See competitor analysis.
13. See valuation analysis.
14. See bull/base/bear scenarios.
15. See claims being fact checked.
16. See contradictions being detected.
17. See additional research triggered when necessary.
18. See confidence scores.
19. Receive a final evidence-backed report.
20. Ask follow-up questions.
21. Compare the result with previous research.
22. Save the company to a watchlist.
23. View the complete research audit trail.

==================================================
QUALITY BAR
==================================================

Prioritize correctness over flashy AI behavior.

The application should demonstrate:

- Real agentic orchestration
- Real ML models
- Real RAG
- Real data processing
- Real financial calculations
- Evidence-backed generation
- Iterative research
- Good software architecture
- Strong testing
- Clean UI
- Production-quality error handling

Avoid fake/demo-only AI behavior.

If an external API is unavailable, create a clean provider interface and a clearly documented mock/sample provider so the application remains runnable.

Build the system modularly so individual providers and models can be replaced without rewriting the application.

==================================================
FINANCIAL SAFETY
==================================================

The application is a research and educational intelligence system.

Do not present outputs as personalized financial advice.

Do not guarantee future stock performance.

Clearly communicate:
- Data timestamp
- Model uncertainty
- Research limitations
- Scenario assumptions
- Confidence

Use probabilistic ML signals and evidence-backed analysis rather than simplistic "BUY/SELL" commands.
```

---

# 55. MVP vs Advanced Scope

To prevent the project from becoming too large, implement in this order.

### MVP

```text
✓ Authentication
✓ Company search
✓ Financial dashboard
✓ Financial calculations
✓ SEC/document RAG
✓ Planner Agent
✓ Financial Agent
✓ News Agent
✓ Analyst Agent
✓ Fact Checker
✓ Basic report
```

### Strong Portfolio Version

Add:

```text
✓ Sentiment ML
✓ XGBoost prediction
✓ Anomaly detection
✓ Risk scoring
✓ Competitor Agent
✓ Earnings Agent
✓ DCF
✓ Bull/Base/Bear
✓ Contradiction resolution
✓ Confidence scoring
✓ Research memory
✓ Watchlist
✓ Agent timeline
```

### Advanced Version

Add:

```text
✓ Dynamic agent planning
✓ Parallel agent execution
✓ Re-research loops
✓ Model registry
✓ Agent evaluation
✓ Citation/evidence graph
✓ Cost tracking
✓ Streaming execution
✓ Full observability
✓ Automated research alerts
✓ Production deployment
```

---

# 56. Final Product Goal

The final application should demonstrate this complete loop:

```text
                    USER QUESTION
                          |
                          v
                  RESEARCH PLANNER
                          |
                 Dynamic task planning
                          |
        +-----------------+-----------------+
        |                 |                 |
        v                 v                 v
    Financial          SEC/RAG           News
      Agent             Agent            Agent
        |                 |                 |
        v                 v                 v
    Financial          Evidence        Sentiment ML
     Metrics                              |
        |                                  |
        +------------------+---------------+
                           |
                           v
                    ML ANALYSIS
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
      Prediction       Anomaly          Risk Score
          |                |                |
          +----------------+----------------+
                           |
                           v
                   COMPETITOR AGENT
                           |
                           v
                    EARNINGS AGENT
                           |
                           v
                    ANALYST AGENT
                           |
                           v
                   FACT CHECKER
                           |
                           v
                CONTRADICTION DETECTOR
                           |
                    +------+------+
                    |             |
                  Conflict      No conflict
                    |             |
                    v             v
              RE-RESEARCH     REPORT
                    |
                    +-----> Analyst
```

The key selling point of FinSight AI is:

> **It doesn't just answer financial questions. It autonomously investigates them, combines quantitative ML signals with evidence from financial documents and news, verifies its own claims, resolves conflicting information, and produces an auditable research report.**
