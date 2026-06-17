import type { Metadata } from "next";
import { MarketCard } from "@/components/MarketCard";
import { MoverGrid } from "@/components/MoverGrid";
import { QuoteTable } from "@/components/QuoteTable";
import { TickerTape } from "@/components/TickerTape";
import { TradingViewChart } from "@/components/TradingViewChart";
import { getMarketQuotes, getRelatedMarkets, getTickerQuotes } from "@/lib/markets";

export const metadata: Metadata = {
  title: "나선코 - 나스닥 실시간 시세",
  description: "나스닥 종합주가지수, 나스닥100, 미국 빅테크, 반도체, 경제지표, 환율, 금리, 실시간 뉴스를 한 화면에서 확인하세요."
};

export const dynamic = "force-dynamic";

export default async function NasdaqPage() {
  const [tickerQuotes, relatedMarkets, nasdaqStocks] = await Promise.all([
    getTickerQuotes(),
    getRelatedMarkets(),
    getMarketQuotes("big-tech")
  ]);
  const liveCount = nasdaqStocks.filter((quote) => quote.source === "live").length;

  return (
    <main className="main">
      <TickerTape quotes={tickerQuotes} />
      <section className="hero">
        <h1 className="page-title">나스닥 실시간 시세</h1>
        <p className="page-subtitle">나스닥 종합 실시간 시세를 한 화면에서 확인할 수 있어요.</p>
      </section>

      <div className="grid two section">
        <TradingViewChart />
        <section className="card card-inner">
          <div className="section-head">
            <h2>나스닥 대표주</h2>
            <span className={liveCount > 0 ? "badge live" : "badge ad"}>연결됨 {liveCount}/{nasdaqStocks.length}</span>
          </div>
          <div className="side-market-list">
            {nasdaqStocks.slice(0, 5).map((quote) => (
              <MarketCard key={quote.symbol} quote={quote} />
            ))}
          </div>
        </section>
      </div>

      <section className="grid four section">
        {relatedMarkets.map((quote) => (
          <MarketCard key={quote.symbol} quote={quote} />
        ))}
      </section>

      <section className="section">
        <QuoteTable quotes={nasdaqStocks} />
      </section>
    </main>
  );
}
