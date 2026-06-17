"use client";

import { FormEvent, useState } from "react";

type Comment = {
  nickname: string;
  body: string;
};

export function CommentBox({ initialCount }: { initialCount: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nickname, setNickname] = useState("");
  const [body, setBody] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextNickname = nickname.trim();
    const nextBody = body.trim();

    if (!nextNickname || !nextBody) {
      return;
    }

    setComments((current) => [...current, { nickname: nextNickname, body: nextBody }]);
    setNickname("");
    setBody("");
  }

  const totalCount = initialCount + comments.length;

  return (
    <section className="lounge-comments">
      <h2>댓글 {totalCount}</h2>
      {totalCount === 0 ? (
        <p className="empty-comment">첫 댓글을 남겨보세요.</p>
      ) : (
        <div className="comment-list">
          {comments.map((comment, index) => (
            <article className="comment-item" key={`${comment.nickname}-${index}`}>
              <strong>{comment.nickname}</strong>
              <p>{comment.body}</p>
            </article>
          ))}
        </div>
      )}
      <form className="comment-form" onSubmit={onSubmit}>
        <input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="닉네임" aria-label="닉네임" />
        <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="댓글을 입력하세요" aria-label="댓글" rows={4} />
        <button className="button" type="submit">댓글 등록</button>
      </form>
    </section>
  );
}
