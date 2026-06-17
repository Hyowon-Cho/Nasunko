"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CommentBox } from "@/components/CommentBox";
import { LOUNGE_STORAGE_KEY, type LoungePost } from "@/lib/lounge";

export function LoungeDetail({ id }: { id: string }) {
  const router = useRouter();
  const [post, setPost] = useState<LoungePost | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = window.localStorage.getItem(LOUNGE_STORAGE_KEY);
      const posts = stored ? JSON.parse(stored) as LoungePost[] : [];
      const found = posts.find((item) => item.id === id) ?? null;

      if (found) {
        const updated = { ...found, views: found.views + 1 };
        const nextPosts = posts.map((item) => item.id === id ? updated : item);
        window.localStorage.setItem(LOUNGE_STORAGE_KEY, JSON.stringify(nextPosts));
        setPost(updated);
      }

      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [id]);

  function deletePost() {
    const stored = window.localStorage.getItem(LOUNGE_STORAGE_KEY);
    const posts = stored ? JSON.parse(stored) as LoungePost[] : [];
    const nextPosts = posts.filter((item) => item.id !== id);
    window.localStorage.setItem(LOUNGE_STORAGE_KEY, JSON.stringify(nextPosts));
    router.push("/lounge");
  }

  if (!isReady) {
    return <main className="main lounge-detail-main" />;
  }

  if (!post) {
    return (
      <main className="main lounge-detail-main">
        <div className="empty-lounge">
          <strong>글을 찾을 수 없습니다.</strong>
          <p>브라우저에 저장된 글이 없거나 삭제된 글입니다.</p>
          <Link className="button" href="/lounge">목록으로</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main lounge-detail-main">
      <article className="lounge-detail">
        <header>
          <h1>{post.title}</h1>
          <div className="detail-meta">
            <span>{post.author}</span>
            <span>·</span>
            <span>{post.date}</span>
            <span className="detail-counters">⊙ {post.views} ♡ {post.comments}</span>
          </div>
        </header>
        <div className="detail-body">
          {post.content.split("\n").map((line, index) => (
            <p key={`${line}-${index}`}>{line || "\u00a0"}</p>
          ))}
        </div>
        <div className="detail-like">
          <button type="button">♡ {post.likes}</button>
          <button className="danger-button" type="button" onClick={deletePost}>삭제</button>
        </div>
      </article>
      <CommentBox initialCount={post.comments} />
    </main>
  );
}
