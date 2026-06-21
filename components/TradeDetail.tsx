"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CommentBox } from "@/components/CommentBox";
import type { TradeKind, TradePost } from "@/lib/trades";

type EditState = {
  type: TradeKind;
  symbol: string;
  title: string;
  content: string;
  returnRate: string;
  realizedPnl: string;
  entryPrice: string;
  exitPrice: string;
  imageUrl: string | null;
};

function formatMoney(value: number | null) {
  if (value === null) return "-";
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function editStateFromTrade(trade: TradePost): EditState {
  return {
    type: trade.type,
    symbol: trade.symbol,
    title: trade.title,
    content: trade.content,
    returnRate: String(Math.abs(trade.return_rate)),
    realizedPnl: trade.realized_pnl === null ? "" : String(Math.abs(trade.realized_pnl)),
    entryPrice: trade.entry_price === null ? "" : String(trade.entry_price),
    exitPrice: trade.exit_price === null ? "" : String(trade.exit_price),
    imageUrl: trade.image_url ?? null,
  };
}

export function TradeDetail({ id }: { id: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [trade, setTrade] = useState<TradePost | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/trades/${id}`)
      .then((res) => res.ok ? res.json() as Promise<TradePost> : null)
      .then((data) => {
        setTrade(data);
        if (data) setEdit(editStateFromTrade(data));
        setReady(true);
      })
      .catch(() => setReady(true));
    window.setTimeout(() => {
      setLiked(localStorage.getItem(`trade-liked:${id}`) === "1");
    }, 0);
  }, [id]);

  async function deleteTrade() {
    if (!window.confirm("이 인증을 삭제할까요?")) return;
    const res = await fetch(`/api/trades/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/trades");
  }

  async function likeTrade() {
    if (liked) return;
    const res = await fetch(`/api/trades/${id}/like`, { method: "POST" });
    const data = await res.json() as { likes?: number };
    if (res.ok && typeof data.likes === "number") {
      setTrade((current) => current ? { ...current, likes: data.likes ?? current.likes } : current);
      setLiked(true);
      localStorage.setItem(`trade-liked:${id}`, "1");
    }
  }

  async function uploadImage(file: File) {
    if (!edit) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "이미지 업로드에 실패했습니다.");
      setEdit((current) => current ? { ...current, imageUrl: data.url ?? null } : current);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }

  async function saveTrade() {
    if (!edit) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/trades/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: edit.type,
          symbol: edit.symbol,
          title: edit.title,
          content: edit.content,
          return_rate: edit.returnRate,
          realized_pnl: edit.realizedPnl || null,
          entry_price: edit.entryPrice || null,
          exit_price: edit.exitPrice || null,
          image_url: edit.imageUrl,
        }),
      });
      const data = await res.json() as TradePost | { error?: string };
      if (!res.ok || !("id" in data)) {
        throw new Error("error" in data ? data.error ?? "저장에 실패했습니다." : "저장에 실패했습니다.");
      }
      setTrade((current) => current ? { ...current, ...data, comments: current.comments } : data);
      setEditing(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return <main className="main lounge-detail-main" />;
  if (!trade || !edit) {
    return (
      <main className="main lounge-detail-main">
        <div className="empty-lounge">
          <strong>인증을 찾을 수 없습니다.</strong>
          <Link className="button" href="/trades">목록으로</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main lounge-detail-main">
      <nav className="lounge-detail-nav"><Link href="/trades">수익/손절</Link></nav>
      <article className="lounge-detail trade-detail">
        <header>
          <div className="trade-detail-heading">
            <span className={`trade-kind ${trade.type}`}>{trade.type === "profit" ? "수익" : "손절"}</span>
            <span className="trade-symbol">{trade.symbol}</span>
          </div>
          <h1>{trade.title}</h1>
          <div className="detail-meta">
            <span className="author-inline">
              {trade.author}
              {trade.author_role === "admin" ? <span className="admin-badge">관리자</span> : null}
            </span>
            <span>·</span>
            <span>{trade.date}</span>
            <span className="detail-counters">조회 {trade.views} · 좋아요 {trade.likes} · 댓글 {trade.comments}</span>
          </div>
        </header>

        {editing ? (
          <div className="detail-edit-form trade-edit-form">
            <div className="trade-kind-control">
              <button className={edit.type === "profit" ? "active profit" : ""} type="button" onClick={() => setEdit({ ...edit, type: "profit" })}>수익</button>
              <button className={edit.type === "loss" ? "active loss" : ""} type="button" onClick={() => setEdit({ ...edit, type: "loss" })}>손절</button>
            </div>
            <div className="trade-form-grid">
              <label><span>종목</span><input value={edit.symbol} onChange={(event) => setEdit({ ...edit, symbol: event.target.value.toUpperCase() })} /></label>
              <label><span>수익률 (%)</span><input type="number" step="0.01" value={edit.returnRate} onChange={(event) => setEdit({ ...edit, returnRate: event.target.value })} /></label>
              <label><span>실현손익 ($)</span><input type="number" step="0.01" value={edit.realizedPnl} onChange={(event) => setEdit({ ...edit, realizedPnl: event.target.value })} /></label>
              <label><span>진입가</span><input type="number" step="0.0001" value={edit.entryPrice} onChange={(event) => setEdit({ ...edit, entryPrice: event.target.value })} /></label>
              <label><span>청산가</span><input type="number" step="0.0001" value={edit.exitPrice} onChange={(event) => setEdit({ ...edit, exitPrice: event.target.value })} /></label>
            </div>
            <label><span>제목</span><input value={edit.title} onChange={(event) => setEdit({ ...edit, title: event.target.value })} /></label>
            <label><span>복기</span><textarea rows={9} value={edit.content} onChange={(event) => setEdit({ ...edit, content: event.target.value })} /></label>
            <div className="image-upload-area">
              <span>인증 이미지</span>
              {edit.imageUrl ? (
                <div className="image-preview-wrap">
                  <img src={edit.imageUrl} alt="인증 이미지 미리보기" className="image-preview" />
                  <button type="button" className="image-remove-btn" onClick={() => setEdit({ ...edit, imageUrl: null })}>제거</button>
                </div>
              ) : (
                <button type="button" className="image-upload-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? "업로드 중..." : "사진 첨부"}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden-file-input" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadImage(file);
              }} />
            </div>
            {error ? <p className="form-error">{error}</p> : null}
          </div>
        ) : (
          <>
            <section className="trade-metrics">
              <div><span>수익률</span><strong className={trade.type}>{trade.return_rate > 0 ? "+" : ""}{trade.return_rate.toFixed(2)}%</strong></div>
              <div><span>실현손익</span><strong>{formatMoney(trade.realized_pnl)}</strong></div>
              <div><span>진입가</span><strong>{trade.entry_price?.toLocaleString() ?? "-"}</strong></div>
              <div><span>청산가</span><strong>{trade.exit_price?.toLocaleString() ?? "-"}</strong></div>
            </section>
            <div className="detail-body">
              {trade.image_url ? <img src={trade.image_url} alt="매매 인증 이미지" className="detail-image" /> : null}
              {trade.content.split("\n").map((line, index) => <p key={`${line}-${index}`}>{line || " "}</p>)}
            </div>
          </>
        )}

        <div className="detail-like">
          {editing ? (
            <>
              <button type="button" onClick={() => {
                setEdit(editStateFromTrade(trade));
                setEditing(false);
              }}>취소</button>
              <button type="button" onClick={saveTrade} disabled={saving || uploading}>{saving ? "저장 중..." : "저장"}</button>
            </>
          ) : (
            <>
              <button type="button" onClick={likeTrade} disabled={liked} className={liked ? "liked-button" : ""}>
                {liked ? "♥" : "♡"} {trade.likes}
              </button>
              {trade.is_owner ? <button type="button" onClick={() => setEditing(true)}>수정</button> : null}
            </>
          )}
          {trade.is_owner ? <button className="danger-button" type="button" onClick={deleteTrade}>삭제</button> : null}
        </div>
      </article>
      <CommentBox postId={id} resource="trades" />
    </main>
  );
}
