import { NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { getAdminEmails } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      nickname TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'`);

    await query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

    await query(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
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

    await query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT`);
    await query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE SET NULL`);

    const adminEmails = getAdminEmails();
    const normalizedResult = await query(
      `UPDATE users SET role = 'user' WHERE LOWER(email) <> ALL($1::text[])`,
      [adminEmails],
    );
    const promotedResult = await query(
      `UPDATE users SET role = 'admin' WHERE LOWER(email) = ANY($1::text[])`,
      [adminEmails],
    );

    return NextResponse.json({
      ok: true,
      message: "setup complete",
      admin_email_count: adminEmails.length,
      promoted_admins: promotedResult.rowCount ?? 0,
      normalized_users: normalizedResult.rowCount ?? 0,
    });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
