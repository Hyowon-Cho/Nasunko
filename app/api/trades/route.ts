import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatToday } from "@/lib/lounge";
import {
  createTradeId,
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

export async function GET(request: NextRequest) {
  try {
    await ensureTradeTables();
    const user = await getCurrentUser();
    const requestedType = request.nextUrl.searchParams.get("type");
    const type = isTradeKind(requestedType) ? requestedType : null;
    const { rows } = await query<TradePost>(
      `
      SELECT t.id, t.type, t.symbol, t.title, t.content, t.author, t.date,
             t.return_rate::float8 AS return_rate,
             t.realized_pnl::float8 AS realized_pnl,
             t.entry_price::float8 AS entry_price,
             t.exit_price::float8 AS exit_price,
             t.image_url, t.views, t.likes, t.created_at,
             COALESCE(author_user.role, 'user') AS author_role,
             COUNT(c.id)::int AS comments,
             CASE WHEN $2 = true OR (t.user_id IS NOT NULL AND t.user_id = $1)
               THEN true ELSE false END AS is_owner
      FROM trade_posts t
      LEFT JOIN users author_user ON author_user.id = t.user_id
      LEFT JOIN trade_comments c ON c.trade_id = t.id
      WHERE ($3::text IS NULL OR t.type = $3)
      GROUP BY t.id, author_user.role
      ORDER BY t.created_at DESC
    `,
      [user?.id ?? null, isAdmin(user), type],
    );
    return NextResponse.json(rows);
  } catch (error) {
    return databaseErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "로그인 후 인증을 작성할 수 있습니다." }, { status: 401 });
  }

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
  const entryPrice = optionalNumber(payload.entry_price);
  const exitPrice = optionalNumber(payload.exit_price);

  try {
    await ensureTradeTables();
    const id = createTradeId();
    await query(
      `INSERT INTO trade_posts
        (id, user_id, type, symbol, title, content, author, date, return_rate,
         realized_pnl, entry_price, exit_price, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        id,
        user.id,
        payload.type,
        symbol,
        title,
        content,
        user.nickname,
        formatToday(),
        normalizeSignedValue(returnRate, payload.type),
        realizedPnl === null ? null : normalizeSignedValue(realizedPnl, payload.type),
        entryPrice,
        exitPrice,
        payload.image_url ?? null,
      ],
    );
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
