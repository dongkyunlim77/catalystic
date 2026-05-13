# recommendation_engine.py
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import Iterable


POSITIVE_NEWS_KEYWORDS = (
    "beat",
    "beats",
    "upgrade",
    "raises guidance",
    "record revenue",
    "approval",
    "partnership",
    "contract",
    "buyback",
    "margin expansion",
)

NEGATIVE_NEWS_KEYWORDS = (
    "miss",
    "misses",
    "downgrade",
    "cuts guidance",
    "investigation",
    "lawsuit",
    "recall",
    "layoffs",
    "margin pressure",
    "weak demand",
)

EXPERT_BULLISH_KEYWORDS = (
    "outperform",
    "overweight",
    "buy",
    "accumulate",
    "raised target",
    "positive setup",
)

EXPERT_BEARISH_KEYWORDS = (
    "underperform",
    "underweight",
    "sell",
    "trim",
    "lowered target",
    "negative setup",
)


@dataclass(frozen=True)
class Recommendation:
    ticker: str
    action: str
    score: int
    confidence: str
    horizon: str
    rationale: str
    catalysts: list[str]
    risks: list[str]


def _as_date(value: str | date | None) -> date:
    if isinstance(value, date):
        return value
    if not value:
        return datetime.now().date()
    return datetime.strptime(value[:10], "%Y-%m-%d").date()


def _contains_any(text: str, keywords: Iterable[str]) -> list[str]:
    normalized = text.lower()
    return [keyword for keyword in keywords if keyword in normalized]


def _ticker_text(items: Iterable[dict], ticker: str) -> str:
    relevant_chunks = []
    for item in items:
        item_ticker = item.get("ticker")
        if item_ticker and item_ticker.upper() != ticker.upper():
            continue
        relevant_chunks.extend(
            str(item.get(field, ""))
            for field in ("headline", "summary", "note", "stance", "source")
        )
    return " ".join(relevant_chunks)


def _signal_score(signal: dict) -> tuple[int, list[str]]:
    signal_type = str(signal.get("signal_type", "")).lower()
    description = str(signal.get("signal_description", "")).lower()

    score = 50
    catalysts = []

    if "cluster buy" in signal_type:
        score += 18
        catalysts.append("multiple insider purchases")
    if "high-value" in signal_type or "$" in description:
        score += 8
        catalysts.append("material transaction value")
    if "ceo" in description or "cfo" in description:
        score += 6
        catalysts.append("senior operator involvement")

    return score, catalysts


def _recency_adjustment(signal_date: date, as_of: date) -> int:
    days_old = max((as_of - signal_date).days, 0)
    if days_old <= 3:
        return 8
    if days_old <= 10:
        return 4
    if days_old <= 30:
        return -4
    return -12


def build_recommendation(
    signal: dict,
    news_items: list[dict] | None = None,
    expert_notes: list[dict] | None = None,
    as_of: date | None = None,
) -> Recommendation:
    """Builds a transparent stock recommendation from a signal plus context."""
    ticker = str(signal.get("ticker", "")).upper()
    signal_date = _as_date(signal.get("signal_date"))
    evaluation_date = as_of or datetime.now().date()

    score, catalysts = _signal_score(signal)
    score += _recency_adjustment(signal_date, evaluation_date)

    news_text = _ticker_text(news_items or [], ticker)
    expert_text = _ticker_text(expert_notes or [], ticker)

    positive_news = _contains_any(news_text, POSITIVE_NEWS_KEYWORDS)
    negative_news = _contains_any(news_text, NEGATIVE_NEWS_KEYWORDS)
    bullish_expert = _contains_any(expert_text, EXPERT_BULLISH_KEYWORDS)
    bearish_expert = _contains_any(expert_text, EXPERT_BEARISH_KEYWORDS)

    if positive_news:
        score += min(12, len(positive_news) * 4)
        catalysts.append("supportive recent news")
    if bullish_expert:
        score += min(10, len(bullish_expert) * 5)
        catalysts.append("bullish expert stance")

    risks = []
    if negative_news:
        score -= min(16, len(negative_news) * 5)
        risks.append("negative recent news")
    if bearish_expert:
        score -= min(12, len(bearish_expert) * 6)
        risks.append("bearish expert stance")
    if not news_text:
        risks.append("no recent news context attached")
    if not expert_text:
        risks.append("no expert context attached")

    score = max(0, min(100, score))

    if score >= 82:
        action = "High-Conviction Watch"
        confidence = "High"
    elif score >= 68:
        action = "Constructive Watch"
        confidence = "Medium"
    elif score >= 50:
        action = "Research Further"
        confidence = "Medium"
    else:
        action = "Avoid For Now"
        confidence = "Low"

    rationale = (
        f"{ticker} scores {score}/100 from signal strength, recency, "
        "news context, and expert context."
    )

    return Recommendation(
        ticker=ticker,
        action=action,
        score=score,
        confidence=confidence,
        horizon="2-6 week research window",
        rationale=rationale,
        catalysts=catalysts or ["stored market signal"],
        risks=risks or ["market-wide volatility"],
    )


def build_recommendations(
    signals: list[dict],
    news_items: list[dict] | None = None,
    expert_notes: list[dict] | None = None,
    as_of: date | None = None,
) -> list[Recommendation]:
    recommendations = [
        build_recommendation(signal, news_items, expert_notes, as_of)
        for signal in signals
        if signal.get("ticker")
    ]
    return sorted(recommendations, key=lambda item: item.score, reverse=True)
