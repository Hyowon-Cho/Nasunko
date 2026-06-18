import { directionOf, formatNumber, type MarketQuote } from "@/lib/markets";

type MarketRankingProps = {
  title: string;
  quotes: MarketQuote[];
  direction: "up" | "down";
  emptyText?: string;
};

export function MarketRanking({ title, quotes, direction, emptyText = "표시할 데이터가 없습니다." }: MarketRankingProps) {
  const ranked = [...quotes]
    .filter((quote) => direction === "up" ? quote.changePercent > 0 : quote.changePercent < 0)
    .sort((a, b) => direction === "up" ? b.changePercent - a.changePercent : a.changePercent - b.changePercent)
    .slice(0, 5);

  return (
    <section className="card card-inner market-ranking">
      <div className="section-head">
        <h2>{title}</h2>
        <span className="badge">TOP 5</span>
      </div>
      <div className="ranking-list">
        {ranked.length === 0 ? (
          <div className="ranking-empty">{emptyText}</div>
        ) : null}
        {ranked.map((quote, index) => {
          const quoteDirection = directionOf(quote.change);
          return (
            <a
              className="ranking-row"
              href={`https://kr.tradingview.com/symbols/NASDAQ-${quote.symbol}/`}
              key={quote.symbol}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>{index + 1}</span>
              <div>
                <strong>{quote.symbol}</strong>
                <small>{quote.name}</small>
              </div>
              <em className={quoteDirection}>
                {quote.changePercent > 0 ? "+" : ""}{formatNumber(quote.changePercent, 2)}%
              </em>
            </a>
          );
        })}
      </div>
    </section>
  );
}
