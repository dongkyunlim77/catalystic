# Catalystic Product Overview

## One-Sentence Description

Catalystic is an evidence-first market intelligence dashboard that turns market news sentiment, analyst context, and market activity into transparent stock research recommendations.

## Product Positioning

Catalystic is a stock research aid, not a trading bot and not financial advice.

The product should help users answer:

- Which tickers have recent meaningful signals?
- What evidence supports the signal?
- What risks or conflicting signals exist?
- How recent is the information?
- Why did a stock receive its ranking?

## Current Primary Direction

The current primary direction is the Alpha Vantage + Supabase + Next.js dashboard workflow.

The original SEC insider-buy idea still exists in legacy backend scripts, but the current README positions the active product around Alpha Vantage news sentiment, company overview data, analyst context, and transparent ranking.

## Target User

Early target users:

- Retail investors doing research
- Students or builders learning financial data products
- Users who want explainable stock research signals
- Users who do not want a black-box recommendation system

## Core User Flow

1. Backend fetches recent news sentiment and company overview context.
2. Backend stores market news, expert notes, and generated signals in Supabase.
3. Recommendation engine ranks stocks based on transparent rule-based logic.
4. Frontend reads Supabase tables.
5. Dashboard displays ranked recommendations with evidence and risks.

## Product Principles

- Explainability over black-box prediction
- Evidence before recommendation
- Recent data should matter
- Risks should be visible, not hidden
- The UI should not imply guaranteed returns
- The system should be easy to demo and easy to explain in interviews

## Non-Goals For Now

- Automated trading
- Brokerage integration
- Portfolio management
- Payment/subscription system
- Full financial advisor workflow
- Real-time high-frequency trading data
- Social/community features
- Complex ML model unless explicitly planned later

## Resume/Interview Angle

Catalystic can be presented as:

A full-stack market intelligence platform that ingests financial news and analyst context, stores structured signals in Supabase/PostgreSQL, applies a transparent rule-based recommendation engine, and displays explainable stock research recommendations through a Next.js dashboard.

Strong technical themes:

- Python data ingestion
- API integration
- Supabase/PostgreSQL data modeling
- Rule-based recommendation systems
- Next.js/TypeScript dashboard
- Explainable AI/product design
- Testing and validation
