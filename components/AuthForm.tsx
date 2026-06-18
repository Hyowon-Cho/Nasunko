"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nickname }),
      });
      const data = await res.json() as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "요청에 실패했습니다.");
        return;
      }

      router.push("/lounge");
      router.refresh();
    } catch {
      setError("요청에 실패했습니다. 잠시 후 다시 시도하세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="main auth-main">
      <section className="auth-card">
        <div className="auth-head">
          <p>나선코 계정</p>
          <h1>{isSignup ? "회원가입" : "로그인"}</h1>
          <span>{isSignup ? "라운지에 글을 작성하려면 계정이 필요합니다." : "내 글을 작성하고 관리하려면 로그인하세요."}</span>
        </div>
        <form className="auth-form" onSubmit={onSubmit}>
          {isSignup ? (
            <label>
              <span>닉네임</span>
              <input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="라운지에서 보일 이름" />
            </label>
          ) : null}
          <label>
            <span>이메일</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@example.com" type="email" />
          </label>
          <label>
            <span>비밀번호</span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8자 이상" type="password" />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? "처리 중..." : isSignup ? "회원가입" : "로그인"}
          </button>
        </form>
        <p className="auth-switch">
          {isSignup ? "이미 계정이 있나요?" : "아직 계정이 없나요?"}
          <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "로그인" : "회원가입"}</Link>
        </p>
      </section>
    </main>
  );
}
