import type { Metadata } from "next";
import { MarketCard } from "@/components/MarketCard";
import { OrderBook } from "@/components/OrderBook";
import { TickerTape } from "@/components/TickerTape";
import { TradingViewChart } from "@/components/TradingViewChart";
import { formatNumber, nasdaqFuture, orderBook, relatedMarkets, tickerQuotes } from "@/lib/markets";

export const metadata: Metadata = {
  title: "나선코 - 나스닥100 야간선물 실시간 시세",
  description: "나스닥100 야간선물, 미국 빅테크, 반도체, 경제지표, 환율, 금리, 실시간 뉴스를 한 화면에서 확인하세요."
};

export default function FuturesPage() {
  const sign = nasdaqFuture.change > 0 ? "+" : "";

  return (
    <main className="main">
      <TickerTape quotes={tickerQuotes} />
      <section className="hero">
        <h1 className="page-title">나스닥100 야간선물</h1>
        <p className="page-subtitle">미국 나스닥100 선물의 실시간 흐름과 빅테크·반도체·환율·금리·뉴스를 한 화면에서 확인합니다.</p>
      </section>

      <section className="card quote-hero">
        <div className="quote-head">
          <div>
            <h2>{nasdaqFuture.name}</h2>
            <p className="quote-price">{formatNumber(nasdaqFuture.price, 2)} <span className="up">{sign}{formatNumber(nasdaqFuture.change, 2)} ({sign}{formatNumber(nasdaqFuture.changePercent, 2)}%)</span></p>
          </div>
          <div className="quote-badges">
            <span className="badge">정규장</span>
            <span className="badge live">야간장</span>
          </div>
        </div>
        <div className="quote-stats">
          <div><span>시가</span><strong>{formatNumber(nasdaqFuture.open ?? 0, 2)}</strong></div>
          <div><span>고가</span><strong className="up">{formatNumber(nasdaqFuture.high ?? 0, 2)}</strong></div>
          <div><span>저가</span><strong className="down">{formatNumber(nasdaqFuture.low ?? 0, 2)}</strong></div>
          <div><span>거래량</span><strong>{nasdaqFuture.volume}</strong></div>
        </div>
        <p className="quote-time">{nasdaqFuture.time}</p>
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

      <OrderBook levels={orderBook} />

      <section className="grid four section">
        {relatedMarkets.map((quote) => (
          <MarketCard key={quote.symbol} quote={quote} />
        ))}
      </section>
    </main>
  );
}
