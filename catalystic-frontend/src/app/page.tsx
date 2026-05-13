// src/app/page.tsx
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

type Signal = {
  id: number;
  created_at: string;
  ticker: string;
  signal_type: string;
  signal_date: string;
  signal_description: string;
  status: string;
};

type MarketNews = {
  id: number;
  ticker: string;
  headline: string;
  summary: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  source: string | null;
  published_at: string | null;
  url: string | null;
};

type ExpertNote = {
  id: number;
  ticker: string;
  source: string;
  note: string;
  stance: 'bullish' | 'neutral' | 'bearish' | null;
  published_at: string | null;
};

type DashboardData = {
  signals: Signal[];
  news: MarketNews[];
  expertNotes: ExpertNote[];
};

type Recommendation = {
  ticker: string;
  action: string;
  score: number;
  confidence: string;
  signal: Signal;
  relatedNews: MarketNews[];
  relatedNotes: ExpertNote[];
  catalysts: string[];
  risks: string[];
};

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

function focusedTickers() {
  return (process.env.NEXT_PUBLIC_FOCUS_TICKERS ?? '')
    .split(',')
    .map((ticker) => ticker.trim().toUpperCase())
    .filter(Boolean);
}

async function getDashboardData(): Promise<DashboardData> {
  const supabase = createSupabaseClient();
  const tickers = focusedTickers();

  if (!supabase) {
    return { signals: [], news: [], expertNotes: [] };
  }

  let signalsQuery = supabase
    .from('signals')
    .select('*')
    .order('signal_date', { ascending: false });

  if (tickers.length > 0) {
    signalsQuery = signalsQuery.in('ticker', tickers);
  }

  const { data: signals, error: signalError } = await signalsQuery;

  if (signalError) {
    console.error('Error fetching signals:', signalError.message);
    return { signals: [], news: [], expertNotes: [] };
  }

  let newsQuery = supabase
    .from('market_news')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(50);

  if (tickers.length > 0) {
    newsQuery = newsQuery.in('ticker', tickers);
  }

  const { data: news, error: newsError } = await newsQuery;

  let expertNotesQuery = supabase
    .from('expert_notes')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(50);

  if (tickers.length > 0) {
    expertNotesQuery = expertNotesQuery.in('ticker', tickers);
  }

  const { data: expertNotes, error: expertError } = await expertNotesQuery;

  if (newsError) {
    console.warn('Market news table is unavailable:', newsError.message);
  }

  if (expertError) {
    console.warn('Expert notes table is unavailable:', expertError.message);
  }

  return {
    signals: signals ?? [],
    news: newsError ? [] : news ?? [],
    expertNotes: expertError ? [] : expertNotes ?? [],
  };
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Unspecified';
  }

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildRecommendations(data: DashboardData): Recommendation[] {
  return data.signals
    .map((signal) => {
      const ticker = signal.ticker.toUpperCase();
      const relatedNews = data.news.filter((item) => item.ticker?.toUpperCase() === ticker);
      const relatedNotes = data.expertNotes.filter((item) => item.ticker?.toUpperCase() === ticker);
      const daysOld = Math.max(
        0,
        Math.floor((Date.now() - new Date(signal.signal_date).getTime()) / 86400000)
      );

      let score = 52;
      const catalysts = [signal.signal_type];
      const risks: string[] = [];
      const signalType = signal.signal_type.toLowerCase();
      const signalDescription = signal.signal_description.toLowerCase();

      if (signalType.includes('alpha vantage')) {
        catalysts.push('Alpha Vantage market intelligence');
        if (signalDescription.includes('positive')) {
          score += 18;
          catalysts.push('positive news sentiment');
        } else if (signalDescription.includes('negative')) {
          score -= 18;
          risks.push('negative news sentiment');
        }
      }

      if (signalType.includes('cluster')) {
        score += 18;
        catalysts.push('multiple insider alignment');
      }

      if (signalType.includes('high-value') || signal.signal_description.includes('$')) {
        score += 8;
        catalysts.push('material capital commitment');
      }

      if (daysOld <= 3) {
        score += 8;
      } else if (daysOld > 14) {
        score -= 8;
        risks.push('older signal');
      }

      const positiveNewsCount = relatedNews.filter((item) => item.sentiment === 'positive').length;
      const negativeNewsCount = relatedNews.filter((item) => item.sentiment === 'negative').length;
      const bullishNotes = relatedNotes.filter((item) => item.stance === 'bullish').length;
      const bearishNotes = relatedNotes.filter((item) => item.stance === 'bearish').length;

      if (positiveNewsCount > 0) {
        score += Math.min(12, positiveNewsCount * 4);
        catalysts.push('positive recent news');
      }

      if (bullishNotes > 0) {
        score += Math.min(10, bullishNotes * 5);
        catalysts.push('bullish expert context');
      }

      if (negativeNewsCount > 0) {
        score -= Math.min(16, negativeNewsCount * 6);
        risks.push('negative recent news');
      }

      if (bearishNotes > 0) {
        score -= Math.min(12, bearishNotes * 6);
        risks.push('bearish expert context');
      }

      if (relatedNews.length === 0) {
        risks.push('news context missing');
      }

      if (relatedNotes.length === 0) {
        risks.push('expert context missing');
      }

      const boundedScore = Math.max(0, Math.min(100, score));
      const action =
        boundedScore >= 82
          ? 'High-Conviction Watch'
          : boundedScore >= 68
            ? 'Constructive Watch'
            : boundedScore >= 50
              ? 'Research Further'
              : 'Avoid For Now';

      return {
        ticker,
        action,
        score: boundedScore,
        confidence: boundedScore >= 82 ? 'High' : boundedScore >= 50 ? 'Medium' : 'Low',
        signal,
        relatedNews,
        relatedNotes,
        catalysts,
        risks,
      };
    })
    .sort((a, b) => b.score - a.score);
}

function scoreBarClass(score: number) {
  if (score >= 82) {
    return 'bg-emerald-500';
  }

  if (score >= 68) {
    return 'bg-blue-500';
  }

  if (score >= 50) {
    return 'bg-amber-500';
  }

  return 'bg-rose-500';
}

export default async function HomePage() {
  const data = await getDashboardData();
  const recommendations = buildRecommendations(data);
  const highConvictionCount = recommendations.filter((item) => item.score >= 82).length;
  const averageScore =
    recommendations.length > 0
      ? Math.round(recommendations.reduce((total, item) => total + item.score, 0) / recommendations.length)
      : 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Catalystic Market Intelligence
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-normal text-slate-950 md:text-5xl">
                Stock recommendations from market signals
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Rank Alpha Vantage news sentiment, market activity, and analyst context into a research-ready watchlist.
              </p>
            </div>
            <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Research aid only. Not financial advice.
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Recommendation signals</p>
              <p className="mt-2 text-3xl font-bold">{data.signals.length}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">High conviction</p>
              <p className="mt-2 text-3xl font-bold">{highConvictionCount}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Average score</p>
              <p className="mt-2 text-3xl font-bold">{averageScore}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Context items</p>
              <p className="mt-2 text-3xl font-bold">{data.news.length + data.expertNotes.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:grid-cols-[minmax(0,1fr)_360px] md:px-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Ranked Recommendations</h2>
            <p className="text-sm text-slate-500">Score: 0-100</p>
          </div>

          {recommendations.length > 0 ? (
            recommendations.map((recommendation) => (
              <article
                key={recommendation.signal.id}
                className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-3xl font-bold">{recommendation.ticker}</h3>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {recommendation.action}
                      </span>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {recommendation.confidence} confidence
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {recommendation.signal.signal_description}
                    </p>
                  </div>
                  <div className="min-w-32">
                    <p className="text-right text-3xl font-bold">{recommendation.score}</p>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${scoreBarClass(recommendation.score)}`}
                        style={{ width: `${recommendation.score}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Catalysts</p>
                    <p className="mt-2 text-sm text-slate-700">{recommendation.catalysts.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Risks</p>
                    <p className="mt-2 text-sm text-slate-700">{recommendation.risks.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Signal date</p>
                    <p className="mt-2 text-sm text-slate-700">{formatDate(recommendation.signal.signal_date)}</p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-md border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-slate-800">No recommendations yet</h2>
              <p className="mt-3 text-slate-500">
                Run the Alpha Vantage ingestor to populate news-driven recommendation signals.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Recent News Context</h2>
            <div className="mt-4 space-y-4">
              {data.news.length > 0 ? (
                data.news.slice(0, 5).map((item) => (
                  <div key={item.id} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{item.ticker}</span>
                      <span className="text-xs text-slate-500">{item.sentiment ?? 'neutral'}</span>
                    </div>
                    {item.url ? (
                      <a
                        href={item.url}
                        className="mt-2 block text-sm font-medium text-slate-800 hover:text-blue-700"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.headline}
                      </a>
                    ) : (
                      <p className="mt-2 text-sm font-medium text-slate-800">{item.headline}</p>
                    )}
                    {item.summary ? <p className="mt-1 text-sm text-slate-500">{item.summary}</p> : null}
                    <p className="mt-2 text-xs text-slate-400">
                      {item.source ?? 'Alpha Vantage'} · {formatDate(item.published_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  Run the Alpha Vantage ingestor to populate current headlines, sentiment, source, and URLs.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Expert Context</h2>
            <div className="mt-4 space-y-4">
              {data.expertNotes.length > 0 ? (
                data.expertNotes.slice(0, 5).map((item) => (
                  <div key={item.id} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{item.ticker}</span>
                      <span className="text-xs text-slate-500">{item.stance ?? 'neutral'}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{item.note}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.source}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  Run the Alpha Vantage ingestor to populate analyst rating context from company overview data.
                </p>
              )}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
