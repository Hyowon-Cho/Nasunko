"use client";

import { FormEvent, useEffect, useState } from "react";
import type { LoungeComment } from "@/lib/lounge";

export function CommentBox({ postId }: { postId: string }) {
  const [comments, setComments] = useState<LoungeComment[]>([]);
  const [nickname, setNickname] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((res) => res.json())
      .then((data: LoungeComment[]) => setComments(data))
      .catch(() => {});
  }, [postId]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nickname.trim() || !body.trim()) return;

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: nickname.trim(), body: body.trim() })
    });
    const data = await res.json() as LoungeComment;
    setComments((current) => [...current, data]);
    setNickname("");
    setBody("");
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
              <strong>{comment.nickname}</strong>
              <p>{comment.body}</p>
            </article>
          ))}
        </div>
      )}
      <form className="comment-form" onSubmit={onSubmit}>
        <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임" aria-label="닉네임" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="댓글을 입력하세요" aria-label="댓글" rows={4} />
        <button className="button" type="submit">댓글 등록</button>
      </form>
    </section>
  );
}
