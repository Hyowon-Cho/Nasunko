import { NextRequest, NextResponse } from "next/server";
import { syncNews } from "@/lib/news-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await syncNews();
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    console.error("News sync failed", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown news sync error" },
      { status: 500 },
    );
  }
}
