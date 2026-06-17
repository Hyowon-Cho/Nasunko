"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoungeEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), author: author.trim(), content: content.trim() })
      });
      const data = await res.json() as { id?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "글 등록에 실패했습니다.");
        return;
      }

      if (data.id) {
        router.push(`/lounge/${data.id}`);
      }
    } catch {
      setError("글 등록에 실패했습니다. DB 연결 상태를 확인하세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="lounge-editor card" onSubmit={onSubmit}>
      <label>
        <span>제목</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" />
      </label>
      <label>
        <span>작성자</span>
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="닉네임 (없으면 익명)" />
      </label>
      <label>
        <span>내용</span>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용을 입력하세요" rows={10} />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="editor-actions">
        <button className="button" type="button" onClick={() => router.push("/lounge")}>취소</button>
        <button className="button write-button" type="submit" disabled={loading}>
          {loading ? "등록 중..." : "등록"}
        </button>
      </div>
    </form>
  );
}
