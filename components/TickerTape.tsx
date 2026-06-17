import { directionOf, formatNumber, MarketQuote } from "@/lib/markets";

type TickerTapeProps = {
  quotes: MarketQuote[];
};

export function TickerTape({ quotes }: TickerTapeProps) {
  return (
    <section className="ticker" aria-label="시장 티커">
      <div className="ticker-track">
        {[...quotes, ...quotes].map((quote, index) => {
          const direction = directionOf(quote.change);
          return (
            <div className="ticker-item" key={`${quote.symbol}-${index}`}>
              <strong>{quote.name}</strong>
              <span>{formatNumber(quote.price, quote.price > 1000 ? 2 : 2)}</span>
              <span className={direction}>{quote.change > 0 ? "+" : ""}{formatNumber(quote.change, 2)} ({quote.changePercent > 0 ? "+" : ""}{formatNumber(quote.changePercent, 2)}%)</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
