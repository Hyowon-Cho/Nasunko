import type { Metadata } from "next";
import Link from "next/link";
import { getIndicators } from "@/lib/indicators";
import { getStoredNews, newsCategories, type NewsCategory } from "@/lib/news";

export const metadata: Metadata = {
  title: "나선코 피드",
  description: "미국 경제지표, FOMC, 빅테크, 반도체, 환율, 금리 뉴스를 한 곳에서 확인하세요."
};

export const dynamic = "force-dynamic";

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const category = newsCategories.includes(params.category as NewsCategory) ? (params.category as NewsCategory) : "전체";
  const [indicators, news] = await Promise.all([
    getIndicators(),
    getStoredNews(category).catch(() => []),
  ]);

  return (
    <main className="main">
      <section className="hero">
        <h1 className="page-title">피드</h1>
        <p className="page-subtitle">경제지표, FOMC, 빅테크, 반도체, 환율, 금리 뉴스를 한 화면에서 추적합니다.</p>
      </section>

      <section className="section">
        <div className="section-head section-title-row">
          <h2>경제지표</h2>
          <span className="badge">FRED</span>
        </div>
        <div className="feed-indicator-grid">
          {indicators.slice(0, 6).map((indicator) => (
            <Link className="feed-indicator-card" href={`/indicators/${indicator.slug}`} key={indicator.slug}>
              <span>{indicator.name}</span>
              <strong>{indicator.latest}</strong>
              <small>이전 {indicator.previous} · {indicator.releaseDate}</small>
            </Link>
          ))}
        </div>
      </section>

      <nav className="filter-row section" aria-label="피드 카테고리">
        {newsCategories.map((item) => (
          <Link className={item === category ? "active" : ""} href={`/feed?category=${encodeURIComponent(item)}`} key={item}>{item}</Link>
        ))}
      </nav>

      <section className="section">
        <div className="section-head section-title-row">
          <h2>뉴스</h2>
          <span className="badge">최신 {news.length}개</span>
        </div>
        <div className="card timeline feed-news-scroll">
          {news.length === 0 ? (
            <div className="empty-lounge">
              <strong>표시할 최신 뉴스가 없습니다.</strong>
              <p>다음 자동 수집 후 새로운 기사가 표시됩니다.</p>
            </div>
          ) : news.map((item) => (
            <article className="timeline-item" key={item.id}>
              <time>{item.time}</time>
              <div>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <h2>{item.title}</h2>
                  </a>
                ) : (
                  <h2>{item.title}</h2>
                )}
                <div className="tag-row">
                  <span className="badge">{item.category}</span>
                  {item.tags.map((tag) => <span className="badge" key={tag}>{tag}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
