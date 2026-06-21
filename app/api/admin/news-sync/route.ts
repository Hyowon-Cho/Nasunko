import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { ensureNewsTables, syncNews } from "@/lib/news-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type NewsSyncRun = {
  id: number;
  status: string;
  started_at: Date;
  finished_at: Date | null;
  source_count: number;
  source_error_count: number;
  fetched_count: number;
  inserted_count: number;
  duplicate_count: number;
  deleted_count: number;
  duration_ms: number | null;
  details: unknown;
  error_message: string | null;
};

async function requireAdmin() {
  const user = await getCurrentUser();
  return user && isAdmin(user) ? user : null;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensureNewsTables();
  const [runs, articleCount] = await Promise.all([
    query<NewsSyncRun>(
      `SELECT id, status, started_at, finished_at, source_count, source_error_count,
              fetched_count, inserted_count, duplicate_count, deleted_count, duration_ms,
              details, error_message
       FROM news_sync_runs
       ORDER BY started_at DESC
       LIMIT 20`,
    ),
    query<{ count: number }>(`SELECT COUNT(*)::int AS count FROM news_articles`),
  ]);

  return NextResponse.json({
    articleCount: articleCount.rows[0]?.count ?? 0,
    runs: runs.rows,
  });
}

export async function POST() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const summary = await syncNews();
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    console.error("Manual news sync failed", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown news sync error" },
      { status: 500 },
    );
  }
}
