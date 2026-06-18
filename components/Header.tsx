"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/nasdaq", label: "나스닥" },
  { href: "/big-tech", label: "미국 빅테크" },
  { href: "/feed", label: "피드" },
  { href: "/lounge", label: "라운지" }
];

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ nickname: string } | null>(null);
  const activePath = pathname?.startsWith("/indicators") || pathname?.startsWith("/news") ? "/feed" : pathname;

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.ok ? res.json() as Promise<{ user: { nickname: string } | null }> : { user: null })
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/lounge";
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link className="brand" href="/nasdaq" aria-label="나선코 홈">
          <span className="brand-ko">나선코</span><span className="brand-hi"></span>
          <span className="brand-tag">싱글벙글 나스닥</span>
        </Link>
        <nav className="nav" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={activePath?.startsWith(item.href) ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-right">
          {user ? (
            <div className="auth-header">
              <span>{user.nickname}</span>
              <button type="button" onClick={logout}>로그아웃</button>
            </div>
          ) : (
            <div className="auth-header">
              <Link href="/login">로그인</Link>
              <Link className="auth-header-primary" href="/signup">회원가입</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
