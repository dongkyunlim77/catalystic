# Catalystic MVP Technical Design

## Current Repository Structure

```text
catalystic/
  README.md
  .gitignore
  catalystic-backend/
  catalystic-frontend/
```

## Backend

Backend directory:

```text
catalystic-backend/
```

Known backend responsibilities:

- Fetch Alpha Vantage news sentiment
- Fetch Alpha Vantage company overview / analyst context
- Normalize and store market news
- Normalize and store expert notes
- Generate recommendation signals
- Preserve legacy SEC insider-buy scripts

Important backend files from README:

- `alpha_vantage_ingestor.py`
- `recommendation_engine.py`
- `ingestor.py` legacy SEC flow
- `signal_detector.py` legacy SEC flow
- `tests/`

## Frontend

Frontend directory:

```text
catalystic-frontend/
```

Known frontend responsibilities:

- Connect to Supabase using public frontend environment variables
- Read `signals`, `market_news`, and `expert_notes`
- Display a ranked recommendation dashboard
- Present signal evidence, recency, sentiment, and risk context

## Database

Database provider:

- Supabase / PostgreSQL

Current important tables:

### `signals`

Stores generated recommendation signals.

Expected columns from README:

- `id`
- `created_at`
- `ticker`
- `signal_type`
- `signal_date`
- `signal_description`
- `status`

### `market_news`

Stores recent ticker-level news and sentiment.

Expected columns:

- `id`
- `created_at`
- `ticker`
- `headline`
- `summary`
- `sentiment`
- `source`
- `published_at`
- `url`

### `expert_notes`

Stores analyst/company overview context.

Expected columns:

- `id`
- `created_at`
- `ticker`
- `source`
- `note`
- `stance`
- `published_at`

### `form4_filings`

Legacy SEC insider-buy table.

Do not remove unless intentionally archiving the legacy SEC flow.

## Environment Variables

Backend `.env`:

```text
SEC_API_KEY=...
ALPHA_VANTAGE_API_KEY=...
ALPHA_VANTAGE_TICKERS=...
ALPHA_VANTAGE_MAX_TICKERS=...
ALPHA_VANTAGE_NEWS_PER_TICKER=...
ALPHA_VANTAGE_FETCH_EXPERT_CONTEXT=...
ALPHA_VANTAGE_REQUEST_INTERVAL_SECONDS=...
SUPABASE_URL=...
SUPABASE_KEY=...
```

Frontend `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_FOCUS_TICKERS=...
```

Do not commit real values.

## Validation Commands

Backend:

```bash
python -m unittest discover catalystic-backend/tests
```

Frontend:

```bash
cd catalystic-frontend
npm run lint
npm run build
```

Full local run:

```bash
source venv/bin/activate
python catalystic-backend/alpha_vantage_ingestor.py

cd catalystic-frontend
npm run dev
```

## MVP Definition

A strong MVP should support:

1. Fetch a small set of tickers from Alpha Vantage.
2. Store recent market news and analyst context in Supabase.
3. Generate transparent recommendation signals.
4. Show ranked signals in the frontend.
5. Show supporting evidence for each signal.
6. Show risks or missing context.
7. Pass backend tests and frontend build/lint checks.

## Technical Debt / Improvement Areas

Likely improvement areas to address through tickets:

- Add clearer docs for backend/frontend setup
- Add `.env.example` files
- Add seed/demo data for frontend testing
- Add typed frontend models for Supabase rows
- Add stronger error/loading/empty states
- Add tests for recommendation scoring edge cases
- Add a lightweight architecture diagram
- Improve README screenshots/demo instructions
- Separate active Alpha Vantage flow from legacy SEC flow more clearly
