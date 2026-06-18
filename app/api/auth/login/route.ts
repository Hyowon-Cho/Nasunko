import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { createSession, verifyPassword } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json() as { email?: string; password?: string };
  const cleanEmail = email?.trim().toLowerCase();

  if (!cleanEmail || !password) {
    return NextResponse.json({ error: "이메일과 비밀번호를 입력하세요." }, { status: 400 });
  }

  try {
    const { rows } = await query<{
      id: string;
      email: string;
      nickname: string;
      password_hash: string;
    }>(
      `
      SELECT id, email, nickname, password_hash
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
      [cleanEmail],
    );

    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    await createSession(user.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email, nickname: user.nickname },
    });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
