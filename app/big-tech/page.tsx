import type { Metadata } from "next";
import { MoverGrid } from "@/components/MoverGrid";
import { QuoteTable } from "@/components/QuoteTable";
import { getMarketQuotes } from "@/lib/markets";
import { mockNews } from "@/lib/news";

export const metadata: Metadata = {
  title: "나선코 - 미국 빅테크 실시간 시세",
  description: "NVDA, MSFT, AAPL, AMZN, META, GOOGL, TSLA 등 미국 빅테크와 나스닥 흐름을 확인하세요."
};

export const dynamic = "force-dynamic";

export default async function BigTechPage() {
  const quotes = await getMarketQuotes("big-tech");
  const news = mockNews.filter((item) => item.category === "빅테크").slice(0, 3);

  return (
    <main className="main">
      <section className="hero">
        <h1 className="page-title">미국 빅테크</h1>
        <p className="page-subtitle">나스닥 지수를 움직이는 대형 성장주 가격, 랭킹, 뉴스와 핵심 배경을 한 화면에서 봅니다.</p>
      </section>
      <section className="section">
        <QuoteTable quotes={quotes} />
      </section>
      <div className="grid two section">
        <MoverGrid title="오늘의 등락 랭킹" quotes={quotes} />
        <section className="card card-inner">
          <div className="section-head"><h2>빅테크 최신 뉴스</h2><span className="badge">mock</span></div>
          <div className="news-stack">
            {news.map((item) => <article key={item.id}><span>{item.time}</span><strong>{item.title}</strong></article>)}
          </div>
        </section>
      </div>
      <InfoAndFaq
        title="왜 나스닥과 빅테크가 같이 움직이나?"
        body="나스닥은 시가총액 상위 기술주의 비중이 높습니다. 금리, 달러, AI 투자 사이클이 빅테크 실적 기대를 바꾸면 지수 움직임에도 빠르게 반영됩니다."
      />
    </main>
  );
}

function InfoAndFaq({ title, body }: { title: string; body: string }) {
  return (
    <section className="grid two section">
      <article className="card card-inner info-card"><h2>{title}</h2><p>{body}</p></article>
      <article className="card card-inner faq"><h2>FAQ</h2><details open><summary>개별주와 나스닥 지수는 같은 방향으로 움직이나요?</summary><p>항상 같지는 않지만 대형 기술주의 비중이 커서 지수와 함께 움직이는 날이 많습니다.</p></details><details><summary>등락률은 실시간인가요?</summary><p>Yahoo Finance quote API를 먼저 사용하고, API 실패 시 fallback 데이터로 표시됩니다.</p></details></article>
    </section>
  );
}
