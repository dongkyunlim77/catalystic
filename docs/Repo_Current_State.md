# Repo Current State

Last updated: 2026-05-18

## Repository

`dongkyunlim77/catalystic`

## Current Branch

Assumed: `main`

Before running Codex, confirm locally:

```bash
git status
git branch --show-current
```

## Current Product Direction

Catalystic is currently positioned as a market intelligence dashboard that turns Alpha Vantage news sentiment, market activity, and analyst context into transparent stock research recommendations.

The product should stay evidence-first and should clearly state that it is a research aid, not financial advice.

## Current Architecture

```text
Alpha Vantage NEWS_SENTIMENT + OVERVIEW
    -> catalystic-backend/alpha_vantage_ingestor.py
    -> Supabase market_news + expert_notes tables
    -> Supabase signals table
    -> catalystic-backend/recommendation_engine.py
    -> catalystic-frontend dashboard
```

## Current Top-Level Structure

```text
catalystic/
  README.md
  .gitignore
  catalystic-backend/
  catalystic-frontend/
```

## Backend

Technology:

- Python
- Requests
- Supabase

Known backend commands:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r catalystic-backend/requirements.txt
python catalystic-backend/alpha_vantage_ingestor.py
python -m unittest discover catalystic-backend/tests
```

Legacy commands:

```bash
python catalystic-backend/ingestor.py
python catalystic-backend/signal_detector.py
```

## Frontend

Technology:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase client

Known frontend commands:

```bash
cd catalystic-frontend
npm install
npm run dev
npm run lint
npm run build
```

## Database

Provider:

- Supabase / PostgreSQL

Important tables:

- `signals`
- `market_news`
- `expert_notes`
- `form4_filings` legacy SEC table

## Completed Codex Tickets

None tracked yet under the Codex manager workflow.

## Current Known Risks

- Alpha Vantage free keys are rate limited.
- SEC insider-buy scripts appear to be legacy and should not be treated as the primary product unless intentionally revived.
- Frontend relies on Supabase environment variables.
- Backend relies on Supabase and Alpha Vantage environment variables.
- Real secrets must never be committed.
- Product language must avoid implying guaranteed stock returns or financial advice.

## Recommended Next Ticket

T0001 — Add Codex manager docs and environment examples.
