"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LoungePost } from "@/lib/lounge";

export function LoungeList() {
  const [posts, setPosts] = useState<LoungePost[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data: LoungePost[]) => {
        setPosts(data);
        setIsReady(true);
      })
      .catch(() => setIsReady(true));
  }, []);

  async function deletePost(postId: string) {
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    setPosts((current) => current.filter((post) => post.id !== postId));
  }

  return (
    <>
      <section className="post-list section">
        {isReady && posts.length === 0 ? (
          <div className="empty-lounge">
            <strong>아직 작성된 글이 없습니다.</strong>
            <p>새 글을 눌러 첫 게시글을 작성해보세요.</p>
          </div>
        ) : null}
        {posts.map((post) => (
          <Link className="card post-card" href={`/lounge/${post.id}`} key={post.id}>
            <div>
              <h2>{post.title}</h2>
              <p>{post.author} · {post.date}</p>
            </div>
            <div className="post-actions">
              <span>♡ {post.likes}</span>
              <span>💬 {post.comments}</span>
              <span>⊙ {post.views}</span>
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
            </div>
          </Link>
        ))}
      </section>
      <p className="lounge-end">마지막 글입니다.</p>
    </>
  );
}
