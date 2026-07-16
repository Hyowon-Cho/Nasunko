import type { Metadata } from "next";
import { TickerTape } from "@/components/TickerTape";
import { TradingViewChart } from "@/components/TradingViewChart";
import { TradingViewRelatedMarketCard } from "@/components/TradingViewRelatedMarketCard";
import { getTickerQuotes } from "@/lib/markets";

export const metadata: Metadata = {
  title: "나선코 나스닥 실시간 시세",
  description: "나스닥 종합지수와 환율, 원자재 등 미국 증시 관련 시장을 확인하세요."
};

export const dynamic = "force-dynamic";

const relatedMarkets = [
  { symbol: "FX_IDC:USDKRW", title: "USD / KRW", subtitle: "달러·원 환율" },
  { symbol: "TVC:GOLD", title: "GOLD", subtitle: "금" },
  { symbol: "TVC:SILVER", title: "SILVER", subtitle: "은" },
  { symbol: "TVC:USOIL", title: "WTI 유가", subtitle: "서부 텍사스 원유" }
];

export default async function NasdaqPage() {
  const tickerQuotes = await getTickerQuotes();

  return (
    <main className="main">
      <TickerTape quotes={tickerQuotes} />
      <section className="hero">
        <h1 className="page-title">나스닥 실시간 시세</h1>
        <p className="page-subtitle">나스닥 종합지수와 장에 영향을 주는 주요 시장을 모았습니다.</p>
      </section>

      <div className="section">
        <TradingViewChart symbol="NASDAQ:IXIC" />
      </div>

      <section className="section">
        <div className="section-head section-title-row">
          <h2>연관 시장</h2>
          <span className="source-label">TradingView</span>
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
