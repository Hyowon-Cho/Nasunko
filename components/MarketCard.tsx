import { directionOf, formatNumber, MarketQuote } from "@/lib/markets";
import { Sparkline } from "./Sparkline";

type MarketCardProps = {
  quote: MarketQuote;
};

export function MarketCard({ quote }: MarketCardProps) {
  const direction = directionOf(quote.change);

  return (
    <article className="card market-card">
      <div className="market-card-label">
        <div className="market-card-top">
          <span className="eyebrow">{quote.symbol}</span>
          {quote.source === "fallback" && <span className="mini-source">API 필요</span>}
        </div>
        <h3>{quote.name}</h3>
      </div>
      <Sparkline values={quote.sparkline} change={quote.change} />
      <div className="market-card-value">
        <strong>{formatNumber(quote.price, quote.price > 1000 ? 2 : 2)}</strong>
        <p className={direction}>{quote.change > 0 ? "+" : ""}{formatNumber(quote.change, 2)} ({quote.changePercent > 0 ? "+" : ""}{formatNumber(quote.changePercent, 2)}%)</p>
      </div>
    </article>
  );
}
