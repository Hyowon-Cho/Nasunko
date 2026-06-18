import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { createPostId, formatToday } from "@/lib/lounge";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const { rows } = await query(`
    SELECT p.id, p.title, p.author, p.date, p.content, p.image_url, p.views, p.likes, p.created_at,
           COUNT(c.id)::int AS comments,
           CASE WHEN p.user_id IS NOT NULL AND p.user_id = $1 THEN true ELSE false END AS is_owner
    FROM posts p
    LEFT JOIN comments c ON c.post_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `, [user?.id ?? null]);
    return NextResponse.json(rows);
  } catch (error) {
    return databaseErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "로그인 후 글을 작성할 수 있습니다." }, { status: 401 });
  }

  const { title, content, image_url } = await request.json() as { title?: string; content?: string; image_url?: string };

  if (!title?.trim()) {
    return NextResponse.json({ error: "제목을 입력하세요" }, { status: 400 });
  }
  if (!content?.trim() && !image_url) {
    return NextResponse.json({ error: "내용 또는 사진을 입력하세요" }, { status: 400 });
  }

  const id = createPostId();
  const date = formatToday();

  try {
    await query(
      `INSERT INTO posts (id, user_id, title, author, date, content, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, user.id, title.trim(), user.nickname, date, content?.trim() ?? "", image_url ?? null],
    );

    return NextResponse.json({ id });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
