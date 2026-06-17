import { NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { query } from "@/lib/db";

export async function GET() {
  try {
    await query(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      date TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

    await query(`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      nickname TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

    return NextResponse.json({ ok: true, message: "테이블 생성 완료" });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
