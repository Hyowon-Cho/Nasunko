import type { Metadata } from "next";
import { MarketCard } from "@/components/MarketCard";
import { TickerTape } from "@/components/TickerTape";
import { TradingViewChart } from "@/components/TradingViewChart";
import { directionOf, formatNumber, getNasdaqComposite, getRelatedMarkets, getTickerQuotes } from "@/lib/markets";

export const metadata: Metadata = {
  title: "나선코 - 나스닥 실시간 시세",
  description: "나스닥 종합주가지수, 나스닥100, 미국 빅테크, 반도체, 경제지표, 환율, 금리, 실시간 뉴스를 한 화면에서 확인하세요."
};

export const dynamic = "force-dynamic";

export default async function FuturesPage() {
  const [tickerQuotes, nasdaqComposite, relatedMarkets] = await Promise.all([
    getTickerQuotes(),
    getNasdaqComposite(),
    getRelatedMarkets()
  ]);
  const sign = nasdaqComposite.change > 0 ? "+" : "";
  const direction = directionOf(nasdaqComposite.change);
  const isLive = nasdaqComposite.source === "live";

  return (
    <main className="main">
      <TickerTape quotes={tickerQuotes} />
      <section className="hero">
        <h1 className="page-title">나스닥 종합주가지수</h1>
        <p className="page-subtitle">미국 나스닥 시장의 실시간 흐름과 빅테크·반도체·환율·금리·뉴스를 한 화면에서 확인합니다.</p>
      </section>

      <section className="card quote-hero">
        <div className="quote-head">
          <div>
            <h2>{nasdaqComposite.name}</h2>
            <p className="quote-price">{formatNumber(nasdaqComposite.price, 2)} <span className={direction}>{sign}{formatNumber(nasdaqComposite.change, 2)} ({sign}{formatNumber(nasdaqComposite.changePercent, 2)}%)</span></p>
          </div>
          <div className="quote-badges">
            <span className={isLive ? "badge live" : "badge ad"}>{isLive ? "실제 데이터" : "API 연결 필요"}</span>
            <span className="badge">{isLive ? "시세 API" : "fallback 표시"}</span>
          </div>
        </div>
        <div className="quote-stats">
          <div><span>시가</span><strong>{formatNumber(nasdaqComposite.open ?? 0, 2)}</strong></div>
          <div><span>고가</span><strong className="up">{formatNumber(nasdaqComposite.high ?? 0, 2)}</strong></div>
          <div><span>저가</span><strong className="down">{formatNumber(nasdaqComposite.low ?? 0, 2)}</strong></div>
          <div><span>거래량</span><strong>{nasdaqComposite.volume}</strong></div>
        </div>
        <p className="quote-time">{isLive ? nasdaqComposite.time : "실제 API 응답 실패: 환경변수 기반 데이터 API 연결이 필요합니다."}</p>
      </section>

      <div className="grid two section">
        <TradingViewChart />
        <section className="card card-inner">
          <div className="section-head">
            <h2>연관 시장</h2>
            <span className="badge">글로벌</span>
          </div>
          <div className="side-market-list">
            {relatedMarkets.slice(0, 5).map((quote) => (
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
    </main>
  );
}
