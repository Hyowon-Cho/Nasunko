import { NextResponse } from "next/server";

export function databaseErrorResponse(error: unknown) {
  console.error(error);

  const message =
    error instanceof Error && error.message.includes("DATABASE_URL")
      ? "DATABASE_URL 환경변수가 없습니다. 로컬 .env.local 또는 Vercel Environment Variables에 PostgreSQL 연결 문자열을 추가하세요."
      : "데이터베이스 요청에 실패했습니다. PostgreSQL 연결 상태를 확인하세요.";

  return NextResponse.json({ error: message }, { status: 503 });
}
