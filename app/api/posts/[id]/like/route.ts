import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { query } from "@/lib/db";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { rows } = await query(
      "UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING likes",
      [id],
    );
    return NextResponse.json({ likes: rows[0]?.likes ?? 0 });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
