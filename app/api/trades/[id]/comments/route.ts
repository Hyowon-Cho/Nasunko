import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import type { TradeComment } from "@/lib/trades";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { rows } = await query<TradeComment>(
      `SELECT id, nickname, body, created_at
       FROM trade_comments WHERE trade_id = $1 ORDER BY created_at ASC`,
      [id],
    );
    return NextResponse.json(rows);
  } catch (error) {
    return databaseErrorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "로그인 후 댓글을 작성할 수 있습니다." }, { status: 401 });
  }

  const { body } = await request.json() as { body?: string };
  if (!body?.trim()) return NextResponse.json({ error: "댓글을 입력하세요." }, { status: 400 });

  try {
    const { rows } = await query<TradeComment>(
      `
      INSERT INTO trade_comments (trade_id, user_id, nickname, body)
      SELECT id, $2, $3, $4 FROM trade_posts WHERE id = $1
      RETURNING id, nickname, body, created_at
    `,
      [id, user.id, user.nickname, body.trim()],
    );
    if (!rows[0]) return NextResponse.json({ error: "인증을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
