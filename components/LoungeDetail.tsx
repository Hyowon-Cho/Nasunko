"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CommentBox } from "@/components/CommentBox";
import type { LoungePost } from "@/lib/lounge";

export function LoungeDetail({ id }: { id: string }) {
  const router = useRouter();
  const [post, setPost] = useState<LoungePost | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [liked, setLiked] = useState(false);
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((res) => res.ok ? res.json() as Promise<LoungePost> : null)
      .then((data) => {
        setPost(data);
        setEditTitle(data?.title ?? "");
        setEditContent(data?.content ?? "");
        setEditImageUrl(data?.image_url ?? null);
        setEditImagePreview(data?.image_url ?? null);
        setIsReady(true);
      })
      .catch(() => setIsReady(true));

    setLiked(localStorage.getItem(`liked:${id}`) === "1");
  }, [id]);

  async function deletePost() {
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    router.push("/lounge");
  }

  async function likePost() {
    if (liked) return;
    const res = await fetch(`/api/posts/${id}/like`, { method: "POST" });
    const data = await res.json() as { likes: number };
    setPost((current) => current ? { ...current, likes: data.likes } : current);
    setLiked(true);
    localStorage.setItem(`liked:${id}`, "1");
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json() as { url?: string };
      if (res.ok) setEditImageUrl(data.url ?? null);
      else { setEditImagePreview(editImageUrl); }
    } catch {
      setEditImagePreview(editImageUrl);
    } finally {
      setUploading(false);
    }
  }

  function removeEditImage() {
    setEditImageUrl(null);
    setEditImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function savePost() {
    if (!editTitle.trim() || (!editContent.trim() && !editImageUrl)) return;

    setSaving(true);
    const res = await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim(), image_url: editImageUrl }),
    });
    const data = await res.json() as LoungePost;
    setSaving(false);

    if (res.ok) {
      setPost((current) => current ? { ...current, ...data, comments: current.comments } : data);
      setIsEditing(false);
    }
  }

  if (!isReady) return <main className="main lounge-detail-main" />;

  if (!post) {
    return (
      <main className="main lounge-detail-main">
        <div className="empty-lounge">
          <strong>글을 찾을 수 없습니다.</strong>
          <p>삭제된 글이거나 존재하지 않는 글입니다.</p>
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
            <span className="detail-counters">⊙ {post.views} ♡ {post.likes} 💬 {post.comments}</span>
          </div>
        </header>
        {isEditing ? (
          <div className="detail-edit-form">
            <label>
              <span>제목</span>
              <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
            </label>
            <label>
              <span>내용</span>
              <textarea value={editContent} onChange={(event) => setEditContent(event.target.value)} rows={8} />
            </label>
            <div className="image-upload-area">
              <span>사진</span>
              {editImagePreview ? (
                <div className="image-preview-wrap">
                  <img src={editImagePreview} alt="미리보기" className="image-preview" />
                  <button type="button" className="image-remove-btn" onClick={removeEditImage}>✕ 제거</button>
                </div>
              ) : (
                <button type="button" className="image-upload-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? "업로드 중..." : "📎 사진 첨부"}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden-file-input" onChange={onFileChange} />
            </div>
          </div>
        ) : (
          <div className="detail-body">
            {post.image_url && (
              <img src={post.image_url} alt="첨부 이미지" className="detail-image" />
            )}
            {post.content.split("\n").map((line, index) => (
              <p key={`${line}-${index}`}>{line || " "}</p>
            ))}
          </div>
        )}
        <div className="detail-like">
          {isEditing ? (
            <>
              <button type="button" onClick={() => setIsEditing(false)}>취소</button>
              <button type="button" onClick={savePost} disabled={saving}>
                {saving ? "저장 중..." : "저장"}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={likePost} disabled={liked} className={liked ? "liked-button" : ""}>
                {liked ? "♥" : "♡"} {post.likes}
              </button>
              <button type="button" onClick={() => setIsEditing(true)}>수정</button>
            </>
          )}
          <button className="danger-button" type="button" onClick={deletePost}>삭제</button>
        </div>
      </article>
      <CommentBox postId={id} />
    </main>
  );
}
