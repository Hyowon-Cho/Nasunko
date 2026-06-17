"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createPostId, formatToday, LOUNGE_STORAGE_KEY, type LoungePost } from "@/lib/lounge";

export function LoungeEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();
    const nextAuthor = author.trim() || "익명";
    const nextContent = content.trim();

    if (!nextTitle || !nextContent) {
      return;
    }

    const stored = window.localStorage.getItem(LOUNGE_STORAGE_KEY);
    const currentPosts = stored ? JSON.parse(stored) as LoungePost[] : [];
    const post: LoungePost = {
      id: createPostId(),
      title: nextTitle,
      author: nextAuthor,
      date: formatToday(),
      views: 0,
      likes: 0,
      comments: 0,
      content: nextContent
    };

    window.localStorage.setItem(LOUNGE_STORAGE_KEY, JSON.stringify([post, ...currentPosts]));
    router.push(`/lounge/${post.id}`);
  }

  return (
    <form className="lounge-editor card" onSubmit={onSubmit}>
      <label>
        <span>제목</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="제목을 입력하세요" />
      </label>
      <label>
        <span>작성자</span>
        <input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="닉네임" />
      </label>
      <label>
        <span>내용</span>
        <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="내용을 입력하세요" rows={10} />
      </label>
      <div className="editor-actions">
        <button className="button" type="button" onClick={() => router.push("/lounge")}>취소</button>
        <button className="button write-button" type="submit">등록</button>
      </div>
    </form>
  );
}
