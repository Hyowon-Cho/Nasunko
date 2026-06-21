import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { query } from "@/lib/db";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { rows } = await query<{ likes: number }>(
      `UPDATE trade_posts SET likes = likes + 1 WHERE id = $1 RETURNING likes`,
      [id],
    );
    if (!rows[0]) return NextResponse.json({ error: "인증을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ likes: rows[0].likes });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
