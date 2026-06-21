"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TradeKind, TradePost } from "@/lib/trades";

type TradeFilter = "all" | TradeKind;

function formatMoney(value: number | null) {
  if (value === null) return null;
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function TradeList() {
  const [trades, setTrades] = useState<TradePost[]>([]);
  const [filter, setFilter] = useState<TradeFilter>("all");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/trades")
      .then(async (res) => {
        const data = await res.json() as TradePost[] | { error?: string };
        if (!res.ok || !Array.isArray(data)) {
          throw new Error(Array.isArray(data) ? "인증을 불러오지 못했습니다." : data.error ?? "인증을 불러오지 못했습니다.");
        }
        return data;
      })
      .then((data) => {
        setTrades(data);
        setReady(true);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "인증을 불러오지 못했습니다.");
        setReady(true);
      });
  }, []);

  const filteredTrades = useMemo(
    () => filter === "all" ? trades : trades.filter((trade) => trade.type === filter),
    [filter, trades],
  );

  async function deleteTrade(id: string) {
    if (!window.confirm("이 인증을 삭제할까요?")) return;
    const res = await fetch(`/api/trades/${id}`, { method: "DELETE" });
    if (res.ok) setTrades((current) => current.filter((trade) => trade.id !== id));
  }

  return (
    <section className="section">
      <div className="trade-filter" aria-label="수익 손절 필터">
        {([
          ["all", "전체"],
          ["profit", "수익"],
          ["loss", "손절"],
        ] as const).map(([value, label]) => (
          <button
            className={filter === value ? "active" : ""}
            type="button"
            onClick={() => setFilter(value)}
            key={value}
          >
            {label}
          </button>
        ))}
      </div>

      {!ready ? <div className="lounge-loading"><span /><span /><span /></div> : null}
      {ready && filteredTrades.length === 0 ? (
        <div className="empty-lounge trade-empty">
          <strong>{error || "아직 등록된 인증이 없습니다."}</strong>
          <p>{error ? "PostgreSQL 연결 상태를 확인하세요." : "실제 회원이 남긴 수익/손절 인증만 표시됩니다."}</p>
        </div>
      ) : null}

      <div className="trade-post-list">
        {filteredTrades.map((trade) => (
          <Link className="trade-post-card" href={`/trades/${trade.id}`} key={trade.id}>
            <div className="trade-post-head">
              <span className={`trade-kind ${trade.type}`}>{trade.type === "profit" ? "수익" : "손절"}</span>
              <strong className="trade-symbol">{trade.symbol}</strong>
              <span className={`trade-return ${trade.type}`}>
                {trade.return_rate > 0 ? "+" : ""}{trade.return_rate.toFixed(2)}%
              </span>
            </div>
            <h2>{trade.title}</h2>
            <p className="trade-excerpt">{trade.content || "이미지로 인증한 매매입니다."}</p>
            <div className="trade-card-meta">
              <span className="author-inline">
                {trade.author}
                {trade.author_role === "admin" ? <span className="admin-badge">관리자</span> : null}
              </span>
              <span>· {trade.date}</span>
              {trade.realized_pnl !== null ? <strong>{formatMoney(trade.realized_pnl)}</strong> : null}
            </div>
            {trade.image_url ? <img className="trade-post-thumb" src={trade.image_url} alt="" /> : null}
            <div className="post-actions">
              <span>♡ {trade.likes}</span>
              <span>댓글 {trade.comments}</span>
              <span>조회 {trade.views}</span>
              {trade.is_owner ? (
                <button
                  className="text-danger-button"
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    deleteTrade(trade.id);
                  }}
                >
                  삭제
                </button>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
