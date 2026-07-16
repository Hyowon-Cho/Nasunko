"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { TradeKind } from "@/lib/trades";

export function TradeEditor() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<{ nickname: string } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [type, setType] = useState<TradeKind>("profit");
  const [symbol, setSymbol] = useState("");
  const [title, setTitle] = useState("");
  const [returnRate, setReturnRate] = useState("");
  const [realizedPnl, setRealizedPnl] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.ok ? res.json() as Promise<{ user: { nickname: string } | null }> : { user: null })
      .then((data) => {
        setUser(data.user);
        setAuthReady(true);
      })
      .catch(() => setAuthReady(true));
  }, []);

  async function uploadImage(file: File) {
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "이미지 업로드에 실패했습니다.");
      setImageUrl(data.url ?? null);
    } catch (reason) {
      setImagePreview(null);
      setError(reason instanceof Error ? reason.message : "이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          symbol,
          title,
          return_rate: returnRate,
          realized_pnl: realizedPnl || null,
          entry_price: entryPrice || null,
          exit_price: exitPrice || null,
          content,
          image_url: imageUrl,
        }),
      });
      const data = await res.json() as { id?: string; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error ?? "인증 등록에 실패했습니다.");
      router.push(`/trades/${data.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "인증 등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (authReady && !user) {
    return (
      <section className="auth-required-card">
        <h2>로그인이 필요합니다.</h2>
        <p>수익/손절 인증은 로그인한 회원만 작성할 수 있어요.</p>
        <div>
          <Link className="lounge-write-button" href="/login">로그인</Link>
          <Link className="button" href="/signup">회원가입</Link>
        </div>
      </section>
    );
  }

  return (
    <form className="lounge-editor trade-editor" onSubmit={onSubmit}>
      {user ? <p className="editor-user">{user.nickname}</p> : null}
      <div className="trade-kind-control">
        <button className={type === "profit" ? "active profit" : ""} type="button" onClick={() => setType("profit")}>수익</button>
        <button className={type === "loss" ? "active loss" : ""} type="button" onClick={() => setType("loss")}>손절</button>
      </div>
      <div className="trade-form-grid">
        <label>
          <span>종목</span>
          <input value={symbol} onChange={(event) => setSymbol(event.target.value.toUpperCase())} placeholder="" maxLength={16} required />
        </label>
        <label>
          <span>손익률 (%)</span>
          <input
            type="number"
            step="0.01"
            value={returnRate}
            onChange={(event) => {
              setReturnRate(event.target.value);
              if (Number(event.target.value) < 0) setType("loss");
            }}
            placeholder=""
            required
          />
        </label>
        <label>
          <span>실현손익 ($)</span>
          <input type="number" step="0.01" value={realizedPnl} onChange={(event) => setRealizedPnl(event.target.value)} placeholder="" />
        </label>
        <label>
          <span>진입가</span>
          <input type="number" step="0.0001" value={entryPrice} onChange={(event) => setEntryPrice(event.target.value)} placeholder="" />
        </label>
        <label>
          <span>청산가</span>
          <input type="number" step="0.0001" value={exitPrice} onChange={(event) => setExitPrice(event.target.value)} placeholder="" />
        </label>
      </div>
      <p className="trade-form-help">음수 손익률을 입력하면 손절로 자동 전환됩니다.</p>
      <label>
        <span>제목</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="" required />
      </label>
      <label>
        <span>복기</span>
        <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="진입 이유, 청산 근거, 다음에 고칠 점을 남겨보세요" rows={9} />
      </label>
      <div className="image-upload-area">
        <span>인증 이미지</span>
        {imagePreview ? (
          <div className="image-preview-wrap">
            <img src={imagePreview} alt="인증 이미지 미리보기" className="image-preview" />
            <button type="button" className="image-remove-btn" onClick={() => {
              setImageUrl(null);
              setImagePreview(null);
              if (fileRef.current) fileRef.current.value = "";
            }}>제거</button>
          </div>
        ) : (
          <button type="button" className="image-upload-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "업로드 중..." : "사진 첨부"}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden-file-input"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) uploadImage(file);
          }}
        />
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="editor-actions">
        <button className="button" type="button" onClick={() => router.push("/trades")}>취소</button>
        <button className="button write-button" type="submit" disabled={loading || uploading}>
          {loading ? "등록 중..." : "인증 등록"}
        </button>
      </div>
    </form>
  );
}
