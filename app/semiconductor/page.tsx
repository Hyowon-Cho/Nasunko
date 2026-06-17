import type { Metadata } from "next";
import { MoverGrid } from "@/components/MoverGrid";
import { QuoteTable } from "@/components/QuoteTable";
import { getMarketQuotes } from "@/lib/markets";
import { mockNews } from "@/lib/news";

export const metadata: Metadata = {
  title: "나선코 - 미국 반도체 실시간 시세",
  description: "SOXX, SMH, SOXL, SOXS, NVDA, AMD, AVGO 등 미국 반도체 관련 종목과 뉴스를 확인하세요."
};

export const dynamic = "force-dynamic";

export default async function SemiconductorPage() {
  const quotes = await getMarketQuotes("semiconductor");
  const news = mockNews.filter((item) => item.category === "반도체").slice(0, 3);

  return (
    <main className="main">
      <section className="hero">
        <h1 className="page-title">미국 반도체</h1>
        <p className="page-subtitle">SOXX, SMH와 주요 칩 종목의 흐름을 나스닥 지수와 함께 확인합니다.</p>
      </section>
      <section className="section"><QuoteTable quotes={quotes} /></section>
      <div className="grid two section">
        <MoverGrid title="오늘의 반도체 등락" quotes={quotes} />
        <section className="card card-inner">
          <div className="section-head"><h2>반도체 최신 뉴스</h2><span className="badge">mock</span></div>
          <div className="news-stack">
            {news.map((item) => <article key={item.id}><span>{item.time}</span><strong>{item.title}</strong></article>)}
          </div>
        </section>
      </div>
      <section className="grid two section">
        <article className="card card-inner info-card"><h2>미국 반도체 지수, 왜 한국 투자자가 볼까?</h2><p>한국 증시는 메모리, 파운드리, 장비 밸류체인의 비중이 큽니다. 미국 반도체 ETF와 대장주의 움직임은 국내 반도체 투자심리를 가늠하는 참고 지표가 됩니다.</p></article>
        <article className="card card-inner faq"><h2>FAQ</h2><details open><summary>SOXX와 SMH 차이는 무엇인가요?</summary><p>둘 다 반도체 ETF지만 구성 종목과 비중이 다릅니다. 특정 대장주 비중에 따라 일별 민감도가 달라질 수 있습니다.</p></details><details><summary>레버리지 ETF도 포함되나요?</summary><p>SOXL, SOXS를 포함했습니다. 변동성이 크기 때문에 정보 확인용으로만 보세요.</p></details></article>
      </section>
    </main>
  );
}
