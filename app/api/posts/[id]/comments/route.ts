import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { query } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { rows } = await query(
      `
    SELECT id, nickname, body, created_at
    FROM comments
    WHERE post_id = $1
    ORDER BY created_at ASC
  `,
      [id],
    );
    return NextResponse.json(rows);
  } catch (error) {
    return databaseErrorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { nickname, body } = await request.json() as { nickname?: string; body?: string };

  if (!nickname?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "닉네임과 댓글을 입력하세요" }, { status: 400 });
  }

  try {
    const { rows } = await query(
      `
    INSERT INTO comments (post_id, nickname, body)
    VALUES ($1, $2, $3)
    RETURNING id, nickname, body, created_at
  `,
      [id, nickname.trim(), body.trim()],
    );

    return NextResponse.json(rows[0]);
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
