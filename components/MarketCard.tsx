import { directionOf, formatNumber, MarketQuote } from "@/lib/markets";
import { Sparkline } from "./Sparkline";

type MarketCardProps = {
  quote: MarketQuote;
};

export function MarketCard({ quote }: MarketCardProps) {
  const direction = directionOf(quote.change);

  return (
    <article className="card market-card">
      <div>
        <span className="eyebrow">{quote.symbol}</span>
        <h3>{quote.name}</h3>
      </div>
      <Sparkline values={quote.sparkline} change={quote.change} />
      <div>
        <strong>{formatNumber(quote.price, quote.price > 1000 ? 2 : 2)}</strong>
        <p className={direction}>{quote.change > 0 ? "+" : ""}{formatNumber(quote.change, 2)} ({quote.changePercent > 0 ? "+" : ""}{formatNumber(quote.changePercent, 2)}%)</p>
      </div>
    </article>
  );
}
