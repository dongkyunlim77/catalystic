# alpha_vantage_ingestor.py
from __future__ import annotations

import os
import time
from datetime import datetime, timezone

import requests
from dotenv import load_dotenv
from supabase import Client, create_client


load_dotenv()
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
CONFIGURED_TICKERS = os.getenv("ALPHA_VANTAGE_TICKERS", "")
FETCH_EXPERT_CONTEXT = os.getenv("ALPHA_VANTAGE_FETCH_EXPERT_CONTEXT", "true").lower() == "true"

BASE_URL = "https://www.alphavantage.co/query"
MAX_TICKERS = int(os.getenv("ALPHA_VANTAGE_MAX_TICKERS", "5"))
NEWS_PER_TICKER = int(os.getenv("ALPHA_VANTAGE_NEWS_PER_TICKER", "5"))
REQUEST_INTERVAL_SECONDS = float(os.getenv("ALPHA_VANTAGE_REQUEST_INTERVAL_SECONDS", "1.2"))
SIGNAL_SENTIMENT_THRESHOLD = 0.15

supabase: Client | None = None
last_request_time = 0.0


class AlphaVantageLimitError(RuntimeError):
    """Raised when Alpha Vantage asks the caller to slow down or stop."""


def validate_environment():
    if all([ALPHA_VANTAGE_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
        return

    print("---")
    print("ERROR: Missing environment variables.")
    print("Please set ALPHA_VANTAGE_API_KEY, SUPABASE_URL, and SUPABASE_KEY in catalystic-backend/.env.")
    print("---")
    exit()


def supabase_client():
    global supabase
    if supabase is None:
        validate_environment()
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return supabase


def alpha_vantage_get(params):
    """Fetches JSON from Alpha Vantage and handles API throttling responses."""
    global last_request_time
    validate_environment()
    elapsed = time.monotonic() - last_request_time
    if elapsed < REQUEST_INTERVAL_SECONDS:
        time.sleep(REQUEST_INTERVAL_SECONDS - elapsed)

    response = requests.get(
        BASE_URL,
        params={**params, "apikey": ALPHA_VANTAGE_API_KEY},
        timeout=30,
    )
    last_request_time = time.monotonic()
    response.raise_for_status()
    data = response.json()

    if "Error Message" in data:
        raise ValueError(data["Error Message"])
    if "Note" in data:
        raise AlphaVantageLimitError(data["Note"])
    if "Information" in data:
        raise AlphaVantageLimitError(data["Information"])

    return data


def normalize_sentiment(label, score):
    """Maps Alpha Vantage sentiment labels/scores to the dashboard categories."""
    normalized_label = str(label or "").lower()
    numeric_score = float(score or 0)

    if "bullish" in normalized_label or numeric_score >= SIGNAL_SENTIMENT_THRESHOLD:
        return "positive"
    if "bearish" in normalized_label or numeric_score <= -SIGNAL_SENTIMENT_THRESHOLD:
        return "negative"
    return "neutral"


def parse_alpha_vantage_time(value):
    if not value:
        return datetime.now(timezone.utc).isoformat()

    try:
        return datetime.strptime(value, "%Y%m%dT%H%M%S").replace(tzinfo=timezone.utc).isoformat()
    except ValueError:
        return datetime.now(timezone.utc).isoformat()


def configured_tickers():
    return [
        ticker.strip().upper()
        for ticker in CONFIGURED_TICKERS.split(",")
        if ticker.strip()
    ][:MAX_TICKERS]


def fetch_market_tickers():
    """Gets liquid market candidates when no explicit watchlist is configured."""
    data = alpha_vantage_get({"function": "TOP_GAINERS_LOSERS"})
    tickers = []

    for group in ("top_gainers", "most_actively_traded"):
        for item in data.get(group, []):
            ticker = item.get("ticker")
            if ticker and ticker not in tickers:
                tickers.append(ticker)
            if len(tickers) >= MAX_TICKERS:
                return tickers

    return tickers


def target_tickers():
    tickers = configured_tickers()
    if tickers:
        return tickers
    return fetch_market_tickers()


def fetch_news_for_ticker(ticker):
    data = alpha_vantage_get(
        {
            "function": "NEWS_SENTIMENT",
            "tickers": ticker,
            "sort": "LATEST",
            "limit": str(NEWS_PER_TICKER),
        }
    )
    return data.get("feed", [])[:NEWS_PER_TICKER]


def ticker_sentiment(article, ticker):
    for item in article.get("ticker_sentiment", []):
        if item.get("ticker", "").upper() == ticker.upper():
            return item
    return {}


def build_market_news_row(article, ticker):
    ticker_context = ticker_sentiment(article, ticker)
    sentiment = normalize_sentiment(
        ticker_context.get("ticker_sentiment_label") or article.get("overall_sentiment_label"),
        ticker_context.get("ticker_sentiment_score") or article.get("overall_sentiment_score"),
    )

    return {
        "ticker": ticker,
        "headline": article.get("title", "Untitled market update"),
        "summary": article.get("summary"),
        "sentiment": sentiment,
        "source": article.get("source"),
        "published_at": parse_alpha_vantage_time(article.get("time_published")),
        "url": article.get("url"),
    }


def save_market_news(row):
    query = supabase_client().table("market_news").select("id", count="exact").eq("ticker", row["ticker"])

    if row.get("url"):
        query = query.eq("url", row["url"])
    else:
        query = query.eq("headline", row["headline"])

    existing = query.execute()
    if existing.count == 0:
        supabase_client().table("market_news").insert(row).execute()
        return True
    return False


def save_signal_from_news(row):
    signal_date = row["published_at"][:10]
    sentiment = row.get("sentiment") or "neutral"
    description = (
        f"Alpha Vantage news sentiment is {sentiment} for {row['ticker']}: "
        f"{row['headline']}"
    )

    existing = (
        supabase_client().table("signals")
        .select("id", count="exact")
        .eq("ticker", row["ticker"])
        .eq("signal_type", "Alpha Vantage News Sentiment")
        .eq("signal_date", signal_date)
        .execute()
    )

    if existing.count == 0:
        supabase_client().table("signals").insert(
            {
                "ticker": row["ticker"],
                "signal_type": "Alpha Vantage News Sentiment",
                "signal_date": signal_date,
                "signal_description": description,
                "status": "new",
            }
        ).execute()
        return True
    return False


def fetch_company_overview(ticker):
    return alpha_vantage_get({"function": "OVERVIEW", "symbol": ticker})


def analyst_rating_counts(overview):
    return {
        "strong_buy": int(overview.get("AnalystRatingStrongBuy") or 0),
        "buy": int(overview.get("AnalystRatingBuy") or 0),
        "hold": int(overview.get("AnalystRatingHold") or 0),
        "sell": int(overview.get("AnalystRatingSell") or 0),
        "strong_sell": int(overview.get("AnalystRatingStrongSell") or 0),
    }


def build_expert_note_from_overview(ticker, overview):
    counts = analyst_rating_counts(overview)
    bullish = counts["strong_buy"] + counts["buy"]
    bearish = counts["sell"] + counts["strong_sell"]
    total = bullish + counts["hold"] + bearish

    if total == 0:
        return None

    stance = "neutral"
    if bullish > bearish and bullish >= counts["hold"]:
        stance = "bullish"
    elif bearish > bullish:
        stance = "bearish"

    target_price = overview.get("AnalystTargetPrice")
    note = (
        f"Alpha Vantage overview shows {bullish} bullish, {counts['hold']} hold, "
        f"and {bearish} bearish analyst ratings."
    )
    if target_price and target_price != "None":
        note += f" Analyst target price: ${target_price}."

    return {
        "ticker": ticker,
        "source": "Alpha Vantage Company Overview",
        "note": note,
        "stance": stance,
        "published_at": datetime.now(timezone.utc).isoformat(),
    }


def save_expert_note(row):
    existing = (
        supabase_client().table("expert_notes")
        .select("id", count="exact")
        .eq("ticker", row["ticker"])
        .eq("source", row["source"])
        .execute()
    )

    if existing.count == 0:
        supabase_client().table("expert_notes").insert(row).execute()
    else:
        supabase_client().table("expert_notes").update(
            {
                "note": row["note"],
                "stance": row["stance"],
                "published_at": row["published_at"],
            }
        ).eq("ticker", row["ticker"]).eq("source", row["source"]).execute()


def ingest_alpha_vantage_context():
    tickers = target_tickers()
    if not tickers:
        print("No Alpha Vantage tickers found to ingest.")
        return

    print(f"Fetching Alpha Vantage context for: {', '.join(tickers)}")
    print(
        "Alpha Vantage free keys are limited. "
        f"This run may use up to {len(tickers) * (2 if FETCH_EXPERT_CONTEXT else 1)} API requests."
    )

    for ticker in tickers:
        saved_news = 0
        saved_signals = 0

        try:
            for article in fetch_news_for_ticker(ticker):
                row = build_market_news_row(article, ticker)
                if save_market_news(row):
                    saved_news += 1
                if row["sentiment"] != "neutral":
                    if save_signal_from_news(row):
                        saved_signals += 1

            if FETCH_EXPERT_CONTEXT:
                overview = fetch_company_overview(ticker)
                expert_note = build_expert_note_from_overview(ticker, overview)
                if expert_note:
                    save_expert_note(expert_note)
        except AlphaVantageLimitError as error:
            print(f"Alpha Vantage limit reached while processing {ticker}.")
            print(str(error))
            print("Stopping early; saved data from completed tickers remains in Supabase.")
            return

        print(f"{ticker}: saved {saved_news} news items and {saved_signals} signals.")

    print("Finished Alpha Vantage ingestion.")


if __name__ == "__main__":
    validate_environment()
    ingest_alpha_vantage_context()
