import { query } from "@/lib/db";

export type TradeKind = "profit" | "loss";

export type TradePost = {
  id: string;
  type: TradeKind;
  symbol: string;
  title: string;
  content: string;
  author: string;
  author_role?: "user" | "admin";
  date: string;
  return_rate: number;
  realized_pnl: number | null;
  entry_price: number | null;
  exit_price: number | null;
  image_url?: string | null;
  views: number;
  likes: number;
  comments: number;
  is_owner?: boolean;
};

export type TradeComment = {
  id: number;
  nickname: string;
  body: string;
  created_at: string;
};

export type TradePayload = {
  type?: TradeKind;
  symbol?: string;
  title?: string;
  content?: string;
  return_rate?: number;
  realized_pnl?: number | null;
  entry_price?: number | null;
  exit_price?: number | null;
  image_url?: string | null;
};

export function createTradeId() {
  return `trade-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeSignedValue(value: number, type: TradeKind) {
  return type === "profit" ? Math.abs(value) : -Math.abs(value);
}

export async function ensureTradeTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS trade_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      type TEXT NOT NULL CHECK (type IN ('profit', 'loss')),
      symbol TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      date TEXT NOT NULL,
      return_rate NUMERIC(9, 2) NOT NULL,
      realized_pnl NUMERIC(16, 2),
      entry_price NUMERIC(16, 4),
      exit_price NUMERIC(16, 4),
      image_url TEXT,
      views INTEGER NOT NULL DEFAULT 0,
      likes INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS trade_comments (
      id BIGSERIAL PRIMARY KEY,
      trade_id TEXT NOT NULL REFERENCES trade_posts(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      nickname TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS trade_posts_created_at_idx ON trade_posts (created_at DESC)`);
  await query(`CREATE INDEX IF NOT EXISTS trade_posts_type_created_idx ON trade_posts (type, created_at DESC)`);
  await query(`CREATE INDEX IF NOT EXISTS trade_comments_trade_id_idx ON trade_comments (trade_id, created_at)`);
}
