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
  error: string | null;
  warnings: string[];
};

type Recommendation = {
  ticker: string;
  category: string;
  score: number;
  confidence: string;
  freshness: string;
  freshnessTone: string;
  rationale: string;
  signal: Signal;
  relatedNews: MarketNews[];
  relatedNotes: ExpertNote[];
  catalysts: string[];
  risks: string[];
  latestContextDate: string | null;
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
    return {
      signals: [],
      news: [],
      expertNotes: [],
      error: 'Supabase environment variables are not configured.',
      warnings: [],
    };
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
    return {
      signals: [],
      news: [],
      expertNotes: [],
      error: signalError.message,
      warnings: [],
    };
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
    error: null,
    warnings: [
      ...(newsError ? ['Market news context could not be loaded.'] : []),
      ...(expertError ? ['Expert/analyst context could not be loaded.'] : []),
    ],
  };
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Unspecified';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unspecified';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function daysSince(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
}

function freshnessLabel(value: string | null) {
  const daysOld = daysSince(value);

  if (daysOld === null) {
    return { label: 'Freshness unknown', tone: 'bg-slate-100 text-slate-700 ring-slate-200' };
  }

  if (daysOld <= 3) {
    return { label: 'Fresh', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };
  }

  if (daysOld <= 10) {
    return { label: 'Recent', tone: 'bg-blue-50 text-blue-700 ring-blue-200' };
  }

  if (daysOld <= 30) {
    return { label: 'Aging', tone: 'bg-amber-50 text-amber-800 ring-amber-200' };
  }

  return { label: 'Stale', tone: 'bg-rose-50 text-rose-700 ring-rose-200' };
}

function latestDate(values: Array<string | null>) {
  const timestamps = values
    .map((value) => {
      if (!value) {
        return null;
      }

      const timestamp = new Date(value).getTime();
      return Number.isNaN(timestamp) ? null : timestamp;
    })
    .filter((value): value is number => value !== null);

  if (timestamps.length === 0) {
    return null;
  }

  return new Date(Math.max(...timestamps)).toISOString();
}

function uniqueItems(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function buildRecommendations(data: DashboardData): Recommendation[] {
  return data.signals
    .map((signal) => {
      const ticker = signal.ticker.toUpperCase();
      const relatedNews = data.news.filter((item) => item.ticker?.toUpperCase() === ticker);
      const relatedNotes = data.expertNotes.filter((item) => item.ticker?.toUpperCase() === ticker);
      const daysOld = daysSince(signal.signal_date);
      const latestContextDate = latestDate([
        signal.signal_date,
        ...relatedNews.map((item) => item.published_at),
        ...relatedNotes.map((item) => item.published_at),
      ]);
      const freshness = freshnessLabel(latestContextDate ?? signal.signal_date);

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

      if (daysOld !== null && daysOld <= 3) {
        score += 8;
      } else if (daysOld !== null && daysOld > 14) {
        score -= 8;
        risks.push('older signal');
      } else if (daysOld === null) {
        risks.push('signal date unavailable');
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
      const category =
        boundedScore >= 82
          ? 'Priority Research Candidate'
          : boundedScore >= 68
            ? 'Constructive Signal'
            : boundedScore >= 50
              ? 'Needs More Context'
              : 'Low-Support Signal';
      const confidence = boundedScore >= 82 ? 'High' : boundedScore >= 50 ? 'Medium' : 'Low';
      const rationale = `${ticker} ranked from signal strength, freshness, sentiment context, and expert/analyst context.`;

      return {
        ticker,
        category,
        score: boundedScore,
        confidence,
        freshness: freshness.label,
        freshnessTone: freshness.tone,
        rationale,
        signal,
        relatedNews,
        relatedNotes,
        catalysts: uniqueItems(catalysts),
        risks: uniqueItems(risks.length > 0 ? risks : ['market-wide volatility can change the setup']),
        latestContextDate,
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

function confidenceClass(confidence: string) {
  if (confidence === 'High') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  }

  if (confidence === 'Medium') {
    return 'bg-blue-50 text-blue-700 ring-blue-200';
  }

  return 'bg-slate-100 text-slate-700 ring-slate-200';
}

function sentimentClass(sentiment: MarketNews['sentiment']) {
  if (sentiment === 'positive') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  }

  if (sentiment === 'negative') {
    return 'bg-rose-50 text-rose-700 ring-rose-200';
  }

  return 'bg-slate-100 text-slate-700 ring-slate-200';
}

function stanceClass(stance: ExpertNote['stance']) {
  if (stance === 'bullish') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  }

  if (stance === 'bearish') {
    return 'bg-rose-50 text-rose-700 ring-rose-200';
  }

  return 'bg-slate-100 text-slate-700 ring-slate-200';
}

export default async function HomePage() {
  const data = await getDashboardData();
  const recommendations = buildRecommendations(data);
  const highConvictionCount = recommendations.filter((item) => item.score >= 82).length;
  const averageScore =
    recommendations.length > 0
      ? Math.round(recommendations.reduce((total, item) => total + item.score, 0) / recommendations.length)
      : 0;
  const latestSignalDate = latestDate(data.signals.map((signal) => signal.signal_date));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-8 md:px-8 lg:py-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Catalystic Market Intelligence
              </p>
              <h1 className="mt-2 max-w-4xl text-4xl font-bold tracking-normal text-slate-950 md:text-5xl">
                Stock discovery from ranked market signals
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                Surface research-worthy candidates with supporting evidence, risk factors, confidence, freshness, and market context.
              </p>
            </div>
            <div className="max-w-sm rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Research aid only. Rankings organize available signals and context; they are not financial advice.
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Ranked signals</p>
              <p className="mt-2 text-3xl font-bold">{data.signals.length}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Priority candidates</p>
              <p className="mt-2 text-3xl font-bold">{highConvictionCount}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Average score</p>
              <p className="mt-2 text-3xl font-bold">{averageScore}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Latest signal</p>
              <p className="mt-2 text-2xl font-bold">{formatDate(latestSignalDate)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:grid-cols-[minmax(0,1fr)_360px] md:px-8">
        <div className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Top Research Candidates</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Ranked signals with the evidence and missing context that shaped each score.
              </p>
            </div>
            <p className="text-sm font-medium text-slate-500">Score: 0-100</p>
          </div>

          {data.error ? (
            <div className="rounded-md border border-rose-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Dashboard unavailable</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Unable to load market signals. Check Supabase configuration or try again later.
              </h2>
              <p className="mt-3 text-sm text-slate-500">{data.error}</p>
            </div>
          ) : recommendations.length > 0 ? (
            recommendations.map((recommendation, index) => (
              <article
                key={recommendation.signal.id}
                className={`rounded-md border bg-white p-5 shadow-sm ${
                  index === 0 ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white">
                        #{index + 1}
                      </span>
                      <h3 className="text-3xl font-bold tracking-normal">{recommendation.ticker}</h3>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                        {recommendation.category}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${confidenceClass(recommendation.confidence)}`}>
                        {recommendation.confidence} confidence
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${recommendation.freshnessTone}`}>
                        {recommendation.freshness}
                      </span>
                    </div>
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-700">
                      {recommendation.rationale}
                    </p>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                      {recommendation.signal.signal_description}
                    </p>
                  </div>
                  <div className="min-w-32">
                    <p className="text-left text-3xl font-bold md:text-right">{recommendation.score}</p>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${scoreBarClass(recommendation.score)}`}
                        style={{ width: `${recommendation.score}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Why it ranked</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{recommendation.catalysts.join(', ')}</p>
                  </div>
                  <div className="rounded-md bg-amber-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Risk or missing context</p>
                    <p className="mt-2 text-sm leading-6 text-amber-950">{recommendation.risks[0]}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Market context</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {recommendation.relatedNews.length} news item{recommendation.relatedNews.length === 1 ? '' : 's'} ·{' '}
                      {recommendation.relatedNotes.length} expert note{recommendation.relatedNotes.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                <details className="mt-5 rounded-md border border-slate-200 bg-white">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-800">
                    Review supporting evidence and risk factors
                  </summary>
                  <div className="grid gap-5 border-t border-slate-200 p-4 lg:grid-cols-2">
                    <section>
                      <h4 className="text-sm font-bold text-slate-900">Supporting Market News</h4>
                      <div className="mt-3 space-y-3">
                        {recommendation.relatedNews.length > 0 ? (
                          recommendation.relatedNews.slice(0, 3).map((item) => (
                            <div key={item.id} className="rounded-md border border-slate-200 p-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${sentimentClass(item.sentiment)}`}>
                                  {item.sentiment ?? 'neutral'} sentiment
                                </span>
                                <span className="text-xs text-slate-500">{formatDate(item.published_at)}</span>
                              </div>
                              {item.url ? (
                                <a
                                  href={item.url}
                                  className="mt-2 block text-sm font-semibold leading-6 text-slate-900 hover:text-blue-700"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {item.headline}
                                </a>
                              ) : (
                                <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{item.headline}</p>
                              )}
                              {item.summary ? <p className="mt-1 text-sm leading-6 text-slate-500">{item.summary}</p> : null}
                              <p className="mt-2 text-xs text-slate-400">{item.source ?? 'Alpha Vantage'}</p>
                            </div>
                          ))
                        ) : (
                          <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm leading-6 text-slate-500">
                            No supporting market news is attached to this signal yet.
                          </p>
                        )}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-sm font-bold text-slate-900">Expert/Analyst Context</h4>
                      <div className="mt-3 space-y-3">
                        {recommendation.relatedNotes.length > 0 ? (
                          recommendation.relatedNotes.slice(0, 3).map((item) => (
                            <div key={item.id} className="rounded-md border border-slate-200 p-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${stanceClass(item.stance)}`}>
                                  {item.stance ?? 'neutral'} stance
                                </span>
                                <span className="text-xs text-slate-500">{formatDate(item.published_at)}</span>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-slate-700">{item.note}</p>
                              <p className="mt-2 text-xs text-slate-400">{item.source}</p>
                            </div>
                          ))
                        ) : (
                          <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm leading-6 text-slate-500">
                            No expert/analyst context is attached to this signal yet.
                          </p>
                        )}
                      </div>
                    </section>

                    <section className="lg:col-span-2">
                      <h4 className="text-sm font-bold text-slate-900">Risk Factors</h4>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {recommendation.risks.map((risk) => (
                          <span key={risk} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-200">
                            {risk}
                          </span>
                        ))}
                      </div>
                      <p className="mt-4 text-xs leading-5 text-slate-500">
                        Signal date: {formatDate(recommendation.signal.signal_date)} · Latest context:{' '}
                        {formatDate(recommendation.latestContextDate)} · Research aid only. Not financial advice.
                      </p>
                    </section>
                  </div>
                </details>
              </article>
            ))
          ) : (
            <div className="rounded-md border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">No ranked signals</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">No research signals available yet.</h2>
              <p className="mt-3 text-slate-500">Run the Alpha Vantage ingestor to populate news-driven market signals.</p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Market Context</h2>
            {data.warnings.length > 0 ? (
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                {data.warnings.join(' ')}
              </div>
            ) : null}
            <div className="mt-4 space-y-4">
              {data.news.length > 0 ? (
                data.news.slice(0, 5).map((item) => (
                  <div key={item.id} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{item.ticker}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${sentimentClass(item.sentiment)}`}>
                        {item.sentiment ?? 'neutral'}
                      </span>
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
                  No supporting market news is available yet.
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
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${stanceClass(item.stance)}`}>
                        {item.stance ?? 'neutral'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{item.note}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.source}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  No expert or analyst context is available yet.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Dashboard Notes</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Scores, confidence, and freshness are frontend summaries of stored signals and context. Use them to prioritize research, then review source evidence and risks.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
