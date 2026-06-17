import { directionOf, formatNumber, MarketQuote } from "@/lib/markets";
import { Sparkline } from "./Sparkline";

type QuoteTableProps = {
  quotes: MarketQuote[];
};

export function QuoteTable({ quotes }: QuoteTableProps) {
  return (
    <div className="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>종목</th>
            <th>현재가</th>
            <th>등락</th>
            <th>등락률</th>
            <th>거래량</th>
            <th>흐름</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => {
            const direction = directionOf(quote.change);
            return (
              <tr key={quote.symbol}>
                <td>
                  <strong>{quote.symbol}</strong>
                  <span className="table-name">{quote.name}</span>
                  {quote.source === "fallback" && <span className="mini-source">API 필요</span>}
                </td>
                <td>{formatNumber(quote.price, quote.price > 1000 ? 2 : 2)}</td>
                <td className={direction}>{quote.change > 0 ? "+" : ""}{formatNumber(quote.change, 2)}</td>
                <td className={direction}>{quote.changePercent > 0 ? "+" : ""}{formatNumber(quote.changePercent, 2)}%</td>
                <td>{quote.volume ?? "-"}</td>
                <td><Sparkline values={quote.sparkline} change={quote.change} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
