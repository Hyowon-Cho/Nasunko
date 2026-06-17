import { directionOf, formatNumber, MarketQuote } from "@/lib/markets";

type MoverGridProps = {
  title: string;
  quotes: MarketQuote[];
};

export function MoverGrid({ title, quotes }: MoverGridProps) {
  const sorted = [...quotes].sort((a, b) => b.changePercent - a.changePercent).slice(0, 6);

  return (
    <section className="card card-inner">
      <div className="section-head">
        <h2>{title}</h2>
        <span className="badge">오늘</span>
      </div>
      <div className="mover-grid">
        {sorted.map((quote, index) => {
          const direction = directionOf(quote.change);
          return (
            <div className="mover" key={quote.symbol}>
              <span>{index + 1}</span>
              <strong>{quote.symbol}</strong>
              <em className={direction}>{quote.changePercent > 0 ? "+" : ""}{formatNumber(quote.changePercent, 2)}%</em>
            </div>
          );
        })}
      </div>
    </section>
  );
}
