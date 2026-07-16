import { query } from "@/lib/db";

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
  risk: {
    lossRatio: number | null;
    avgLossMagnitude: number | null;
    maxLoss: number | null;
  };
  newsCategories: Array<{ category: string; count: number }>;
  topTradeSymbols: Array<{ symbol: string; trades: number; avgReturn: number | null; totalPnl: number | null }>;
  lossSymbols: Array<{ symbol: string; losses: number; avgLoss: number | null }>;
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
  loss_ratio: number | null;
  avg_loss_magnitude: number | null;
  max_loss: number | null;
};

type CategoryRow = {
  category: string;
  count: number;
};

type SymbolRow = {
  symbol: string;
  trades: number;
  avg_return: number | null;
  total_pnl: number | null;
};

type LossSymbolRow = {
  symbol: string;
  losses: number;
  avg_loss: number | null;
};

function numberOrZero(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function nullableNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getAnalyticsSummary(): Promise<MetricSummary> {
  const [newsSummary, latestSync, communitySummary, tradeSummary, newsCategories, topTradeSymbols, lossSymbols] = await Promise.all([
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
        SUM(realized_pnl)::float8 AS total_realized_pnl,
        CASE WHEN COUNT(*) = 0 THEN NULL ELSE (COUNT(*) FILTER (WHERE type = 'loss')::float8 / COUNT(*)::float8) * 100 END AS loss_ratio,
        AVG(ABS(return_rate)) FILTER (WHERE type = 'loss')::float8 AS avg_loss_magnitude,
        MIN(return_rate)::float8 AS max_loss
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
    query<SymbolRow>(`
      SELECT
        symbol,
        COUNT(*)::int AS trades,
        AVG(return_rate)::float8 AS avg_return,
        SUM(realized_pnl)::float8 AS total_pnl
      FROM trade_posts
      GROUP BY symbol
      ORDER BY trades DESC, symbol ASC
      LIMIT 5
    `),
    query<LossSymbolRow>(`
      SELECT
        symbol,
        COUNT(*)::int AS losses,
        AVG(return_rate)::float8 AS avg_loss
      FROM trade_posts
      WHERE type = 'loss'
      GROUP BY symbol
      ORDER BY losses DESC, avg_loss ASC, symbol ASC
      LIMIT 5
    `),
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
    risk: {
      lossRatio: nullableNumber(trades?.loss_ratio),
      avgLossMagnitude: nullableNumber(trades?.avg_loss_magnitude),
      maxLoss: nullableNumber(trades?.max_loss),
    },
    newsCategories: newsCategories.rows.map((row) => ({ category: row.category, count: numberOrZero(row.count) })),
    topTradeSymbols: topTradeSymbols.rows.map((row) => ({
      symbol: row.symbol,
      trades: numberOrZero(row.trades),
      avgReturn: nullableNumber(row.avg_return),
      totalPnl: nullableNumber(row.total_pnl),
    })),
    lossSymbols: lossSymbols.rows.map((row) => ({
      symbol: row.symbol,
      losses: numberOrZero(row.losses),
      avgLoss: nullableNumber(row.avg_loss),
    })),
  };
}
