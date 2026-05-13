# Catalystic

Catalystic is a market intelligence dashboard that turns insider trading signals, recent news context, and expert notes into transparent stock research recommendations.

The platform is intentionally evidence-first: recommendations are ranked from explainable inputs instead of opaque predictions. It is a research aid, not financial advice.

## What It Does

- Fetches recent SEC Form 4 open-market insider purchases.
- Detects cluster buys when 3 or more unique insiders buy the same stock.
- Detects high-value individual purchases over $100,000.
- Scores each stock with signal strength, recency, news sentiment, and expert stance.
- Presents a ranked recommendation dashboard in Next.js.

## Architecture

```text
SEC Form 4 data
    -> catalystic-backend/ingestor.py
    -> Supabase form4_filings table
    -> catalystic-backend/signal_detector.py
    -> Supabase signals table
    -> catalystic-backend/recommendation_engine.py
    -> catalystic-frontend dashboard
```

Optional context tables can enrich recommendations:

- `market_news`: recent ticker-level headlines and sentiment.
- `expert_notes`: analyst, investor, or internally reviewed stock notes.

The frontend works with only the existing `signals` table, then uses optional context if the extra tables exist.

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
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key_here
```

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

Optional enrichment tables:

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

- Insider signal type and transaction strength increase conviction.
- More recent signals score higher.
- Positive news and bullish expert notes add support.
- Negative news, bearish notes, and missing context are surfaced as risks.

The score is meant to prioritize research, not automate trading decisions.
