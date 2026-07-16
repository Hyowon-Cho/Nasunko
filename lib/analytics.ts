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

export type MetricSummary = {
  news: {
    total: number;
    today: number;
    last7Days: number;
    latestSyncStatus: string | null;
    latestSyncDurationMs: number | null;
    latestSyncAt: string | null;
    latestInserted: number;
    latestDuplicates: number;
  };
  market: {
    m7: MarketGroupSummary;
    bigTech: MarketGroupSummary;
    semiconductor: MarketGroupSummary;
    watched: MarketGroupSummary;
    riskOffScore: number;
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
};

type NewsSummaryRow = {
  total: number;
  today: number;
  last_7_days: number;
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

async function getMarketAnalytics() {
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

  return {
    m7: summarizeQuotes(m7Quotes),
    bigTech: summarizeQuotes(bigTechQuotes),
    semiconductor: summarizeQuotes(semiconductorQuotes),
    watched,
    riskOffScore,
    topGainers,
    topLosers,
    mostVolatile,
  };
}

export async function getAnalyticsSummary(): Promise<MetricSummary> {
  const [newsSummary, latestSync, communitySummary, tradeSummary, newsCategories, market] = await Promise.all([
    query<NewsSummaryRow>(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE fetched_at >= CURRENT_DATE)::int AS today,
        COUNT(*) FILTER (WHERE fetched_at >= NOW() - INTERVAL '7 days')::int AS last_7_days
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
    getMarketAnalytics(),
  ]);

  const news = newsSummary.rows[0];
  const sync = latestSync.rows[0];
  const community = communitySummary.rows[0];
  const trades = tradeSummary.rows[0];

  return {
    news: {
      total: numberOrZero(news?.total),
      today: numberOrZero(news?.today),
      last7Days: numberOrZero(news?.last_7_days),
      latestSyncStatus: sync?.status ?? null,
      latestSyncDurationMs: nullableNumber(sync?.duration_ms),
      latestSyncAt: sync?.finished_at ? new Date(sync.finished_at).toISOString() : null,
      latestInserted: numberOrZero(sync?.inserted_count),
      latestDuplicates: numberOrZero(sync?.duplicate_count),
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
  };
}
