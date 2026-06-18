import type { Metadata } from "next";
import { MarketRanking } from "@/components/MarketRanking";
import { getMarketQuotes, getPennyStockMovers } from "@/lib/markets";

export const metadata: Metadata = {
  title: "나선코 - 마켓맵",
  description: "나스닥 주요 종목의 상승률, 하락률 TOP 5와 시장 흐름을 확인하세요."
};

export const dynamic = "force-dynamic";

export default async function MarketMapPage() {
  const [bigTech, semiconductor, pennyStocks] = await Promise.all([
    getMarketQuotes("big-tech"),
    getMarketQuotes("semiconductor"),
    getPennyStockMovers(),
  ]);
  const deduped = new Map([...bigTech, ...semiconductor].map((quote) => [quote.symbol, quote]));
  const blueChipSymbols = new Set(["NVDA", "MSFT", "AAPL", "AMZN", "META", "GOOGL", "TSLA", "NFLX", "AMD", "ADBE", "AVGO", "ASML", "TSM", "QCOM", "TXN", "MU", "INTC"]);
  const blueChips = Array.from(deduped.values()).filter((quote) => blueChipSymbols.has(quote.symbol));

  return (
    <main className="main">
      <section className="hero">
        <h1 className="page-title">마켓맵</h1>
        <p className="page-subtitle">우량주와 나스닥 페니스탁의 상승률·하락률 TOP 5를 한 화면에서 확인합니다.</p>
      </section>

      <section className="grid two section">
        <MarketRanking title="우량주 상승률 TOP 5" quotes={blueChips} direction="up" />
        <MarketRanking title="우량주 하락률 TOP 5" quotes={blueChips} direction="down" />
      </section>

      <section className="grid two section">
        <MarketRanking
          title="개잡주 상승률 TOP 5"
          quotes={pennyStocks.gainers}
          direction="up"
          emptyText="NASDAQ 페니스탁 상승률 데이터를 불러오지 못했습니다."
        />
        <MarketRanking
          title="개잡주 하락률 TOP 5"
          quotes={pennyStocks.losers}
          direction="down"
          emptyText="NASDAQ 페니스탁 하락률 데이터를 불러오지 못했습니다."
        />
      </section>
    </main>
  );
}
