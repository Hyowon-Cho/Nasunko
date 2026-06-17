import type { Metadata } from "next";
import { getNews, newsCategories, type NewsCategory } from "@/lib/news";

export const metadata: Metadata = {
  title: "나선코 - 실시간 뉴스룸",
  description: "미국 경제지표, FOMC, 빅테크, 반도체, 환율, 금리 뉴스를 한 곳에서 추적합니다."
};

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const category = newsCategories.includes(params.category as NewsCategory) ? (params.category as NewsCategory) : "전체";
  const news = await getNews(category);

  return (
    <main className="main">
      <section className="hero">
        <h1 className="page-title">실시간 뉴스룸</h1>
        <p className="page-subtitle">미국 경제지표, FOMC, 빅테크, 반도체, 환율, 금리 뉴스를 한 곳에서 추적합니다.</p>
      </section>
      <nav className="filter-row section" aria-label="뉴스 카테고리">
        {newsCategories.map((item) => (
          <a className={item === category ? "active" : ""} href={`/news?category=${encodeURIComponent(item)}`} key={item}>{item}</a>
        ))}
      </nav>
      <section className="card timeline section">
        {news.map((item) => (
          <article className="timeline-item" key={item.id}>
            <time>{item.time}</time>
            <div>
              <h2>{item.title}</h2>
              <div className="tag-row">
                <span className="badge">{item.category}</span>
                {item.tags.map((tag) => <span className="badge" key={tag}>{tag}</span>)}
              </div>
            </div>
            <div className="reaction-row">
              <span>좋아요 {item.likes}</span>
              <span>싫어요 {item.dislikes}</span>
              <span>댓글 {item.comments}</span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
