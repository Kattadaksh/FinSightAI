# FinSight AI — Data Provider & API Integration Specification

> Master specification for Antigravity implementation.
>
> This document defines the external data-provider architecture for FinSight AI, including source hierarchy, APIs, data responsibilities, fallback behavior, schemas, caching, provenance, rate limiting, security, and integration requirements.

---

# 1. Objective

FinSight AI is an autonomous financial research platform combining:

- Agentic AI
- Generative AI
- RAG
- Machine Learning
- Financial analytics
- Market data
- Financial news
- SEC filings
- Earnings information
- Evidence verification

The data architecture must prioritize **authentic, traceable, reproducible sources**.

The core rule is:

> **SEC is the primary source for U.S. public-company filings and reported financial facts. Market-data providers supply market prices and trading data. News providers supply news context. Aggregators supplement missing information.**

Do not treat one API as the universal source of truth.

---

# 2. Recommended Provider Stack

## Primary provider architecture

| Responsibility | Provider | Priority |
|---|---|---|
| SEC filings / reported financial facts | SEC EDGAR APIs | Primary / highest authority |
| U.S. market data | Polygon.io | Primary market-data provider |
| Financial news | Alpha Vantage | Primary news provider |
| Supplementary financial data | Finnhub | Secondary |
| LLM | Configurable provider | AI reasoning |
| Vector database | Qdrant | RAG |
| Database | PostgreSQL | Application storage |
| Cache | Redis | Caching / transient state |

Recommended initial stack:

```text
SEC EDGAR
    +
Alpha Vantage
    +
Finnhub
```

Recommended stronger quantitative stack:

```text
SEC EDGAR
    +
Polygon.io
    +
Alpha Vantage
    +
Finnhub
```

---

# 3. Source Authority Hierarchy

FinSight must maintain a source-authority hierarchy.

## Tier 1 — Primary Sources

Highest priority:

- SEC EDGAR
- Company annual reports
- Company quarterly reports
- Company earnings releases
- Company investor-relations documents
- Government economic data
- Official regulatory documents

## Tier 2 — Market Data

- Polygon.io
- Exchange/SIP-derived market data where applicable

## Tier 3 — Financial Aggregators

- Finnhub
- Alpha Vantage

## Tier 4 — News / Secondary Sources

- Alpha Vantage news
- Finnhub company news
- Other licensed providers added later

The system must preserve the original provider and source URL for every important data point.

---

# 4. SEC EDGAR

## Purpose

SEC EDGAR should be the **primary source of truth for U.S. public-company filings and reported financial facts**.

Use it for:

- 10-K
- 10-Q
- 8-K
- 20-F
- 6-K
- Company submissions
- XBRL facts
- Filing metadata
- Filing dates
- Financial statement facts

SEC APIs do not require a conventional API key.

Official documentation:

https://www.sec.gov/search-filings/edgar-application-programming-interfaces

---

# 5. SEC Integration Requirements

Create a dedicated provider:

```text
backend/
└── providers/
    └── sec/
        ├── client.py
        ├── service.py
        ├── schemas.py
        ├── mapper.py
        └── exceptions.py
```

Do not mix SEC-specific logic with agents.

The provider should expose methods similar to:

```python
get_company_submissions(cik)
get_company_facts(cik)
get_filings(cik, form=None)
get_filing_document(cik, accession_number)
```

Normalize all responses into internal schemas.

---

# 6. SEC User-Agent

SEC automated requests should identify the application appropriately.

Example environment variable:

```env
SEC_USER_AGENT=FinSightAI/1.0 your-email@example.com
```

Never hardcode personal email addresses or secrets.

Provide:

```env
SEC_USER_AGENT=
```

inside `.env.example`.

---

# 7. SEC Data Model

Every SEC-derived record should retain:

```text
provider
source_type
company_id
ticker
cik
form_type
accession_number
filing_date
reporting_period
document_url
section
retrieved_at
raw_payload_reference
```

Example:

```json
{
  "provider": "SEC",
  "source_type": "10-K",
  "ticker": "NVDA",
  "cik": "0001045810",
  "filing_date": "YYYY-MM-DD",
  "reporting_period": "YYYY-MM-DD",
  "document_url": "...",
  "retrieved_at": "..."
}
```

---

# 8. SEC + RAG Pipeline

Implement:

```text
SEC Filing
    |
    v
Document Downloader
    |
    v
Parser
    |
    v
Cleaner
    |
    v
Section Detection
    |
    v
Chunker
    |
    v
Metadata Enrichment
    |
    v
Embedding Model
    |
    v
Qdrant
```

Metadata must include:

```text
company
ticker
CIK
form_type
filing_date
reporting_period
section
accession_number
source_url
```

---

# 9. Financial Facts

SEC XBRL facts should be normalized into an internal financial schema.

Supported metrics should include:

```text
Revenue
Gross Profit
Operating Income
Net Income
EPS
Cash
Debt
Assets
Liabilities
Equity
Operating Cash Flow
Capital Expenditure
Free Cash Flow
Shares Outstanding
```

The system should normalize units and periods.

Do not mix:

- quarterly values
- annual values
- trailing-twelve-month values

without explicitly labeling them.

---

# 10. Polygon.io

## Purpose

Use Polygon as the primary market-data provider when the project requires stronger quantitative market data.

Use it for:

- Historical OHLCV
- Aggregates
- Volume
- Quotes
- Trades
- Snapshots
- Corporate actions where supported by the selected plan

Official documentation:

https://polygon.io/docs/rest/stocks/overview

---

# 11. Polygon Provider Architecture

Create:

```text
backend/
└── providers/
    └── polygon/
        ├── client.py
        ├── service.py
        ├── schemas.py
        ├── mapper.py
        └── exceptions.py
```

Methods should include equivalents of:

```python
get_daily_bars(ticker, start_date, end_date)
get_aggregates(ticker, start_date, end_date, interval)
get_snapshot(ticker)
get_quotes(...)
```

Keep provider-specific schemas separate from domain models.

---

# 12. Polygon Data for ML

Use Polygon market data to create features:

```text
Open
High
Low
Close
Adjusted Close
Volume
Returns
Rolling Returns
Volatility
SMA
EMA
RSI
MACD
Momentum
Volume Momentum
Drawdown
```

Do not calculate these using LLMs.

Use deterministic Python/Pandas services.

---

# 13. Alpha Vantage

## Purpose

Alpha Vantage should be the primary financial-news provider for the initial implementation and can also provide supporting financial/earnings data.

Use it for:

- Financial news
- News sentiment metadata where available
- Ticker-filtered news
- Topic filtering
- Historical news queries
- Earnings-related information
- Earnings call transcripts where supported by the selected plan/API access

Official documentation:

https://www.alphavantage.co/documentation/

---

# 14. Alpha Vantage News Architecture

Create:

```text
backend/
└── providers/
    └── alphavantage/
        ├── client.py
        ├── news_service.py
        ├── earnings_service.py
        ├── schemas.py
        ├── mapper.py
        └── exceptions.py
```

The News Agent should not call Alpha Vantage directly.

Architecture:

```text
News Agent
    |
    v
News Service
    |
    v
Alpha Vantage Provider
    |
    v
Normalized News Schema
```

---

# 15. News Data Schema

Every article should contain:

```text
article_id
provider
ticker
company_id
headline
summary
source_name
source_url
published_at
retrieved_at
topics
provider_sentiment
provider_sentiment_score
relevance_score
raw_payload_reference
```

Example:

```json
{
  "provider": "ALPHA_VANTAGE",
  "ticker": "NVDA",
  "headline": "Example headline",
  "source_name": "Example source",
  "source_url": "...",
  "published_at": "...",
  "retrieved_at": "...",
  "topics": [],
  "provider_sentiment": "positive"
}
```

---

# 16. News Processing Pipeline

Implement:

```text
Alpha Vantage
      |
      v
News Ingestion
      |
      v
Normalization
      |
      v
Deduplication
      |
      v
Relevance Ranking
      |
      +-------------------+
      |                   |
      v                   v
Provider Sentiment    FinBERT
      |                   |
      +---------+---------+
                |
                v
       LLM Financial Impact
                |
                v
          Evidence Store
```

The provider's sentiment must NOT automatically become the final sentiment.

FinSight should generate its own ML signal.

---

# 17. News Deduplication

The same event may appear across multiple publications.

Implement duplicate detection using:

- Normalized headline
- Source URL
- Publication timestamp
- Entity/ticker
- Text similarity
- Optional embedding similarity

Create an event cluster:

```text
Event Cluster
 |
 +-- Article A
 +-- Article B
 +-- Article C
```

The system should not count the same event three times when computing sentiment.

---

# 18. FinBERT / Financial Sentiment ML

Use a financial NLP model such as FinBERT.

Output:

```text
label:
POSITIVE | NEUTRAL | NEGATIVE

probabilities:
positive
neutral
negative

confidence:
0.00 - 1.00

model_version:
...
```

Store both:

```text
provider_sentiment
model_sentiment
```

This allows comparison.

Example:

```text
Provider sentiment: POSITIVE
FinBERT:            POSITIVE
Confidence:         0.91
```

---

# 19. Finnhub

## Purpose

Finnhub should be used as a supplementary financial-data provider.

Use it for:

- Company profiles
- Financial statements
- Company news
- Earnings
- Earnings surprises
- Analyst estimates
- Company peers
- Earnings-call transcripts where supported
- Other supplementary fundamentals

Official website:

https://finnhub.io/

---

# 20. Finnhub Provider Architecture

Create:

```text
backend/
└── providers/
    └── finnhub/
        ├── client.py
        ├── fundamentals.py
        ├── news.py
        ├── earnings.py
        ├── peers.py
        ├── estimates.py
        ├── schemas.py
        ├── mapper.py
        └── exceptions.py
```

The system should use Finnhub as a supplement, not silently override SEC data.

---

# 21. Source Reconciliation

When multiple providers provide the same metric:

```text
SEC
 |
 +-- Revenue = X

Finnhub
 |
 +-- Revenue = X

Alpha Vantage
 |
 +-- Revenue = X
```

The system should reconcile values.

Priority:

```text
SEC
  >
Company official filing
  >
Primary market-data source
  >
Finnhub / Alpha Vantage
  >
Other secondary source
```

If values disagree:

```text
CONFLICT DETECTED
```

Do not silently choose a number.

Record:

```text
metric
provider
value
unit
period
retrieved_at
source
```

Then use a deterministic reconciliation service.

---

# 22. Data Provenance

Every important value must carry provenance.

Minimum provenance:

```text
provider
source_url
retrieved_at
published_at
company
ticker
period
data_type
```

Example:

```json
{
  "value": 123.45,
  "unit": "USD",
  "provider": "SEC",
  "source_url": "...",
  "retrieved_at": "...",
  "period": "FY2026",
  "confidence": 0.99
}
```

---

# 23. Data Freshness

Store:

```text
published_at
retrieved_at
last_verified_at
```

Classify data:

```text
REAL_TIME
RECENT
HISTORICAL
STALE
UNKNOWN
```

Freshness rules should be configurable.

Do not present old market data as real-time.

---

# 24. Provider Adapter Pattern

All providers must implement internal interfaces.

Example:

```python
class MarketDataProvider(Protocol):
    async def get_daily_bars(...): ...
    async def get_snapshot(...): ...


class NewsProvider(Protocol):
    async def search_news(...): ...


class FinancialDataProvider(Protocol):
    async def get_fundamentals(...): ...


class FilingProvider(Protocol):
    async def get_filings(...): ...
```

Then:

```text
MarketDataProvider
      |
      +-- PolygonProvider
      +-- MockMarketDataProvider
      +-- FutureProvider
```

This makes providers replaceable.

---

# 25. Provider Configuration

Use environment variables.

Example:

```env
# =====================================
# SEC
# =====================================
SEC_USER_AGENT=FinSightAI/1.0 your-email@example.com

# =====================================
# POLYGON
# =====================================
POLYGON_API_KEY=

# =====================================
# ALPHA VANTAGE
# =====================================
ALPHAVANTAGE_API_KEY=

# =====================================
# FINNHUB
# =====================================
FINNHUB_API_KEY=

# =====================================
# DATABASE
# =====================================
DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/finsight

# =====================================
# REDIS
# =====================================
REDIS_URL=redis://redis:6379/0

# =====================================
# QDRANT
# =====================================
QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY=

# =====================================
# LLM
# =====================================
LLM_API_KEY=
LLM_MODEL=
```

Never commit `.env`.

Provide:

```text
.env.example
```

with blank secrets.

---

# 26. API Key Security

Rules:

1. Never expose API keys to React.
2. Never send provider keys in client requests.
3. Never commit keys to Git.
4. Load keys only from server environment.
5. Do not log API keys.
6. Redact secrets from error messages.
7. Use separate development and production credentials.
8. Rotate keys when necessary.

Frontend should only call:

```text
FinSight Backend
```

Never:

```text
React -> Polygon directly
React -> Alpha Vantage directly
React -> Finnhub directly
```

Correct:

```text
React
  |
  v
FastAPI
  |
  +--> Polygon
  +--> Alpha Vantage
  +--> Finnhub
  +--> SEC
```

---

# 27. Rate Limiting

Implement provider-specific rate limiting.

Each provider adapter should expose:

```text
rate_limit
retry_after
quota_remaining
```

Use Redis-backed throttling if running multiple backend instances.

Do not retry aggressively.

Use:

```text
Exponential Backoff
+
Jitter
+
Maximum Retry Count
```

Classify errors:

```text
RATE_LIMITED
TIMEOUT
AUTH_ERROR
NOT_FOUND
BAD_REQUEST
SERVER_ERROR
PROVIDER_UNAVAILABLE
```

---

# 28. Caching Strategy

Use Redis.

## Cache market data

Short TTL depending on plan/data freshness.

## Cache financial fundamentals

Longer TTL.

## Cache filings

Very long TTL because historical filings do not change frequently.

## Cache news

Short TTL.

## Cache company metadata

Long TTL.

Example conceptual policy:

```text
Market snapshot     -> short
News                -> short
Company profile     -> medium
Financial facts     -> long
SEC documents       -> very long
Embeddings          -> persistent
```

Do not cache indefinitely without a freshness policy.

---

# 29. Database Tables

Recommended tables:

```text
users
companies
provider_sources
financial_metrics
market_bars
market_snapshots
news_articles
news_events
documents
document_chunks
research_runs
research_plans
agent_executions
claims
evidence
claim_evidence
ml_predictions
ml_model_versions
risk_scores
research_reports
watchlists
events
provider_errors
```

---

# 30. Market Data Schema

Example:

```text
market_bars

id
company_id
ticker
provider
timestamp
open
high
low
close
adjusted_close
volume
interval
retrieved_at
```

Add unique constraints to prevent duplicate ingestion.

Suggested logical key:

```text
provider + ticker + timestamp + interval
```

---

# 31. Financial Metrics Schema

```text
financial_metrics

id
company_id
metric_name
value
unit
currency
period_type
period_start
period_end
fiscal_year
fiscal_quarter
provider
source_url
retrieved_at
```

Do not store a financial metric without its period.

---

# 32. News Schema

```text
news_articles

id
company_id
ticker
provider
headline
summary
source_name
source_url
published_at
retrieved_at
relevance_score
provider_sentiment
provider_sentiment_score
finbert_label
finbert_confidence
event_cluster_id
```

---

# 33. Provider Conflict Resolution

Example:

```text
SEC:
Revenue = X

Finnhub:
Revenue = Y
```

The system should create:

```text
DataConflict
```

with:

```text
metric
period
provider_a
value_a
provider_b
value_b
authority_a
authority_b
resolution
resolved_at
```

Resolution should favor primary evidence where appropriate.

The conflict should also be visible to the Fact Checker.

---

# 34. Agent Integration

Agents must use internal tools, not provider SDKs directly.

Correct:

```text
Research Planner
       |
       v
Financial Agent
       |
       v
FinancialDataTool
       |
       v
Provider Adapter
       |
       v
SEC / Finnhub / Alpha Vantage
```

Incorrect:

```text
Agent
  |
  +-- directly imports finnhub SDK
  +-- directly imports Polygon SDK
  +-- directly calls HTTP APIs
```

This separation is mandatory.

---

# 35. Recommended Tools for Agents

Create internal tools:

```text
search_company
get_company_profile
get_market_data
get_financial_metrics
get_sec_filings
search_financial_news
get_earnings
get_company_peers
calculate_ratios
calculate_dcf
run_sentiment_model
run_market_signal_model
run_anomaly_model
run_risk_model
retrieve_evidence
verify_claim
search_additional_evidence
```

Agents should select these tools dynamically.

---

# 36. Research Workflow With Providers

Example query:

> "Analyze NVIDIA vs AMD and determine which has the stronger competitive position."

Workflow:

```text
USER
 |
 v
Planner Agent
 |
 +--> Company resolution
 |
 +--> Research plan
 |
 +--> Required data
       |
       +--> SEC filings
       +--> Market data
       +--> Financial fundamentals
       +--> News
       +--> Earnings
       +--> Peers
       +--> ML signals
 |
 v
Parallel Research
 |
 +------------------+------------------+------------------+
 |                  |                  |                  |
 v                  v                  v                  v
SEC Agent        Market Agent      News Agent       Earnings Agent
 |                  |                  |                  |
 v                  v                  v                  v
SEC                Polygon         Alpha Vantage      Finnhub
 |
 +------------------+------------------+------------------+
                    |
                    v
                ML Layer
                    |
       +------------+------------+
       |            |            |
       v            v            v
   Sentiment     Anomaly       Prediction
       |            |            |
       +------------+------------+
                    |
                    v
             Competitor Agent
                    |
                    v
              Analyst Agent
                    |
                    v
             Fact Checker
                    |
                    v
        Contradiction Detection
                    |
              +-----+-----+
              |           |
            Conflict     Clean
              |           |
              v           v
        Re-research     Report
```

---

# 37. Fact Checker Provider Logic

When validating a claim:

```text
Claim
 |
 v
Retrieve Evidence
 |
 +--> SEC
 +--> Company documents
 +--> Financial data
 +--> News
 |
 v
Authority ranking
 |
 v
Freshness check
 |
 v
Numerical consistency
 |
 v
Claim status
```

Statuses:

```text
VERIFIED
PARTIALLY_SUPPORTED
UNSUPPORTED
CONTRADICTED
STALE
```

---

# 38. Example Claim

Claim:

```text
"NVIDIA revenue grew 40% year over year."
```

Fact checker should:

1. Identify metric = revenue.
2. Identify period.
3. Query SEC/financial database.
4. Retrieve supporting filing.
5. Compare reported values.
6. Calculate growth independently.
7. Compare the calculation with the claim.
8. Store evidence.
9. Return status.

Example:

```json
{
  "claim": "NVIDIA revenue grew 40% year over year",
  "status": "VERIFIED",
  "confidence": 0.98,
  "sources": [
    {
      "provider": "SEC",
      "type": "10-K",
      "url": "..."
    }
  ]
}
```

---

# 39. Financial Calculation Rules

Never ask the LLM to perform authoritative financial calculations.

Use deterministic functions:

```python
calculate_growth()
calculate_margin()
calculate_roe()
calculate_roa()
calculate_debt_to_equity()
calculate_fcf()
calculate_pe()
calculate_ps()
calculate_ev_ebitda()
calculate_dcf()
```

The LLM can explain results.

Example:

```text
Python:
Revenue growth = 41.2%

LLM:
"Revenue increased approximately 41%, primarily..."
```

---

# 40. ML Pipeline

## Market signal

```text
Polygon
 |
 v
Historical data
 |
 v
Feature engineering
 |
 v
Train/validation/test split by time
 |
 v
XGBoost
 |
 v
Probability output
 |
 v
Agent interpretation
```

## Sentiment

```text
News
 |
 v
FinBERT
 |
 v
Sentiment probability
 |
 v
Agent interpretation
```

## Anomaly

```text
Financial history
 |
 v
Isolation Forest
 |
 v
Anomaly score
 |
 v
Research Agent
 |
 v
Explanation
```

## Risk

```text
Market + fundamentals + sentiment
 |
 v
Risk model
 |
 v
Risk score
 |
 v
Analyst
```

---

# 41. ML Data Leakage Prevention

Mandatory requirements:

- Never use future prices as features.
- Never use future news for past predictions.
- Never random-shuffle temporal data for market prediction.
- Use chronological splits.
- Use walk-forward evaluation where practical.
- Store feature timestamp.
- Store label timestamp.
- Store model training period.

Every prediction should record:

```text
prediction_timestamp
feature_cutoff_timestamp
model_version
training_data_range
```

---

# 42. Provider Failure Strategy

If Polygon fails:

```text
Polygon
  |
  X
  |
Fallback market provider
```

If Alpha Vantage fails:

```text
Alpha Vantage
  |
  X
  |
Finnhub news
```

If Finnhub fails:

```text
Finnhub
  |
  X
  |
Available primary/secondary sources
```

If SEC fails:

```text
SEC unavailable
 |
 v
Do NOT silently replace primary-source filing facts with low-authority data.
 |
 v
Mark data unavailable / stale.
```

The system must distinguish:

```text
DATA_UNAVAILABLE
```

from:

```text
DATA_NOT_FOUND
```

and:

```text
PROVIDER_ERROR
```

---

# 43. Mock Provider

Create mock providers for local development and automated tests.

Example:

```text
MockSECProvider
MockMarketDataProvider
MockNewsProvider
MockFinancialProvider
```

This allows:

```text
docker compose up
```

without requiring real API keys.

Use sample data clearly marked:

```text
DATA_SOURCE=MOCK
```

Never mix mock data with production data.

---

# 44. Provider Health

Create internal provider health checks:

```text
GET /api/system/providers
```

Example response:

```json
{
  "sec": "healthy",
  "polygon": "healthy",
  "alpha_vantage": "rate_limited",
  "finnhub": "healthy",
  "qdrant": "healthy",
  "postgres": "healthy",
  "redis": "healthy"
}
```

Do not expose secret values.

---

# 45. Provider Observability

Record:

```text
provider
endpoint
request_id
status_code
latency_ms
retry_count
rate_limit_state
error_type
retrieved_at
```

Do not store raw API keys.

---

# 46. Logging

Use structured JSON logs.

Example:

```json
{
  "event": "provider_request",
  "provider": "SEC",
  "endpoint": "company_facts",
  "ticker": "NVDA",
  "status": 200,
  "latency_ms": 183,
  "request_id": "..."
}
```

---

# 47. Testing

## Provider unit tests

Test:

- Response parsing
- Missing fields
- Rate-limit responses
- Invalid tickers
- Provider errors
- Schema normalization

## Integration tests

Test:

```text
Agent
 -> Tool
 -> Provider
 -> Normalized schema
 -> Database
```

## Contract tests

Provider response changes should not break domain models silently.

## Mock tests

All external providers should have mocked fixtures.

---

# 48. Data Quality Checks

Implement automated validation:

### Market data

- OHLC relationships
- Non-negative volume
- Timestamp validation
- Duplicate detection

### Financial data

- Unit validation
- Currency validation
- Period validation
- Duplicate facts
- Impossible values

### News

- Missing URL
- Missing timestamp
- Duplicate articles
- Invalid ticker mapping

---

# 49. Source Citation Requirements

Every generated research report should contain citations.

Example:

```text
Revenue increased 41% year over year. [SEC 10-K]

Management expects continued demand growth. [Earnings Call]

Recent news sentiment is positive. [News sources]
```

The UI should allow the user to click:

```text
View Evidence
```

and see:

- Source
- Provider
- Publication date
- Retrieval date
- Relevant excerpt
- Document
- Claim supported

---

# 50. Data Timestamp Requirements

Every dashboard value should indicate when it was retrieved.

Example:

```text
Market data
Last updated: 10 minutes ago

Financials
FY2026

News
Latest article: 2 hours ago
```

Do not display:

```text
Live
```

unless the selected provider plan/data actually supports live data.

---

# 51. API Documentation

FastAPI should expose:

```text
/api/docs
/api/redoc
```

Document:

- Request schemas
- Response schemas
- Authentication
- Error codes
- Pagination
- Rate limits
- Research status

---

# 52. Error Response Format

Use a consistent schema:

```json
{
  "error": {
    "code": "PROVIDER_RATE_LIMITED",
    "message": "The selected market-data provider is temporarily rate limited.",
    "provider": "POLYGON",
    "request_id": "...",
    "retryable": true
  }
}
```

Never return raw provider secrets or internal stack traces to clients.

---

# 53. Pagination

Implement pagination for:

- News
- Research history
- Research evidence
- Agent executions
- Events
- Companies

Use cursor pagination for large/rapidly changing datasets where appropriate.

---

# 54. Async Processing

Research runs can be expensive.

Use background jobs or async orchestration.

Recommended:

```text
POST /api/research
      |
      v
Create research_run
      |
      v
Return research_id
      |
      v
Background LangGraph execution
      |
      v
SSE/WebSocket progress
```

Frontend:

```text
Research ID
   |
   v
Stream execution updates
```

---

# 55. Parallel Provider Calls

Independent calls should run concurrently.

Example:

```text
                Planner
                   |
       +-----------+-----------+
       |           |           |
       v           v           v
     SEC        Market        News
       |           |           |
       +-----------+-----------+
                   |
                   v
                 Analyst
```

Do not unnecessarily execute independent API calls sequentially.

---

# 56. Cost Control

The system should not invoke the LLM for tasks that deterministic code can perform.

Bad:

```text
LLM calculates P/E.
```

Good:

```text
Python calculates P/E.
LLM explains P/E.
```

Bad:

```text
LLM determines whether two numbers are equal.
```

Good:

```text
Python compares values.
LLM explains discrepancy.
```

Use LLMs primarily for:

- Planning
- Research reasoning
- Summarization
- Interpretation
- Contradiction resolution
- Report generation

---

# 57. Data Provider Decision Matrix

## SEC

Best for:

```text
Filings
Reported financial facts
Primary-source evidence
Regulatory disclosures
```

## Polygon

Best for:

```text
Market data
Historical OHLCV
Quantitative ML
Trading features
```

## Alpha Vantage

Best for:

```text
Financial news
News sentiment metadata
News search
Earnings-related data
```

## Finnhub

Best for:

```text
Supplementary fundamentals
Company news
Peers
Earnings
Estimates
Transcripts where available
```

---

# 58. Recommended Initial API Keys

For local development, configure:

```env
SEC_USER_AGENT=
POLYGON_API_KEY=
ALPHAVANTAGE_API_KEY=
FINNHUB_API_KEY=
LLM_API_KEY=
```

The application should remain runnable with mock providers when keys are absent.

Startup should display:

```text
Provider status

SEC: configured
Polygon: configured
Alpha Vantage: configured
Finnhub: configured
LLM: configured
```

Do not print secret values.

---

# 59. Production Provider Strategy

Use configuration such as:

```env
MARKET_DATA_PROVIDER=polygon
NEWS_PROVIDER=alphavantage
FINANCIAL_DATA_PROVIDER=finnhub
FILING_PROVIDER=sec
```

This allows provider switching without code changes.

---

# 60. Important Legal / Licensing Requirement

Do not assume that because an API can be queried, its data can automatically be redistributed commercially.

For production:

- Review provider terms.
- Review market-data licensing.
- Review news redistribution rights.
- Respect rate limits.
- Store only data permitted by the provider plan.
- Avoid redistributing full copyrighted news articles.
- Store headlines/metadata/evidence excerpts only as permitted.
- Link to original sources.

The application should be designed so providers can be replaced if licensing requirements change.

---

# 61. Antigravity Implementation Prompt

Use this section as the direct implementation prompt.

```text
You are implementing FinSight AI, an autonomous financial research platform.

Build the complete data-provider layer according to this specification.

MANDATORY PROVIDERS:

1. SEC EDGAR
   Role:
   - Primary source for U.S. public-company filings
   - Company facts
   - XBRL financial facts
   - 10-K
   - 10-Q
   - 8-K
   - Filing metadata

2. Polygon.io
   Role:
   - Primary market-data provider
   - Historical OHLCV
   - Aggregates
   - Volume
   - Quotes/trades where available
   - Snapshots where available

3. Alpha Vantage
   Role:
   - Primary financial news provider
   - News search
   - Ticker filtering
   - Topics
   - Historical news
   - News sentiment metadata
   - Earnings-related data where supported

4. Finnhub
   Role:
   - Supplementary financial provider
   - Fundamentals
   - Company news
   - Earnings
   - Analyst estimates
   - Peers
   - Transcripts where supported

ARCHITECTURE:

React frontend
    |
FastAPI backend
    |
Service layer
    |
Provider adapter layer
    |
+---------+----------+----------+
|         |          |          |
SEC     Polygon    Alpha      Finnhub
                  Vantage

DO NOT allow agents to call provider SDKs directly.

Use:

Agent
 -> Internal Tool
 -> Service
 -> Provider Adapter
 -> External API

Implement provider interfaces:

FilingProvider
MarketDataProvider
NewsProvider
FinancialDataProvider

Implement:

SECProvider
PolygonProvider
AlphaVantageProvider
FinnhubProvider

Also implement Mock providers for testing and local development.

REQUIREMENTS:

1. All provider secrets must be environment variables.
2. Never expose provider keys to React.
3. Never commit .env.
4. Create .env.example.
5. Add provider-specific rate limiting.
6. Add retries with exponential backoff and jitter.
7. Add Redis caching.
8. Store provider provenance for every important value.
9. Store source URL.
10. Store retrieval timestamp.
11. Store publication/reporting period.
12. Track provider errors.
13. Track request latency.
14. Track request IDs.
15. Do not log API keys.
16. Normalize provider responses into internal schemas.
17. Do not let one provider's schema leak into domain logic.
18. Support provider switching through environment configuration.
19. Build mock providers for tests.
20. Implement automated data-quality checks.

SEC:

Use SEC as highest-authority source for reported financial facts.

Do not silently replace unavailable SEC filings with aggregator data.

Market data:

Use Polygon for market-data features when configured.

News:

Use Alpha Vantage as primary news source.

Fallback to Finnhub news only when configured and appropriate.

Fundamentals:

Use SEC first where applicable.
Use Finnhub as supplementary data.

CONFLICTS:

When SEC, Finnhub, Alpha Vantage, or another provider disagrees:

1. Detect conflict.
2. Store both values.
3. Store provider authority.
4. Store period/unit/currency.
5. Prefer primary evidence where appropriate.
6. Expose the conflict to the fact-checking system.
7. Never silently overwrite the value.

PROVENANCE:

Every important metric must have:

provider
source_url
retrieved_at
published_at where applicable
company
ticker
period
unit
currency
data_type

NEWS:

Implement:

ingestion
normalization
deduplication
relevance scoring
provider sentiment
FinBERT sentiment
event clustering
financial impact analysis

Do not treat provider sentiment as final truth.

ML:

Use Polygon data for historical market features.

Use SEC/Finnhub financial data for fundamentals.

Use Alpha Vantage/Finnhub news for sentiment features.

Prevent all future-data leakage.

Use chronological splits and walk-forward evaluation.

RAG:

Use SEC filings as primary RAG documents.

Store metadata:

company
ticker
CIK
form_type
filing_date
reporting_period
section
accession_number
source_url

Store embeddings in Qdrant.

DATABASE:

Use PostgreSQL.

Create tables for:

companies
provider_sources
financial_metrics
market_bars
market_snapshots
news_articles
news_events
documents
document_chunks
provider_errors
research_runs
claims
evidence
claim_evidence
ml_predictions
ml_model_versions

CACHE:

Use Redis for:

market data cache
news cache
company metadata
financial data cache
research state
provider rate limiting

OBSERVABILITY:

Record:

provider
endpoint
status
latency
retry_count
request_id
error_type

SECURITY:

JWT authentication.
Password hashing.
Input validation.
Rate limiting.
CORS.
Secrets only on backend.
No raw secrets in logs.

TESTING:

Create:

provider unit tests
provider mock tests
schema normalization tests
integration tests
agent-tool-provider tests
data-quality tests
ML leakage tests

DOCKER:

Provide:

FastAPI
React
PostgreSQL
Redis
Qdrant

through docker-compose.

APPLICATION STARTUP:

The backend should report provider configuration status without revealing keys.

Example:

SEC: configured
Polygon: configured
Alpha Vantage: configured
Finnhub: configured
LLM: configured

If a provider key is missing, application startup should not crash if a mock provider can be used.

DATA SAFETY:

Never fabricate data.

Never present stale data as live.

Never claim real-time data unless the configured provider plan actually supplies it.

Every report must display source timestamps.

FINANCIAL SAFETY:

The application is a research/educational system, not personalized financial advice.

Do not produce guaranteed returns.

Do not hide uncertainty.

Use probabilistic signals and scenario analysis.

FINAL IMPLEMENTATION GOAL:

The resulting system must allow an agent to receive:

"Analyze NVIDIA versus AMD."

and autonomously:

1. Resolve both companies.
2. Retrieve SEC filings.
3. Retrieve financial facts.
4. Retrieve market data.
5. Retrieve recent financial news.
6. Retrieve earnings information.
7. Retrieve peer information.
8. Run sentiment ML.
9. Run anomaly detection.
10. Run quantitative risk analysis.
11. Run market signal ML.
12. Calculate financial ratios.
13. Calculate valuation.
14. Compare competitors.
15. Generate claims.
16. Retrieve evidence.
17. Fact-check claims.
18. Detect contradictions.
19. Re-research if necessary.
20. Generate an evidence-backed final report.

The implementation must be modular, testable, observable, provider-agnostic, and production-oriented.
```

---

# 62. Final Recommended Architecture

```text
                         FIN SIGHT AI
                              |
                              v
                      +---------------+
                      |   React UI    |
                      +-------+-------+
                              |
                              v
                      +---------------+
                      |    FastAPI    |
                      +-------+-------+
                              |
                    +---------+---------+
                    |                   |
                    v                   v
             Research Service       Data Services
                    |                   |
                    v                   v
              LangGraph              Providers
                    |          +--------+--------+---------+
                    |          |        |        |         |
                    |         SEC    Polygon   Alpha     Finnhub
                    |                   |      Vantage
                    |                   |
                    v                   v
              Agent Tools          Normalized Data
                    |                   |
        +-----------+----------+        |
        |           |          |        |
        v           v          v        v
      RAG          ML       Financial  PostgreSQL
        |           |       Analytics     |
        v           v          |          |
      Qdrant     Models        |          |
                    |          |          |
                    +----------+----------+
                               |
                              Redis
                               |
                         Evidence Store
                               |
                               v
                         Fact Checker
                               |
                               v
                    Contradiction Resolver
                               |
                     +---------+---------+
                     |                   |
                    Retry              Final
                     |                   |
                     v                   v
                 Research             Report
```

---

# 63. Final Provider Decision

For the project, use this exact priority:

```text
                    DATA SOURCE
                         |
        +----------------+----------------+
        |                |                |
        v                v                v
   SEC EDGAR         Polygon.io      Alpha Vantage
   Financial Truth   Market Data      Financial News
        |                |                |
        +----------------+----------------+
                         |
                         v
                     Finnhub
                  Supplementary Data
                         |
                         v
                    FinSight AI
                         |
             +-----------+-----------+
             |           |           |
            RAG          ML        Agents
             |           |           |
             +-----------+-----------+
                         |
                    Fact Checker
                         |
                    Final Report
```

The key architectural decision is **not to make Alpha Vantage, Polygon, or Finnhub the "truth."** FinSight should maintain a provenance-aware source hierarchy, with **primary documents and filings preferred for reported facts**, while market-data and news providers serve their respective domains.

---

# 64. Definition of Done

The provider implementation is complete when:

- SEC filings can be retrieved and stored.
- SEC financial facts can be normalized.
- SEC documents can enter the RAG pipeline.
- Polygon market data can be retrieved.
- Market indicators can be calculated.
- Alpha Vantage news can be retrieved.
- News can be deduplicated.
- FinBERT can classify financial news.
- Finnhub can supplement financial/earnings/peer data.
- Provider conflicts are detected.
- Data provenance is stored.
- Source timestamps are stored.
- Provider failures are handled.
- Rate limits are handled.
- Redis caching works.
- Mock providers work.
- Provider keys are secure.
- Provider health is visible.
- Agent tools use provider adapters rather than SDKs directly.
- Fact checking can trace claims back to sources.
- ML predictions record feature cutoff timestamps.
- No future-data leakage exists.
- The entire stack runs using Docker Compose.

---

# 65. Final Product Principle

The system should answer financial research questions using this chain:

```text
PRIMARY DATA
     ↓
NORMALIZATION
     ↓
RAG / ML / ANALYTICS
     ↓
AGENTIC RESEARCH
     ↓
EVIDENCE
     ↓
FACT CHECKING
     ↓
CONTRADICTION RESOLUTION
     ↓
CONFIDENCE
     ↓
FINAL REPORT
```

The final system should never behave like:

```text
User
 ↓
LLM
 ↓
Random financial answer
```

It should behave like:

```text
User
 ↓
Planner
 ↓
Multiple trusted data sources
 ↓
RAG + ML + deterministic analytics
 ↓
Agent reasoning
 ↓
Evidence verification
 ↓
Contradiction resolution
 ↓
Auditable financial research
```
