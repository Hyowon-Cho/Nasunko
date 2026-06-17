import type { Metadata } from "next";
import { randomInt } from "crypto";
import { TickerTape } from "@/components/TickerTape";
import { TradingViewChart } from "@/components/TradingViewChart";
import { TradingViewRelatedMarketCard } from "@/components/TradingViewRelatedMarketCard";
import { getMarketQuotes, getTickerQuotes } from "@/lib/markets";

export const metadata: Metadata = {
  title: "나선코 - 나스닥 실시간 시세",
  description: "나스닥 종합주가지수, 나스닥100, 미국 빅테크, 반도체, 경제지표, 환율, 금리, 실시간 뉴스를 한 화면에서 확인하세요."
};

export const dynamic = "force-dynamic";

const relatedMarkets = [
  { symbol: "FX_IDC:USDKRW", title: "USD / KRW", subtitle: "달러·원 환율" },
  { symbol: "TVC:GOLD", title: "GOLD", subtitle: "금" },
  { symbol: "TVC:SILVER", title: "SILVER", subtitle: "은" },
  { symbol: "TVC:USOIL", title: "WTI 유가", subtitle: "서부 텍사스 원유" }
];

export default async function NasdaqPage() {
  const [tickerQuotes, nasdaqStocks] = await Promise.all([
    getTickerQuotes(),
    getMarketQuotes("big-tech")
  ]);
  const randomStock = nasdaqStocks[randomInt(Math.max(nasdaqStocks.length, 1))] ?? nasdaqStocks[0];
  const chartSymbol = `NASDAQ:${randomStock?.symbol ?? "NVDA"}`;

  return (
    <main className="main">
      <TickerTape quotes={tickerQuotes} />
      <section className="hero">
        <h1 className="page-title">나스닥 실시간 시세</h1>
        <p className="page-subtitle">나스닥 대형 성장주의 차트, 등락, 거래량을 한 화면에서 빠르게 확인합니다.</p>
      </section>

      <div className="section">
        <TradingViewChart symbol={chartSymbol} />
      </div>

      <section className="section">
        <div className="section-head section-title-row">
          <h2>연관 시장</h2>
          <span className="badge">TradingView</span>
        </div>
        <div className="related-tv-grid">
          {relatedMarkets.map((market) => (
            <TradingViewRelatedMarketCard key={market.symbol} symbol={market.symbol} title={market.title} subtitle={market.subtitle} />
          ))}
        </div>
      </section>
    </main>
  );
}
