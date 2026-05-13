from pathlib import Path
import sys
import unittest


sys.path.append(str(Path(__file__).resolve().parents[1]))

from alpha_vantage_ingestor import (
    build_expert_note_from_overview,
    build_market_news_row,
    fetch_news_for_ticker,
    normalize_sentiment,
)


class AlphaVantageIngestorTest(unittest.TestCase):
    def test_normalize_sentiment_uses_label_and_score(self):
        self.assertEqual(normalize_sentiment("Bullish", "0.01"), "positive")
        self.assertEqual(normalize_sentiment("Neutral", "-0.40"), "negative")
        self.assertEqual(normalize_sentiment("Neutral", "0.01"), "neutral")

    def test_build_market_news_row_uses_ticker_sentiment(self):
        article = {
            "title": "ACME launches new product",
            "summary": "The launch expands ACME's addressable market.",
            "source": "Example News",
            "time_published": "20260513T143000",
            "url": "https://example.com/acme",
            "overall_sentiment_label": "Neutral",
            "overall_sentiment_score": "0.00",
            "ticker_sentiment": [
                {
                    "ticker": "ACME",
                    "ticker_sentiment_label": "Somewhat-Bullish",
                    "ticker_sentiment_score": "0.25",
                }
            ],
        }

        row = build_market_news_row(article, "ACME")

        self.assertEqual(row["ticker"], "ACME")
        self.assertEqual(row["sentiment"], "positive")
        self.assertEqual(row["source"], "Example News")
        self.assertTrue(row["published_at"].startswith("2026-05-13"))

    def test_build_expert_note_from_overview_maps_analyst_counts(self):
        overview = {
            "AnalystRatingStrongBuy": "2",
            "AnalystRatingBuy": "6",
            "AnalystRatingHold": "3",
            "AnalystRatingSell": "1",
            "AnalystRatingStrongSell": "0",
            "AnalystTargetPrice": "123.45",
        }

        note = build_expert_note_from_overview("ACME", overview)

        self.assertIsNotNone(note)
        self.assertEqual(note["stance"], "bullish")
        self.assertIn("8 bullish", note["note"])
        self.assertIn("$123.45", note["note"])

    def test_fetch_news_for_ticker_caps_alpha_vantage_feed(self):
        import alpha_vantage_ingestor

        original_get = alpha_vantage_ingestor.alpha_vantage_get
        original_limit = alpha_vantage_ingestor.NEWS_PER_TICKER
        alpha_vantage_ingestor.NEWS_PER_TICKER = 3
        alpha_vantage_ingestor.alpha_vantage_get = lambda params: {
            "feed": [{"title": str(index)} for index in range(10)]
        }

        try:
            self.assertEqual(len(fetch_news_for_ticker("ACME")), 3)
        finally:
            alpha_vantage_ingestor.alpha_vantage_get = original_get
            alpha_vantage_ingestor.NEWS_PER_TICKER = original_limit


if __name__ == "__main__":
    unittest.main()
