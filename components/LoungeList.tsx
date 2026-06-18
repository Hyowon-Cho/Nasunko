"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LoungePost } from "@/lib/lounge";

export function LoungeList() {
  const [posts, setPosts] = useState<LoungePost[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/posts")
      .then(async (res) => {
        const data = await res.json() as LoungePost[] | { error?: string };
        if (!res.ok || !Array.isArray(data)) {
          throw new Error(Array.isArray(data) ? "게시글을 불러오지 못했습니다." : data.error ?? "게시글을 불러오지 못했습니다.");
        }
        return data;
      })
      .then((data) => {
        setPosts(data);
        setError("");
        setIsReady(true);
      })
      .catch((fetchError: unknown) => {
        setError(fetchError instanceof Error ? fetchError.message : "게시글을 불러오지 못했습니다.");
        setPosts([]);
        setIsReady(true);
      });
  }, []);

  async function deletePost(postId: string) {
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    setPosts((current) => current.filter((post) => post.id !== postId));
  }

  function makeExcerpt(content: string) {
    const text = content.replace(/\s+/g, " ").trim();
    if (!text) return "첨부 이미지를 공유한 글입니다.";
    return text.length > 90 ? `${text.slice(0, 90)}...` : text;
  }

  return (
    <>
      <section className="post-list section">
        {!isReady ? (
          <div className="lounge-loading">
            <span />
            <span />
            <span />
          </div>
        ) : null}
        {isReady && posts.length === 0 ? (
          <div className="empty-lounge">
            <strong>{error ? "라운지 연결이 필요합니다." : "아직 작성된 글이 없습니다."}</strong>
            <p>{error || "첫 번째 시장 이야기를 남겨보세요."}</p>
          </div>
        ) : null}
        {posts.map((post) => (
          <Link className="post-card" href={`/lounge/${post.id}`} key={post.id}>
            <div className="post-card-main">
              <div className="post-card-topic">라운지</div>
              <h2>{post.title}</h2>
              <p className="post-excerpt">{makeExcerpt(post.content ?? "")}</p>
              <p className="post-meta">{post.author} · {post.date}</p>
            </div>
            {post.image_url ? (
              <img className="post-thumb" src={post.image_url} alt="" />
            ) : null}
            <div className="post-actions">
              <span>♡ {post.likes}</span>
              <span>💬 {post.comments}</span>
              <span>⊙ {post.views}</span>
              {post.is_owner ? (
                <button
                  className="text-danger-button"
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    deletePost(post.id);
                  }}
                >
                  삭제
                </button>
              ) : null}
            </div>
          </Link>
        ))}
      </section>
      {isReady ? <p className="lounge-end">마지막 글입니다.</p> : null}
    </>
  );
}
