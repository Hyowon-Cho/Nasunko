"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function LoungeEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json() as { url?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "이미지 업로드에 실패했습니다.");
        setImagePreview(null);
      } else {
        setImageUrl(data.url ?? null);
      }
    } catch {
      setError("이미지 업로드에 실패했습니다.");
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    setImageUrl(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), author: author.trim(), content: content.trim(), image_url: imageUrl })
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
      <div className="image-upload-area">
        <span>사진</span>
        {imagePreview ? (
          <div className="image-preview-wrap">
            <img src={imagePreview} alt="미리보기" className="image-preview" />
            <button type="button" className="image-remove-btn" onClick={removeImage}>✕ 제거</button>
          </div>
        ) : (
          <button type="button" className="image-upload-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "업로드 중..." : "📎 사진 첨부"}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden-file-input" onChange={onFileChange} />
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="editor-actions">
        <button className="button" type="button" onClick={() => router.push("/lounge")}>취소</button>
        <button className="button write-button" type="submit" disabled={loading || uploading}>
          {loading ? "등록 중..." : "등록"}
        </button>
      </div>
    </form>
  );
}
