import Link from "next/link";

const navItems = [
  { href: "/futures", label: "나스닥" },
  { href: "/big-tech", label: "미국 빅테크" },
  { href: "/semiconductor", label: "미국 반도체" },
  { href: "/indicators", label: "경제지표" },
  { href: "/news", label: "실시간 뉴스룸" },
  { href: "/lounge", label: "라운지" }
];

export function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link className="brand" href="/futures" aria-label="나선코 홈">
          <span className="brand-name">나선코</span>
          <span className="badge ad">광고</span>
        </Link>
        <nav className="nav" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-right">
          <span className="badge live">● Live</span>
          <span className="theme-dot" aria-hidden="true">☼</span>
        </div>
      </div>
    </header>
  );
}
