import { query } from "@/lib/db";
import { getMagnificentSevenQuotes, getMarketQuotes, type MarketQuote } from "@/lib/markets";

export type MarketGroupSummary = {
  count: number;
  upCount: number;
  downCount: number;
  flatCount: number;
  avgChangePercent: number | null;
  liveCount: number;
};

export type MarketMove = {
  symbol: string;
  name: string;
  changePercent: number;
  price: number;
  source?: "live" | "fallback";
};

export type NewsDailyPoint = {
  date: string;
  label: string;
  count: number;
};

export type NewsCategoryPoint = {
  category: string;
  count: number;
};

export type MetricSummary = {
  news: {
    total: number;
    today: number;
    yesterday: number;
    todayDelta: number;
    last7Average: number;
    todayVs7DayAveragePercent: number | null;
    last7Days: number;
    last30Days: number;
    latestSyncStatus: string | null;
    latestSyncDurationMs: number | null;
    latestSyncAt: string | null;
    latestInserted: number;
    latestDuplicates: number;
    daily: NewsDailyPoint[];
  };
  market: {
    m7: MarketGroupSummary;
    bigTech: MarketGroupSummary;
    semiconductor: MarketGroupSummary;
    watched: MarketGroupSummary;
    riskOffScore: number;
    marketRiskScore: number;
    riskLevel: "낮음" | "보통" | "높음";
    riskReasons: string[];
    insight: string;
    topGainers: MarketMove[];
    topLosers: MarketMove[];
    mostVolatile: MarketMove[];
  };
  community: {
    posts: number;
    comments: number;
    activeAuthors: number;
    users: number;
  };
  trades: {
    total: number;
    profitCount: number;
    lossCount: number;
    avgReturn: number | null;
    avgProfit: number | null;
    avgLoss: number | null;
    totalRealizedPnl: number | null;
  };
  newsCategories: Array<{ category: string; count: number }>;
  newsCategories30Days: NewsCategoryPoint[];
};

type NewsSummaryRow = {
  total: number;
  today: number;
  yesterday: number;
  last_7_days: number;
  last_30_days: number;
};

type LatestSyncRow = {
  status: string | null;
  duration_ms: number | null;
  finished_at: string | null;
  inserted_count: number | null;
  duplicate_count: number | null;
};

type CommunitySummaryRow = {
  posts: number;
  comments: number;
  active_authors: number;
  users: number;
};

type TradeSummaryRow = {
  total: number;
  profit_count: number;
  loss_count: number;
  avg_return: number | null;
  avg_profit: number | null;
  avg_loss: number | null;
  total_realized_pnl: number | null;
};

type CategoryRow = {
  category: string;
  count: number;
};

type DailyNewsRow = {
  day: string;
  count: number;
};

function numberOrZero(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function nullableNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function summarizeQuotes(quotes: MarketQuote[]): MarketGroupSummary {
  const count = quotes.length;
  const upCount = quotes.filter((quote) => quote.changePercent > 0).length;
  const downCount = quotes.filter((quote) => quote.changePercent < 0).length;
  const flatCount = count - upCount - downCount;
  const avgChangePercent = count === 0 ? null : quotes.reduce((sum, quote) => sum + quote.changePercent, 0) / count;
  const liveCount = quotes.filter((quote) => quote.source === "live").length;

  return { count, upCount, downCount, flatCount, avgChangePercent, liveCount };
}

function marketMove(quote: MarketQuote): MarketMove {
  return {
    symbol: quote.symbol,
    name: quote.name,
    changePercent: quote.changePercent,
    price: quote.price,
    source: quote.source,
  };
}

function uniqueQuotes(quotes: MarketQuote[]) {
  const seen = new Map<string, MarketQuote>();
  for (const quote of quotes) {
    if (!seen.has(quote.symbol)) seen.set(quote.symbol, quote);
  }
  return [...seen.values()];
}

function maxAbsChange(quotes: MarketQuote[]) {
  if (quotes.length === 0) return 0;
  return Math.max(...quotes.map((quote) => Math.abs(quote.changePercent)));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getRiskLevel(score: number): MetricSummary["market"]["riskLevel"] {
  if (score >= 65) return "높음";
  if (score >= 35) return "보통";
  return "낮음";
}

function buildRiskInsight(params: {
  topCategory?: string;
  topVolatile?: MarketMove;
  marketRiskScore: number;
  todayDelta: number;
  todayVs7DayAveragePercent: number | null;
}) {
  const reasons: string[] = [];

  if (params.todayDelta > 0) {
    reasons.push(`오늘 뉴스가 어제보다 ${params.todayDelta}건 증가했습니다.`);
  } else if (params.todayDelta < 0) {
    reasons.push(`오늘 뉴스가 어제보다 ${Math.abs(params.todayDelta)}건 감소했습니다.`);
  } else {
    reasons.push("오늘 뉴스량은 어제와 비슷합니다.");
  }

  if (params.todayVs7DayAveragePercent !== null) {
    const direction = params.todayVs7DayAveragePercent >= 0 ? "높습니다" : "낮습니다";
    reasons.push(`최근 7일 평균 대비 ${Math.abs(params.todayVs7DayAveragePercent).toFixed(1)}% ${direction}.`);
  }

  if (params.topVolatile) {
    reasons.push(`${params.topVolatile.symbol} 변동성이 ${Math.abs(params.topVolatile.changePercent).toFixed(2)}%로 가장 큽니다.`);
  }

  const categoryText = params.topCategory ? `${params.topCategory} 뉴스 비중이 높고` : "뉴스 유입이 확인되고";
  const volatilityText = params.topVolatile ? `${params.topVolatile.symbol} 변동성이 커져` : "시장 움직임을 함께 확인해야 해";
  const riskText = params.marketRiskScore >= 65 ? "리스크가 높아졌습니다." : params.marketRiskScore >= 35 ? "리스크가 보통 수준입니다." : "리스크는 낮은 편입니다.";

  return {
    insight: `${categoryText} ${volatilityText} 시장 ${riskText}`,
    reasons,
  };
}

async function getMarketAnalytics(newsSignal: {
  today: number;
  last7Average: number;
  todayDelta: number;
  todayVs7DayAveragePercent: number | null;
  topCategory?: string;
}) {
  const [m7Quotes, bigTechQuotes, semiconductorQuotes] = await Promise.all([
    getMagnificentSevenQuotes(),
    getMarketQuotes("big-tech"),
    getMarketQuotes("semiconductor"),
  ]);
  const watchedQuotes = uniqueQuotes([...bigTechQuotes, ...semiconductorQuotes]);
  const topGainers = [...watchedQuotes].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5).map(marketMove);
  const topLosers = [...watchedQuotes].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5).map(marketMove);
  const mostVolatile = [...watchedQuotes].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 5).map(marketMove);
  const watched = summarizeQuotes(watchedQuotes);
  const riskOffScore = watched.count === 0 ? 0 : (watched.downCount / watched.count) * 100;
  const newsSpikeScore =
    newsSignal.last7Average <= 0
      ? newsSignal.today > 0 ? 60 : 0
      : clamp(((newsSignal.today / newsSignal.last7Average) - 1) * 100, 0, 100);
  const volatilityScore = clamp(maxAbsChange(watchedQuotes) * 14, 0, 100);
  const marketRiskScore = Math.round((newsSpikeScore * 0.35) + (riskOffScore * 0.4) + (volatilityScore * 0.25));
  const riskNarrative = buildRiskInsight({
    topCategory: newsSignal.topCategory,
    topVolatile: mostVolatile[0],
    marketRiskScore,
    todayDelta: newsSignal.todayDelta,
    todayVs7DayAveragePercent: newsSignal.todayVs7DayAveragePercent,
  });

  return {
    m7: summarizeQuotes(m7Quotes),
    bigTech: summarizeQuotes(bigTechQuotes),
    semiconductor: summarizeQuotes(semiconductorQuotes),
    watched,
    riskOffScore,
    marketRiskScore,
    riskLevel: getRiskLevel(marketRiskScore),
    riskReasons: riskNarrative.reasons,
    insight: riskNarrative.insight,
    topGainers,
    topLosers,
    mostVolatile,
  };
}

export async function getAnalyticsSummary(): Promise<MetricSummary> {
  const [newsSummary, latestSync, communitySummary, tradeSummary, newsCategories, newsCategories30Days, dailyNews] = await Promise.all([
    query<NewsSummaryRow>(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE fetched_at >= CURRENT_DATE)::int AS today,
        COUNT(*) FILTER (WHERE fetched_at >= CURRENT_DATE - INTERVAL '1 day' AND fetched_at < CURRENT_DATE)::int AS yesterday,
        COUNT(*) FILTER (WHERE fetched_at >= NOW() - INTERVAL '7 days')::int AS last_7_days,
        COUNT(*) FILTER (WHERE fetched_at >= NOW() - INTERVAL '30 days')::int AS last_30_days
      FROM news_articles
    `),
    query<LatestSyncRow>(`
      SELECT status, duration_ms, finished_at, inserted_count, duplicate_count
      FROM news_sync_runs
      ORDER BY started_at DESC
      LIMIT 1
    `),
    query<CommunitySummaryRow>(`
      SELECT
        (SELECT COUNT(*)::int FROM posts) AS posts,
        ((SELECT COUNT(*)::int FROM comments) + (SELECT COUNT(*)::int FROM trade_comments)) AS comments,
        (SELECT COUNT(DISTINCT user_id)::int FROM posts WHERE user_id IS NOT NULL) AS active_authors,
        (SELECT COUNT(*)::int FROM users) AS users
    `),
    query<TradeSummaryRow>(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE type = 'profit')::int AS profit_count,
        COUNT(*) FILTER (WHERE type = 'loss')::int AS loss_count,
        AVG(return_rate)::float8 AS avg_return,
        AVG(return_rate) FILTER (WHERE type = 'profit')::float8 AS avg_profit,
        AVG(return_rate) FILTER (WHERE type = 'loss')::float8 AS avg_loss,
        SUM(realized_pnl)::float8 AS total_realized_pnl
      FROM trade_posts
    `),
    query<CategoryRow>(`
      SELECT category, COUNT(*)::int AS count
      FROM news_articles
      WHERE fetched_at >= NOW() - INTERVAL '30 days'
      GROUP BY category
      ORDER BY count DESC, category ASC
      LIMIT 5
    `),
    query<CategoryRow>(`
      SELECT category, COUNT(*)::int AS count
      FROM news_articles
      WHERE fetched_at >= NOW() - INTERVAL '30 days'
      GROUP BY category
      ORDER BY count DESC, category ASC
    `),
    query<DailyNewsRow>(`
      SELECT
        day::date::text AS day,
        COUNT(news_articles.id)::int AS count
      FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') AS day
      LEFT JOIN news_articles
        ON news_articles.fetched_at >= day
       AND news_articles.fetched_at < day + INTERVAL '1 day'
      GROUP BY day
      ORDER BY day ASC
    `),
  ]);

  const news = newsSummary.rows[0];
  const sync = latestSync.rows[0];
  const community = communitySummary.rows[0];
  const trades = tradeSummary.rows[0];
  const today = numberOrZero(news?.today);
  const yesterday = numberOrZero(news?.yesterday);
  const last7Days = numberOrZero(news?.last_7_days);
  const last7Average = last7Days / 7;
  const todayDelta = today - yesterday;
  const todayVs7DayAveragePercent = last7Average <= 0 ? null : ((today - last7Average) / last7Average) * 100;
  const market = await getMarketAnalytics({
    today,
    last7Average,
    todayDelta,
    todayVs7DayAveragePercent,
    topCategory: newsCategories.rows[0]?.category,
  });

  return {
    news: {
      total: numberOrZero(news?.total),
      today,
      yesterday,
      todayDelta,
      last7Average,
      todayVs7DayAveragePercent,
      last7Days,
      last30Days: numberOrZero(news?.last_30_days),
      latestSyncStatus: sync?.status ?? null,
      latestSyncDurationMs: nullableNumber(sync?.duration_ms),
      latestSyncAt: sync?.finished_at ? new Date(sync.finished_at).toISOString() : null,
      latestInserted: numberOrZero(sync?.inserted_count),
      latestDuplicates: numberOrZero(sync?.duplicate_count),
      daily: dailyNews.rows.map((row) => {
        const date = new Date(row.day);
        return {
          date: row.day,
          label: `${date.getMonth() + 1}/${date.getDate()}`,
          count: numberOrZero(row.count),
        };
      }),
    },
    market,
    community: {
      posts: numberOrZero(community?.posts),
      comments: numberOrZero(community?.comments),
      activeAuthors: numberOrZero(community?.active_authors),
      users: numberOrZero(community?.users),
    },
    trades: {
      total: numberOrZero(trades?.total),
      profitCount: numberOrZero(trades?.profit_count),
      lossCount: numberOrZero(trades?.loss_count),
      avgReturn: nullableNumber(trades?.avg_return),
      avgProfit: nullableNumber(trades?.avg_profit),
      avgLoss: nullableNumber(trades?.avg_loss),
      totalRealizedPnl: nullableNumber(trades?.total_realized_pnl),
    },
    newsCategories: newsCategories.rows.map((row) => ({ category: row.category, count: numberOrZero(row.count) })),
    newsCategories30Days: newsCategories30Days.rows.map((row) => ({ category: row.category, count: numberOrZero(row.count) })),
  };
}
