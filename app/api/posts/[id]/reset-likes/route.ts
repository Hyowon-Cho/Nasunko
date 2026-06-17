import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await query("UPDATE posts SET likes = 0 WHERE id = $1", [id]);
  return NextResponse.json({ ok: true, message: "좋아요 초기화 완료" });
}
