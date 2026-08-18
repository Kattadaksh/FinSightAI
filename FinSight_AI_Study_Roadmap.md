# FinSight AI — Full Tech Stack Study Roadmap

A structured, layer-by-layer guide to deeply learn every technology in this project: **what it is, why it was chosen, how it works, and how it's used here.** Study in this order — each layer builds on the previous one.

---

## Phase 0: Prerequisites Check (skip if comfortable)
Before diving in, make sure you're solid on:
- Python fundamentals (async/await, decorators, classes)
- JavaScript/TypeScript basics (types, interfaces, promises)
- HTTP fundamentals (REST, status codes, headers)
- Git basics

If any of these are shaky, spend 1-2 days here first. Everything else compounds on top.

---

## Phase 1: Backend Foundation — FastAPI (Week 1)

### What it is
A modern, async-first Python web framework built on top of **Starlette** (ASGI toolkit) and **Pydantic** (data validation).

### Why it was chosen for this project
- **Async native**: Financial data fetching (SEC EDGAR, Alpha Vantage, Yahoo Finance) involves waiting on external APIs. FastAPI's `async def` routes let the server handle other requests while waiting on I/O instead of blocking a thread.
- **Auto-generated OpenAPI docs**: Every endpoint is self-documenting at `/docs` — critical when you have 8+ endpoints across auth, market data, ML, and AI research.
- **Pydantic validation**: Financial data has strict shapes (price must be a float, ticker must be a string, etc.) — Pydantic rejects malformed requests before they hit your business logic.
- **Native SSE (Server-Sent Events) support**: The AI Analyst streams tokens/events back to the frontend in real time as the LangGraph agent works — FastAPI supports this natively via `StreamingResponse`.

### How it works (core mechanics)
1. **ASGI vs WSGI**: Traditional Flask/Django use WSGI (synchronous, one request per worker thread at a time). FastAPI uses ASGI, which is event-loop based — a single worker can juggle thousands of concurrent I/O-bound requests.
2. **Dependency Injection**: FastAPI's `Depends()` system — e.g., `Depends(get_current_user)` — runs before your route function, used here for JWT auth checks on protected routes (watchlist, user data).
3. **Pydantic models**: You define a `BaseModel` class (e.g., `CompanyOverview`), and FastAPI auto-validates request/response bodies against it, returning 422 errors automatically on mismatch.
4. **Path/Query params with type hints**: `@app.get("/company/{ticker}")` with `ticker: str` — FastAPI parses and validates this from the URL.

### Where it's used in FinSight AI
- `backend/app/api/routes/analyst.py` — HITL research endpoints, SSE streaming
- `backend/app/providers/` — wraps SEC EDGAR / Alpha Vantage / Yahoo Finance calls as async functions
- Auth routes — JWT issuance/validation via `OAuth2PasswordBearer`

### Study checklist
- [ ] Build a toy FastAPI app with 3 routes (GET, POST, one with a path param)
- [ ] Add a Pydantic request/response model and see validation errors in `/docs`
- [ ] Implement one `async def` route that calls `httpx.AsyncClient()` to hit a real API
- [ ] Implement a `StreamingResponse` that yields SSE events every second (this directly maps to Bug 4/5 in your handover doc)
- [ ] Add JWT-based auth with `OAuth2PasswordBearer` + `Depends()`

### Resources
- Official FastAPI tutorial (docs.fastapi.tiangolo.com) — do the full "Tutorial - User Guide" section
- FastAPI's own SSE example in their advanced docs

---

## Phase 2: Data Validation & Auth Deep Dive (Week 1-2)

### 2a. Pydantic
**Why**: Type-safe data contracts between your ML models, API responses, and frontend. Prevents silent bugs like the price mismatch bug (Bug 2/3) where wrong data types/values slipped through.
**Study**: `BaseModel`, validators (`@field_validator`), nested models, `Optional` fields.

### 2b. JWT + OAuth2 Password Bearer
**Why chosen**: Stateless auth — no server-side session storage needed, scales well, standard for SPA + API architectures.
**How it works**:
1. User submits username/password → backend verifies against hashed password (Passlib/Bcrypt) in DB
2. Backend issues a signed JWT (contains user ID + expiry, signed with a secret key)
3. Frontend stores token, sends it in `Authorization: Bearer <token>` header on every request
4. Backend verifies signature + expiry on each protected route via `Depends()`

**Why Bcrypt specifically**: Unlike plain hashing (SHA-256), Bcrypt is deliberately slow and includes salting — resistant to brute-force and rainbow table attacks. Never store plaintext or naively-hashed passwords.

### Study checklist
- [ ] Implement password hashing/verification with Passlib manually
- [ ] Encode/decode a JWT manually using `pyjwt` to understand header.payload.signature structure
- [ ] Build login → protected route flow from scratch

---

## Phase 3: The Multi-Agent AI Core — LangGraph + LangChain (Week 2-3)
**This is the heart of the project — spend the most time here.**

### What it is
- **LangChain**: A framework providing building blocks (prompt templates, LLM wrappers, output parsers) to interact with LLMs.
- **LangGraph**: Built on top of LangChain — models workflows as a **stateful graph** instead of a linear chain. Nodes = functions/agents, edges = control flow, and a shared **state object** flows through the graph.

### Why chosen over a simple LLM call or linear LangChain chain
- Real research isn't linear — it needs branching (SEC data + news in parallel), conditional pausing (human review before finalizing), and the ability to **resume from an interrupted state** — plain chains can't do this; LangGraph's checkpointing can.
- **Human-in-the-loop (HITL)** requires the graph to literally *pause execution*, wait for external input (human approval), and resume exactly where it left off — this needs LangGraph's `interrupt`/checkpoint mechanism.

### How it works (core mechanics)
1. **State schema**: You define a `TypedDict` or Pydantic model representing everything the graph tracks (e.g., `plan`, `sec_data`, `news_sentiment`, `draft_report`, `thread_id`).
2. **Nodes**: Plain Python functions that take the state, do work (call an API, call the LLM), and return a partial state update.
   - In FinSight: `planner_node` → `sec_research_node` → `news_research_node` → `analyst_synthesis_node` → `fact_checker_node`
3. **Edges**: Define the order nodes execute in. Can be conditional (`add_conditional_edges`) — e.g., "if data missing, retry; else continue."
4. **Checkpointing**: LangGraph persists state at each node boundary (keyed by `thread_id`). This is what allows execution to be interrupted before `fact_checker_node` and resumed later — the entire state (plan, SEC data, draft) is saved and reloaded.
5. **Streaming (`astream`)**: As the graph executes, `astream()` yields events for each node's output. **This is exactly what Bug 4 was about** — in modern LangGraph, these events come as tuples `(mode, payload)` or `(node_name, update)` rather than plain dicts, so your consumer code must handle both shapes.
6. **`thread_id`**: The key that ties a specific execution/conversation to its checkpointed state. Losing this (Bug 5) means you can never resume — the graph has no idea which paused execution you're referring to.

### Why this specific 5-node design
| Node | Why it exists as a separate node (not merged) |
|---|---|
| `planner_node` | Separates "what to research" from "how to research it" — makes the plan inspectable/debuggable independently |
| `sec_research_node` | Isolates regulatory/ground-truth data fetching — deterministic, no LLM involved, so it's fast and cacheable |
| `news_research_node` | Runs sentiment analysis on news — different data source, different failure modes (rate limits), so isolating it means one failing doesn't crash the whole graph |
| `analyst_synthesis_node` | Only node that calls the expensive LLM for generation — isolating it means you can retry/swap models without touching data-fetching logic |
| `fact_checker_node` | Deliberately placed *after* a human checkpoint — verifies LLM claims against Tier-1 SEC facts, catching hallucinations before finalization |

### Study checklist
- [ ] Build a 3-node LangGraph graph (fetch → summarize → format) with a shared state dict
- [ ] Add a conditional edge (e.g., retry if data is empty)
- [ ] Implement checkpointing with `MemorySaver`, interrupt before the last node, then resume using `thread_id`
- [ ] Use `astream()` and print the raw event shapes — notice they're tuples, reproduce Bug 4 and fix it yourself
- [ ] Read LangGraph's official docs on "Human-in-the-loop" workflows end to end

### Resources
- LangGraph official docs → "Human-in-the-loop" and "Persistence" sections (most relevant to your bugs)
- LangChain Academy (free course by LangChain team) — do the LangGraph module specifically

---

## Phase 4: LLM Integration — OpenAI API (Week 3)

### Why GPT-4o-mini specifically
- Cost/latency tradeoff: full GPT-4o is overkill (and expensive) for structured synthesis tasks like "summarize this SEC filing + news into a report." Mini models are cheaper and faster while still handling structured, grounded generation well.
- Used for two distinct jobs: **synthesis** (writing the report from retrieved data) and implicitly **fact-checking** (comparing generated claims against SEC ground truth) — both are "reasoning over provided context" tasks, not open-ended creativity, which smaller models handle fine.

### How it works
- API call sends a system prompt + retrieved context (SEC data, news) + user query → model returns generated text
- **Grounding** is achieved by *prompt engineering*, not fine-tuning: you explicitly feed the SEC EDGAR data into the prompt so the model synthesizes from real numbers instead of inventing them
- Fact-checking node likely re-prompts the model (or does programmatic comparison) with "here are the claims, here is the source data — flag mismatches"

### Study checklist
- [ ] Make a raw OpenAI API call, understand system/user/assistant message roles
- [ ] Build a simple "grounded generation" prompt: feed it structured JSON data, ask it to write a summary referencing only that data
- [ ] Study prompt patterns for reducing hallucination (explicit "only use provided data," citation requirements)

---

## Phase 5: External Data Providers (Week 3-4)

### SEC EDGAR API
- **Why**: Tier-1, authoritative source — 10-K/10-Q/8-K filings are legally mandated disclosures, so they're the most trustworthy ground truth for fact-checking.
- **How**: REST API, requires CIK (Central Index Key) resolution first — you look up a company's CIK from its ticker, then query filings by CIK.

### Alpha Vantage
- **Why**: Provides `NEWS_SENTIMENT` endpoint — pre-computed bullish/bearish/neutral scoring on news articles, saving you from building your own sentiment model.
- **Gotcha you already hit (Bug 7)**: Free-tier APIs often default to a `"demo"` key if env vars aren't loaded correctly — always verify `load_dotenv()` is called in the exact module that reads the env var, not just once globally (Python module import order matters here).

### Yahoo Finance
- **Why**: Free, no-auth real-time-ish quote data (`regularMarketPrice`) — good enough for a non-production equity tracker.
- **Gotcha you already hit (Bug 3)**: `previousClose` vs `regularMarketPrice` — a classic bug where you grab the *wrong field* from a rich API response. Always print/log the full raw response shape before deciding which field to use.

### Study checklist
- [ ] Manually query SEC EDGAR's company facts API for one real ticker
- [ ] Manually query Alpha Vantage's `NEWS_SENTIMENT` endpoint, inspect the raw JSON
- [ ] Pull a Yahoo Finance quote and identify every price-related field (`regularMarketPrice`, `previousClose`, `bid`, `ask`) to understand why field-confusion bugs happen

---

## Phase 6: Frontend — React 19 + TypeScript + Vite (Week 4-5)

### Why this combo
- **Vite over Create-React-App**: Native ESM-based dev server → near-instant HMR (hot module reload), critical when iterating on real-time UI like live price tickers.
- **TypeScript**: Financial data has strict shapes (price is a number, not a string!) — type safety catches bugs like Bug 2/3 (price mismatches) at compile time rather than runtime.
- **React 19**: Newer features like improved Suspense/transitions help handle async data loading states (loading spinners while fetching quotes) more cleanly.

### @tanstack/react-query
- **Why**: Manages server state (as opposed to UI state) — caching, background refetching, deduplication of identical in-flight requests. Prevents re-fetching the same company overview 5 times if 5 components need it.
- **How it works**: `useQuery(['company', ticker], fetchFn)` — caches by key, auto-refetches on window focus/interval, exposes `isLoading`/`error`/`data` states declaratively.
- **Direct link to Bug 2**: This bug happened because a component *bypassed* React Query and used a static local array instead of calling the live API through `useQuery`. Using React Query consistently everywhere is itself the fix pattern.

### Study checklist
- [ ] Build a Vite + React + TS app from scratch (`npm create vite@latest`)
- [ ] Add React Query, fetch a public API (e.g., a crypto price API), observe caching behavior in React Query Devtools
- [ ] Deliberately hardcode stale fallback data in one component vs. live-fetched data in another — reproduce Bug 2 yourself to internalize why it happens

---

## Phase 7: Machine Learning Layer (Week 5) — brief, since you're de-emphasizing this
Even though you're not highlighting it on your resume, understand it for interview defense:
- **Z-score anomaly detection**: `z = (x - mean) / std_dev` — flags financial ratios (margins, debt-to-equity) that deviate significantly from historical/peer norms.
- **Risk engine**: Likely a weighted composite score combining volatility + leverage metrics into LOW/MEDIUM/HIGH buckets.
- **Study**: Just make sure you can explain Z-score math on a whiteboard — it's the most interview-likely question here.

---

## Phase 8: Testing — Pytest (Week 6)

### Why Pytest + Pytest-Asyncio + TestClient
- **Pytest-Asyncio**: Needed because most of your route handlers and LangGraph nodes are `async def` — regular pytest can't await them without this plugin.
- **FastAPI TestClient**: Lets you call your API routes in-process (no real server needed) — fast, deterministic tests.

### What "system resilience" tests likely cover
- LLM fallback chain: what happens if OpenAI API fails/rate-limits — does the system degrade gracefully or crash?
- SEC filing resilience: what if SEC EDGAR is down or returns malformed data?
- Alpha Vantage error handling: directly tests the "demo key" failure mode from Bug 7

### Study checklist
- [ ] Write a Pytest test using `TestClient` for one GET endpoint
- [ ] Write an async test with `pytest-asyncio` for one of your async functions
- [ ] Write a test that *mocks* an external API failure (e.g., `unittest.mock.patch`) and asserts your code handles it gracefully — this is exactly what "resilience" testing means

---

## Suggested 6-Week Study Cadence

| Week | Focus |
|---|---|
| 1 | FastAPI fundamentals + Pydantic + JWT auth |
| 2 | LangGraph basics — build your own 3-node graph |
| 3 | LangGraph HITL/checkpointing (deep) + OpenAI grounded generation |
| 4 | External APIs (SEC/Alpha Vantage/Yahoo) + React/TS/Vite basics |
| 5 | React Query + rebuild one FinSight feature end-to-end yourself |
| 6 | Pytest + mocking + resilience testing; review all 7 bugs and re-explain each root cause out loud |

## Final interview-prep exercise
For each of the 7 bugs in your handover doc, practice explaining out loud in under 60 seconds: **symptom → root cause → fix → what you'd do to prevent it recurring.** This is almost certainly what an interviewer will probe on, since it's the strongest evidence of real engineering (not tutorial-following) in the whole project.
