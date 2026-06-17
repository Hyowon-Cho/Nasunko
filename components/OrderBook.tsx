import { formatNumber, OrderBookLevel } from "@/lib/markets";

type OrderBookProps = {
  levels: OrderBookLevel[];
};

export function OrderBook({ levels }: OrderBookProps) {
  const bids = levels.filter((level) => level.side === "bid").sort((a, b) => a.price - b.price);
  const asks = levels.filter((level) => level.side === "ask").sort((a, b) => a.price - b.price);
  const bestBid = Math.max(...bids.map((level) => level.price));
  const bestAsk = Math.min(...asks.map((level) => level.price));
  const spread = bestAsk - bestBid;

  return (
    <section className="card orderbook">
      <div className="section-head">
        <h2>호가창</h2>
        <span className="muted">스프레드 {formatNumber(spread, 2)}</span>
      </div>
      <div className="order-grid">
        {bids.map((level, index) => (
          <div className="order-cell bid" key={`bid-${level.price}`}>
            <span>매수 {bids.length - index}</span>
            <strong>{formatNumber(level.price, 2)}</strong>
            <em>{level.size}</em>
          </div>
        ))}
        {asks.map((level, index) => (
          <div className="order-cell ask" key={`ask-${level.price}`}>
            <span>매도 {index + 1}</span>
            <strong>{formatNumber(level.price, 2)}</strong>
            <em>{level.size}</em>
          </div>
        ))}
      </div>
      <p className="order-time">오전 5:58:20 기준</p>
    </section>
  );
}
