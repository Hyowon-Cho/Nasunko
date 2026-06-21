"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { LoungeComment } from "@/lib/lounge";

export function CommentBox({
  postId,
  resource = "posts",
}: {
  postId: string;
  resource?: "posts" | "trades";
}) {
  const [comments, setComments] = useState<LoungeComment[]>([]);
  const [user, setUser] = useState<{ nickname: string; role?: "user" | "admin" } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  function isComment(value: LoungeComment | { error?: string }): value is LoungeComment {
    return "id" in value && "body" in value;
  }

  useEffect(() => {
    fetch(`/api/${resource}/${postId}/comments`)
      .then((res) => res.json())
      .then((data: LoungeComment[]) => setComments(data))
      .catch(() => {});

    fetch("/api/auth/me")
      .then((res) => res.ok ? res.json() as Promise<{ user: { nickname: string; role?: "user" | "admin" } | null }> : { user: null })
      .then((data) => {
        setUser(data.user);
        setAuthReady(true);
      })
      .catch(() => setAuthReady(true));
  }, [postId, resource]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return;

    setError("");

    const res = await fetch(`/api/${resource}/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim() })
    });

    const data = await res.json() as LoungeComment | { error?: string };

    if (!res.ok || !isComment(data)) {
      setError("error" in data ? data.error ?? "댓글 등록에 실패했습니다." : "댓글 등록에 실패했습니다.");
      return;
    }

    setComments((current) => [...current, data]);
    setBody("");
  }

  async function deleteComment(commentId: number) {
    if (!window.confirm("댓글을 삭제할까요?")) return;

    const res = await fetch(`/api/${resource}/${postId}/comments/${commentId}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      setError("댓글 삭제에 실패했습니다.");
      return;
    }

    setComments((current) => current.filter((comment) => comment.id !== commentId));
  }

  return (
    <section className="lounge-comments">
      <h2>댓글 {comments.length}</h2>
      {comments.length === 0 ? (
        <p className="empty-comment">첫 댓글을 남겨보세요.</p>
      ) : (
        <div className="comment-list">
          {comments.map((comment) => (
            <article className="comment-item" key={comment.id}>
              <div className="comment-head">
                <strong>{comment.nickname}</strong>
                {user?.role === "admin" ? (
                  <button type="button" onClick={() => deleteComment(comment.id)}>삭제</button>
                ) : null}
              </div>
              <p>{comment.body}</p>
            </article>
          ))}
        </div>
      )}
      {authReady && !user ? (
        <div className="comment-login-box">
          <p>댓글을 작성하려면 로그인이 필요합니다.</p>
          <Link className="button" href="/login">로그인</Link>
        </div>
      ) : (
        <form className="comment-form" onSubmit={onSubmit}>
          {user ? <p className="comment-author">{user.nickname}</p> : null}
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="댓글을 입력하세요" aria-label="댓글" rows={4} />
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button" type="submit">댓글 등록</button>
        </form>
      )}
    </section>
  );
}
