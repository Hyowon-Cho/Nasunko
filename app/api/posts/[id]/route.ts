import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const user = await getCurrentUser();
    await query("UPDATE posts SET views = views + 1 WHERE id = $1", [id]);

    const { rows } = await query(
      `
    SELECT p.id, p.title, p.author, p.date, p.content, p.image_url, p.views, p.likes,
           COALESCE(author_user.role, 'user') AS author_role,
           COUNT(c.id)::int AS comments,
           CASE WHEN $3 = true OR (p.user_id IS NOT NULL AND p.user_id = $2) THEN true ELSE false END AS is_owner
    FROM posts p
    LEFT JOIN users author_user ON author_user.id = p.user_id
    LEFT JOIN comments c ON c.post_id = p.id
    WHERE p.id = $1
    GROUP BY p.id, author_user.role
  `,
      [id, user?.id ?? null, isAdmin(user)],
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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { rowCount } = await query(
      "DELETE FROM posts WHERE id = $1 AND ($3 = true OR user_id = $2)",
      [id, user.id, isAdmin(user)],
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: "본인이 작성한 글만 삭제할 수 있습니다." }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

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
    WHERE id = $4 AND ($6 = true OR user_id = $5)
    RETURNING id, title, author, date, content, image_url, views, likes
  `,
      [title.trim(), content?.trim() ?? "", image_url ?? null, id, user.id, isAdmin(user)],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "본인이 작성한 글만 수정할 수 있습니다." }, { status: 403 });
    }

    return NextResponse.json({ ...rows[0], comments: 0 });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
