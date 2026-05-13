# Catalystic

Catalystic is a market intelligence dashboard that turns Alpha Vantage news sentiment, market activity, and analyst context into transparent stock research recommendations.

The platform is intentionally evidence-first: recommendations are ranked from explainable inputs instead of opaque predictions. It is a research aid, not financial advice.

## What It Does

- Fetches recent Alpha Vantage market news and ticker-level sentiment.
- Uses Alpha Vantage company overview data to create analyst-rating context.
- Creates recommendation signals from non-neutral news sentiment.
- Scores each stock with signal strength, recency, news sentiment, and analyst stance.
- Presents a ranked recommendation dashboard in Next.js.

## Architecture

```text
Alpha Vantage NEWS_SENTIMENT + OVERVIEW
    -> catalystic-backend/alpha_vantage_ingestor.py
    -> Supabase market_news + expert_notes tables
    -> Supabase signals table
    -> catalystic-backend/recommendation_engine.py
    -> catalystic-frontend dashboard
```

Legacy SEC insider-buy scripts are still available:

- `catalystic-backend/ingestor.py`
- `catalystic-backend/signal_detector.py`

Required recommendation context tables:

- `market_news`: recent ticker-level headlines and sentiment.
- `expert_notes`: Alpha Vantage company overview analyst-rating notes.

The frontend reads `signals`, `market_news`, and `expert_notes`.

## Tech Stack

- Backend: Python, Requests, Supabase
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Database: Supabase/PostgreSQL

## Setup

### Backend

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r catalystic-backend/requirements.txt
```

Create `catalystic-backend/.env`:

```env
SEC_API_KEY=your_sec_api_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
ALPHA_VANTAGE_TICKERS=AAPL,MSFT,NVDA,TSLA,AMZN
ALPHA_VANTAGE_MAX_TICKERS=5
ALPHA_VANTAGE_NEWS_PER_TICKER=5
ALPHA_VANTAGE_FETCH_EXPERT_CONTEXT=true
ALPHA_VANTAGE_REQUEST_INTERVAL_SECONDS=1.2
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key_here
```

`SEC_API_KEY` is only needed if you still run the legacy SEC scripts. `ALPHA_VANTAGE_TICKERS` is optional; if omitted, the Alpha Vantage ingestor uses top gainers and most active tickers from Alpha Vantage.

Alpha Vantage free keys are rate limited. If you hit limits, reduce `ALPHA_VANTAGE_TICKERS`, set `ALPHA_VANTAGE_FETCH_EXPERT_CONTEXT=false`, or increase `ALPHA_VANTAGE_REQUEST_INTERVAL_SECONDS`.

### Frontend

```bash
cd catalystic-frontend
npm install
```

Create `catalystic-frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Database Schema

Required tables:

```sql
CREATE TABLE public.form4_filings (
    id bigint NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    ticker text,
    insider_name text,
    insider_role text,
    transaction_type text,
    transaction_date date,
    shares_transacted bigint,
    price_per_share numeric,
    total_value numeric,
    sec_filing_url text UNIQUE
);

CREATE TABLE public.signals (
    id bigint NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    ticker text,
    signal_type text,
    signal_date date,
    signal_description text,
    status text DEFAULT 'new'
);
```

Recommendation context tables:

```sql
CREATE TABLE public.market_news (
    id bigint NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    ticker text NOT NULL,
    headline text NOT NULL,
    summary text,
    sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    source text,
    published_at timestamp with time zone,
    url text
);

CREATE TABLE public.expert_notes (
    id bigint NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    ticker text NOT NULL,
    source text NOT NULL,
    note text NOT NULL,
    stance text CHECK (stance IN ('bullish', 'neutral', 'bearish')),
    published_at timestamp with time zone
);
```

## Running The Platform

Fetch and analyze market signals:

```bash
source venv/bin/activate
python catalystic-backend/alpha_vantage_ingestor.py
```

Optional legacy insider-buy flow:

```bash
python catalystic-backend/ingestor.py
python catalystic-backend/signal_detector.py
```

Run the frontend:

```bash
cd catalystic-frontend
npm run dev
```

Open `http://localhost:3000`.

## Testing And Validation

Backend recommendation tests:

```bash
python -m unittest discover catalystic-backend/tests
```

Frontend validation:

```bash
cd catalystic-frontend
npm run lint
npm run build
```

## Recommendation Model

The scoring model is rule-based and transparent:

- Alpha Vantage news sentiment is the primary signal source.
- More recent signals score higher.
- Positive news and bullish analyst context add support.
- Negative news, bearish notes, and missing context are surfaced as risks.

The score is meant to prioritize research, not automate trading decisions.
