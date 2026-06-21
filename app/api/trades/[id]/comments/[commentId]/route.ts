import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const { id, commentId } = await params;
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "관리자만 댓글을 삭제할 수 있습니다." }, { status: 403 });
  }

  try {
    const result = await query(
      `DELETE FROM trade_comments WHERE id = $1 AND trade_id = $2`,
      [Number(commentId), id],
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
