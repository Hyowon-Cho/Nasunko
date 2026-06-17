import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { query } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await query("UPDATE posts SET views = views + 1 WHERE id = $1", [id]);

    const { rows } = await query(
      `
    SELECT p.id, p.title, p.author, p.date, p.content, p.image_url, p.views, p.likes,
           COUNT(c.id)::int AS comments
    FROM posts p
    LEFT JOIN comments c ON c.post_id = p.id
    WHERE p.id = $1
    GROUP BY p.id
  `,
      [id],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    return databaseErrorResponse(error);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await query("DELETE FROM posts WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { title, content, image_url } = await request.json() as { title?: string; content?: string; image_url?: string | null };

  if (!title?.trim()) {
    return NextResponse.json({ error: "제목을 입력하세요" }, { status: 400 });
  }
  if (!content?.trim() && !image_url) {
    return NextResponse.json({ error: "내용 또는 이미지를 입력하세요" }, { status: 400 });
  }

  try {
    const { rows } = await query(
      `
    UPDATE posts
    SET title = $1, content = $2, image_url = $3
    WHERE id = $4
    RETURNING id, title, author, date, content, image_url, views, likes
  `,
      [title.trim(), content?.trim() ?? "", image_url ?? null, id],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ...rows[0], comments: 0 });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
