import type { Metadata } from "next";
import { MarketRanking } from "@/components/MarketRanking";
import { QuoteTable } from "@/components/QuoteTable";
import { getMarketQuotes } from "@/lib/markets";

export const metadata: Metadata = {
  title: "나선코 - 마켓맵",
  description: "나스닥 주요 종목의 상승률, 하락률 TOP 5와 시장 흐름을 확인하세요."
};

export const dynamic = "force-dynamic";

export default async function MarketMapPage() {
  const [bigTech, semiconductor] = await Promise.all([
    getMarketQuotes("big-tech"),
    getMarketQuotes("semiconductor"),
  ]);
  const deduped = new Map([...bigTech, ...semiconductor].map((quote) => [quote.symbol, quote]));
  const quotes = Array.from(deduped.values());

  return (
    <main className="main">
      <section className="hero">
        <h1 className="page-title">마켓맵</h1>
        <p className="page-subtitle">나스닥 주요 종목의 상승률·하락률 TOP 5와 관심 종목 흐름을 한 화면에서 확인합니다.</p>
      </section>

      <section className="grid two section">
        <MarketRanking title="상승률 TOP 5" quotes={quotes} direction="up" />
        <MarketRanking title="하락률 TOP 5" quotes={quotes} direction="down" />
      </section>

      <section className="section">
        <div className="section-head section-title-row">
          <h2>전체 종목</h2>
          <span className="badge">나스닥</span>
        </div>
        <QuoteTable quotes={quotes} />
      </section>
    </main>
  );
}
