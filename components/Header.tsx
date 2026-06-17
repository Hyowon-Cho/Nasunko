"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/nasdaq", label: "나스닥" },
  { href: "/big-tech", label: "미국 빅테크" },
  { href: "/semiconductor", label: "미국 반도체" },
  { href: "/indicators", label: "경제지표" },
  { href: "/news", label: "실시간 뉴스룸" },
  { href: "/lounge", label: "라운지" }
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="header-inner">
        <Link className="brand" href="/nasdaq" aria-label="나선코 홈">
          <span className="brand-ko">나선코</span><span className="brand-hi"></span>
          <span className="brand-tag">나스닥</span>
        </Link>
        <nav className="nav" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname?.startsWith(item.href) ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-right">
          <span className="live-pill">
            <span className="live-dot" />
            Live
          </span>
        </div>
      </div>
    </header>
  );
}
