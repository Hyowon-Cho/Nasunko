import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { query } from "@/lib/db";
import { createPostId, formatToday } from "@/lib/lounge";

export async function GET() {
  try {
    const { rows } = await query(`
    SELECT p.id, p.title, p.author, p.date, p.views, p.likes, p.created_at,
           COUNT(c.id)::int AS comments
    FROM posts p
    LEFT JOIN comments c ON c.post_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);
    return NextResponse.json(rows);
  } catch (error) {
    return databaseErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const { title, author, content } = await request.json() as { title?: string; author?: string; content?: string };

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "제목과 내용을 입력하세요" }, { status: 400 });
  }

  const id = createPostId();
  const date = formatToday();
  const authorName = author?.trim() || "익명";

  try {
    await query(
      `
    INSERT INTO posts (id, title, author, date, content)
    VALUES ($1, $2, $3, $4, $5)
  `,
      [id, title.trim(), authorName, date, content.trim()],
    );

    return NextResponse.json({ id });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
