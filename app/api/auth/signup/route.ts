import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { createSession, hashPassword, isAdminEmail } from "@/lib/auth";
import { query } from "@/lib/db";

type PostgresError = Error & {
  code?: string;
};

export async function POST(request: NextRequest) {
  const { email, password, nickname } = await request.json() as {
    email?: string;
    password?: string;
    nickname?: string;
  };

  const cleanEmail = email?.trim().toLowerCase();
  const cleanNickname = nickname?.trim();

  if (!cleanEmail || !cleanEmail.includes("@")) {
    return NextResponse.json({ error: "이메일을 입력하세요." }, { status: 400 });
  }

  if (!cleanNickname) {
    return NextResponse.json({ error: "닉네임을 입력하세요." }, { status: 400 });
  }

  if (!password || password.length < 8) {
    return NextResponse.json({ error: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
  }

  try {
    const id = randomUUID();
    const passwordHash = hashPassword(password);
    const role = isAdminEmail(cleanEmail) ? "admin" : "user";

    const { rows } = await query<{ id: string; email: string; nickname: string; role: string }>(
      `
      INSERT INTO users (id, email, nickname, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, nickname, role
    `,
      [id, cleanEmail, cleanNickname, passwordHash, role],
    );

    await createSession(id);

    return NextResponse.json({ user: rows[0] });
  } catch (error) {
    if (error instanceof Error && (error as PostgresError).code === "23505") {
      return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
    }

    return databaseErrorResponse(error);
  }
}
