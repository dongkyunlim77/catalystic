from datetime import date
from pathlib import Path
import sys
import unittest


sys.path.append(str(Path(__file__).resolve().parents[1]))

from recommendation_engine import build_recommendation, build_recommendations


class RecommendationEngineTest(unittest.TestCase):
    def test_supportive_news_and_expert_context_raise_score(self):
        signal = {
            "ticker": "ACME",
            "signal_type": "Cluster Buy",
            "signal_date": "2026-05-12",
            "signal_description": "3 insiders, including the CEO, purchased a combined $420,000 worth of stock.",
        }
        news_items = [
            {
                "ticker": "ACME",
                "headline": "ACME beats estimates and raises guidance",
                "summary": "Management cited margin expansion.",
            }
        ]
        expert_notes = [
            {
                "ticker": "ACME",
                "source": "Sample analyst desk",
                "note": "Raised target and reiterated outperform.",
            }
        ]

        recommendation = build_recommendation(
            signal,
            news_items=news_items,
            expert_notes=expert_notes,
            as_of=date(2026, 5, 13),
        )

        self.assertEqual(recommendation.action, "High-Conviction Watch")
        self.assertGreaterEqual(recommendation.score, 82)
        self.assertIn("supportive recent news", recommendation.catalysts)
        self.assertIn("bullish expert stance", recommendation.catalysts)

    def test_negative_context_reduces_recommendation(self):
        signal = {
            "ticker": "RISK",
            "signal_type": "Cluster Buy",
            "signal_date": "2026-04-01",
            "signal_description": "3 insiders purchased shares.",
        }
        news_items = [
            {
                "ticker": "RISK",
                "headline": "RISK cuts guidance after weak demand",
                "summary": "Company also faces an investigation.",
            }
        ]
        expert_notes = [
            {
                "ticker": "RISK",
                "source": "Sample analyst desk",
                "note": "Lowered target and moved stance to underweight.",
            }
        ]

        recommendation = build_recommendation(
            signal,
            news_items=news_items,
            expert_notes=expert_notes,
            as_of=date(2026, 5, 13),
        )

        self.assertEqual(recommendation.action, "Avoid For Now")
        self.assertLess(recommendation.score, 50)
        self.assertIn("negative recent news", recommendation.risks)
        self.assertIn("bearish expert stance", recommendation.risks)

    def test_recommendations_are_sorted_by_score(self):
        signals = [
            {
                "ticker": "OLD",
                "signal_type": "Cluster Buy",
                "signal_date": "2026-04-01",
                "signal_description": "3 insiders purchased shares.",
            },
            {
                "ticker": "NEW",
                "signal_type": "Cluster Buy",
                "signal_date": "2026-05-12",
                "signal_description": "3 insiders, including the CFO, purchased a combined $250,000 worth of stock.",
            },
        ]

        recommendations = build_recommendations(signals, as_of=date(2026, 5, 13))

        self.assertEqual(recommendations[0].ticker, "NEW")
        self.assertEqual(recommendations[1].ticker, "OLD")


if __name__ == "__main__":
    unittest.main()
