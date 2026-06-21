import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import {
  ensureTradeTables,
  normalizeSignedValue,
  type TradeKind,
  type TradePayload,
  type TradePost,
} from "@/lib/trades";

function isTradeKind(value: unknown): value is TradeKind {
  return value === "profit" || value === "loss";
}

function optionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await ensureTradeTables();
    const user = await getCurrentUser();
    await query(`UPDATE trade_posts SET views = views + 1 WHERE id = $1`, [id]);
    const { rows } = await query<TradePost>(
      `
      SELECT t.id, t.type, t.symbol, t.title, t.content, t.author, t.date,
             t.return_rate::float8 AS return_rate,
             t.realized_pnl::float8 AS realized_pnl,
             t.entry_price::float8 AS entry_price,
             t.exit_price::float8 AS exit_price,
             t.image_url, t.views, t.likes,
             COALESCE(author_user.role, 'user') AS author_role,
             COUNT(c.id)::int AS comments,
             CASE WHEN $3 = true OR (t.user_id IS NOT NULL AND t.user_id = $2)
               THEN true ELSE false END AS is_owner
      FROM trade_posts t
      LEFT JOIN users author_user ON author_user.id = t.user_id
      LEFT JOIN trade_comments c ON c.trade_id = t.id
      WHERE t.id = $1
      GROUP BY t.id, author_user.role
    `,
      [id, user?.id ?? null, isAdmin(user)],
    );
    if (!rows[0]) return NextResponse.json({ error: "인증을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    return databaseErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const payload = await request.json() as TradePayload;
  if (!isTradeKind(payload.type)) {
    return NextResponse.json({ error: "수익 또는 손절을 선택하세요." }, { status: 400 });
  }

  const symbol = payload.symbol?.trim().toUpperCase();
  const title = payload.title?.trim();
  const content = payload.content?.trim() ?? "";
  const returnRate = Number(payload.return_rate);
  if (!symbol || !title || !Number.isFinite(returnRate)) {
    return NextResponse.json({ error: "종목, 제목, 수익률을 입력하세요." }, { status: 400 });
  }
  if (!content && !payload.image_url) {
    return NextResponse.json({ error: "복기 내용 또는 인증 이미지를 입력하세요." }, { status: 400 });
  }

  const realizedPnl = optionalNumber(payload.realized_pnl);
  try {
    const { rows } = await query<TradePost>(
      `
      UPDATE trade_posts
      SET type = $1, symbol = $2, title = $3, content = $4, return_rate = $5,
          realized_pnl = $6, entry_price = $7, exit_price = $8, image_url = $9
      WHERE id = $10 AND ($12 = true OR user_id = $11)
      RETURNING id, type, symbol, title, content, author, date,
                return_rate::float8 AS return_rate,
                realized_pnl::float8 AS realized_pnl,
                entry_price::float8 AS entry_price,
                exit_price::float8 AS exit_price,
                image_url, views, likes
    `,
      [
        payload.type,
        symbol,
        title,
        content,
        normalizeSignedValue(returnRate, payload.type),
        realizedPnl === null ? null : normalizeSignedValue(realizedPnl, payload.type),
        optionalNumber(payload.entry_price),
        optionalNumber(payload.exit_price),
        payload.image_url ?? null,
        id,
        user.id,
        isAdmin(user),
      ],
    );
    if (!rows[0]) {
      return NextResponse.json({ error: "본인 인증만 수정할 수 있습니다." }, { status: 403 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    return databaseErrorResponse(error);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  try {
    const result = await query(
      `DELETE FROM trade_posts WHERE id = $1 AND ($3 = true OR user_id = $2)`,
      [id, user.id, isAdmin(user)],
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "본인 인증만 삭제할 수 있습니다." }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
