import { createHash } from "crypto";
import { query } from "@/lib/db";
import { fetchNewsSources } from "@/lib/news";

export type NewsSyncSummary = {
  runId: number;
  status: "success" | "partial" | "failed" | "skipped";
  sourceCount: number;
  sourceErrorCount: number;
  fetchedCount: number;
  insertedCount: number;
  duplicateCount: number;
  deletedCount: number;
  durationMs: number;
};

const TRACKING_PARAMS = [
  "fbclid",
  "gclid",
  "utm_campaign",
  "utm_content",
  "utm_medium",
  "utm_source",
  "utm_term",
];

export async function ensureNewsTables() {
  await query(`CREATE TABLE IF NOT EXISTS news_articles (
    id BIGSERIAL PRIMARY KEY,
    source TEXT NOT NULL,
    source_url TEXT NOT NULL,
    canonical_url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    title_fingerprint TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  )`);
  await query(`CREATE INDEX IF NOT EXISTS news_articles_category_date_idx ON news_articles (category, published_at DESC)`);
  await query(`CREATE TABLE IF NOT EXISTS news_sync_runs (
    id BIGSERIAL PRIMARY KEY,
    status TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    source_count INTEGER NOT NULL DEFAULT 0,
    source_error_count INTEGER NOT NULL DEFAULT 0,
    fetched_count INTEGER NOT NULL DEFAULT 0,
    inserted_count INTEGER NOT NULL DEFAULT 0,
    duplicate_count INTEGER NOT NULL DEFAULT 0,
    deleted_count INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER,
    details JSONB NOT NULL DEFAULT '[]'::jsonb,
    error_message TEXT
  )`);
  await query(`CREATE INDEX IF NOT EXISTS news_sync_runs_started_at_idx ON news_sync_runs (started_at DESC)`);
}

function titleFingerprint(title: string) {
  const normalized = title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  if (!normalized) return null;
  return createHash("sha256").update(normalized).digest("hex");
}

function canonicalizeUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    for (const param of TRACKING_PARAMS) url.searchParams.delete(param);
    url.searchParams.sort();
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/$/, "");
    return url.toString();
  } catch {
    return null;
  }
}

export async function syncNews(): Promise<NewsSyncSummary> {
  const startedAt = Date.now();
  await ensureNewsTables();
  await query(
    `UPDATE news_sync_runs
     SET status = 'failed', finished_at = NOW(), error_message = 'Stale running job was closed automatically'
     WHERE status = 'running' AND started_at < NOW() - INTERVAL '20 minutes'`,
  );
  const activeRun = await query<{ id: number }>(
    `SELECT id FROM news_sync_runs WHERE status = 'running' ORDER BY started_at DESC LIMIT 1`,
  );
  if (activeRun.rows[0]) {
    return {
      runId: activeRun.rows[0].id,
      status: "skipped",
      sourceCount: 0,
      sourceErrorCount: 0,
      fetchedCount: 0,
      insertedCount: 0,
      duplicateCount: 0,
      deletedCount: 0,
      durationMs: Date.now() - startedAt,
    };
  }
  const run = await query<{ id: number }>(`INSERT INTO news_sync_runs (status) VALUES ('running') RETURNING id`);
  const runId = run.rows[0].id;

  try {
    const sources = await fetchNewsSources();
    const articles = sources.flatMap((source) => source.articles.map((article) => ({ article, source })));
    let insertedCount = 0;
    let eligibleCount = 0;

    for (const { article, source } of articles) {
      if (!article.url || !article.publishedAt) continue;
      const canonicalUrl = canonicalizeUrl(article.url);
      const fingerprint = titleFingerprint(article.title);
      if (!canonicalUrl || !fingerprint) continue;
      eligibleCount += 1;
      const result = await query(
        `INSERT INTO news_articles
          (source, source_url, canonical_url, title, title_fingerprint, category, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [source.source, source.sourceUrl, canonicalUrl, article.title,
          fingerprint, article.category, article.publishedAt],
      );
      insertedCount += result.rowCount ?? 0;
    }

    const deleted = await query(`DELETE FROM news_articles WHERE published_at < NOW() - INTERVAL '30 days'`);
    const sourceErrors = sources.filter((source) => source.error);
    if (sourceErrors.length === sources.length) {
      throw new Error("Every configured news source failed");
    }
    const status = sourceErrors.length > 0 ? "partial" : "success";
    const durationMs = Date.now() - startedAt;

    await query(
      `UPDATE news_sync_runs SET status = $2, finished_at = NOW(), source_count = $3,
       source_error_count = $4, fetched_count = $5, inserted_count = $6, duplicate_count = $7,
       deleted_count = $8, duration_ms = $9, details = $10::jsonb WHERE id = $1`,
      [runId, status, sources.length, sourceErrors.length, articles.length, insertedCount,
        eligibleCount - insertedCount, deleted.rowCount ?? 0, durationMs,
        JSON.stringify(sources.map((source) => ({ source: source.source, count: source.articles.length, error: source.error })))],
    );

    return { runId, status, sourceCount: sources.length, sourceErrorCount: sourceErrors.length,
      fetchedCount: articles.length, insertedCount, duplicateCount: eligibleCount - insertedCount,
      deletedCount: deleted.rowCount ?? 0, durationMs };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : "Unknown news sync error";
    await query(
      `UPDATE news_sync_runs SET status = 'failed', finished_at = NOW(), duration_ms = $2, error_message = $3 WHERE id = $1`,
      [runId, durationMs, message],
    );
    throw error;
  }
}
