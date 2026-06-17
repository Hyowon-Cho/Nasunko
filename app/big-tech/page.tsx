import type { Metadata } from "next";
import { MoverGrid } from "@/components/MoverGrid";
import { QuoteTable } from "@/components/QuoteTable";
import { getMarketQuotes } from "@/lib/markets";
import { mockNews } from "@/lib/news";

export const metadata: Metadata = {
  title: "나선코 - 미국 빅테크 실시간 시세",
  description: "NVDA, MSFT, AAPL, AMZN, META, GOOGL, TSLA 등 미국 빅테크와 나스닥100 선물 흐름을 확인하세요."
};

export default async function BigTechPage() {
  const quotes = await getMarketQuotes("big-tech");
  const news = mockNews.filter((item) => item.category === "빅테크").slice(0, 3);

  return (
    <main className="main">
      <section className="hero">
        <h1 className="page-title">미국 빅테크</h1>
        <p className="page-subtitle">나스닥100 선물을 움직이는 대형 성장주 가격, 랭킹, 뉴스와 핵심 배경을 한 화면에서 봅니다.</p>
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
        title="왜 나스닥 선물과 빅테크가 같이 움직이나?"
        body="나스닥100은 시가총액 상위 기술주의 비중이 높습니다. 금리, 달러, AI 투자 사이클이 빅테크 실적 기대를 바꾸면 선물 가격에도 빠르게 반영됩니다."
      />
    </main>
  );
}

function InfoAndFaq({ title, body }: { title: string; body: string }) {
  return (
    <section className="grid two section">
      <article className="card card-inner info-card"><h2>{title}</h2><p>{body}</p></article>
      <article className="card card-inner faq"><h2>FAQ</h2><details open><summary>프리마켓 가격과 선물은 같은가요?</summary><p>아닙니다. 개별 주식의 장전 거래와 지수 선물은 다른 시장이지만 위험선호 흐름을 함께 반영할 수 있습니다.</p></details><details><summary>등락률은 실시간인가요?</summary><p>현재는 mock 데이터이며 FINNHUB_API_KEY 연결 지점에서 실제 API로 교체할 수 있습니다.</p></details></article>
    </section>
  );
}
