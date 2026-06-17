export type Direction = "up" | "down" | "flat";

export type MarketQuote = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: string;
  time?: string;
  status?: "regular" | "overnight" | "closed";
  sparkline: number[];
};

export type OrderBookLevel = {
  side: "bid" | "ask";
  price: number;
  size: number;
};

export const formatNumber = (value: number, digits = 2) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);

export const directionOf = (change: number): Direction =>
  change > 0 ? "up" : change < 0 ? "down" : "flat";

export const tickerQuotes: MarketQuote[] = [
  { symbol: "NQ1!", name: "Nasdaq 100 Futures", price: 22184.25, change: 146.5, changePercent: 0.66, sparkline: [7, 8, 7, 10, 11, 12, 11, 14] },
  { symbol: "ES1!", name: "S&P 500 Futures", price: 6028.5, change: 21.25, changePercent: 0.35, sparkline: [4, 5, 5, 6, 7, 6, 8, 9] },
  { symbol: "YM1!", name: "Dow Futures", price: 42912, change: 84, changePercent: 0.2, sparkline: [3, 3, 4, 5, 4, 6, 6, 7] },
  { symbol: "USDKRW", name: "USD/KRW", price: 1368.44, change: -4.12, changePercent: -0.3, sparkline: [9, 8, 8, 7, 6, 6, 5, 4] },
  { symbol: "DXY", name: "DXY", price: 98.17, change: -0.22, changePercent: -0.22, sparkline: [8, 8, 7, 7, 6, 5, 5, 4] },
  { symbol: "US10Y", name: "US 10Y", price: 4.33, change: 0.03, changePercent: 0.7, sparkline: [3, 4, 5, 4, 5, 6, 7, 7] },
  { symbol: "VIX", name: "VIX", price: 14.89, change: -0.56, changePercent: -3.62, sparkline: [12, 11, 10, 9, 8, 8, 7, 6] },
  { symbol: "WTI", name: "WTI", price: 75.22, change: 0.86, changePercent: 1.16, sparkline: [4, 4, 5, 6, 6, 7, 8, 8] },
  { symbol: "GOLD", name: "Gold", price: 3412.8, change: -12.4, changePercent: -0.36, sparkline: [10, 9, 9, 8, 7, 7, 6, 6] },
  { symbol: "BTC", name: "BTC", price: 104220, change: 1820, changePercent: 1.78, sparkline: [6, 7, 7, 9, 10, 9, 11, 13] },
  { symbol: "NVDA", name: "NVDA", price: 144.12, change: 2.44, changePercent: 1.72, sparkline: [5, 6, 8, 8, 9, 11, 10, 12] },
  { symbol: "TSLA", name: "TSLA", price: 184.93, change: -3.16, changePercent: -1.68, sparkline: [12, 11, 9, 8, 8, 7, 6, 5] }
];

export const nasdaqFuture: MarketQuote = {
  symbol: "NQ1!",
  name: "나스닥100 야간선물",
  price: 22184.25,
  change: 146.5,
  changePercent: 0.66,
  open: 22018.5,
  high: 22208.75,
  low: 21972.25,
  volume: "284,912",
  time: "오전 5:58:20 기준",
  status: "overnight",
  sparkline: [7, 8, 7, 10, 11, 12, 11, 14]
};

export const relatedMarkets: MarketQuote[] = [
  tickerQuotes[1],
  tickerQuotes[2],
  tickerQuotes[6],
  tickerQuotes[3],
  tickerQuotes[5],
  tickerQuotes[8],
  tickerQuotes[7],
  { symbol: "SOXX", name: "SOXX", price: 246.18, change: 3.21, changePercent: 1.32, sparkline: [4, 5, 6, 8, 7, 10, 11, 12] }
];

export const orderBook: OrderBookLevel[] = [
  { side: "bid", price: 22182.5, size: 18 },
  { side: "bid", price: 22181.75, size: 12 },
  { side: "bid", price: 22180.5, size: 24 },
  { side: "bid", price: 22179.75, size: 9 },
  { side: "bid", price: 22178.25, size: 31 },
  { side: "ask", price: 22184.25, size: 15 },
  { side: "ask", price: 22185.0, size: 11 },
  { side: "ask", price: 22186.25, size: 22 },
  { side: "ask", price: 22187.0, size: 17 },
  { side: "ask", price: 22188.5, size: 28 }
];

export const bigTechQuotes: MarketQuote[] = [
  { symbol: "NVDA", name: "NVIDIA", price: 144.12, change: 2.44, changePercent: 1.72, volume: "221.4M", sparkline: [5, 6, 8, 8, 9, 11, 10, 12] },
  { symbol: "MSFT", name: "Microsoft", price: 478.91, change: 3.81, changePercent: 0.8, volume: "25.9M", sparkline: [4, 4, 5, 6, 6, 7, 8, 8] },
  { symbol: "AAPL", name: "Apple", price: 198.43, change: -1.16, changePercent: -0.58, volume: "54.8M", sparkline: [9, 8, 7, 7, 6, 6, 5, 5] },
  { symbol: "AMZN", name: "Amazon", price: 187.64, change: 1.88, changePercent: 1.01, volume: "38.1M", sparkline: [5, 5, 6, 7, 8, 7, 9, 10] },
  { symbol: "META", name: "Meta", price: 693.17, change: 7.72, changePercent: 1.13, volume: "12.4M", sparkline: [6, 7, 8, 8, 9, 10, 11, 11] },
  { symbol: "GOOGL", name: "Alphabet", price: 175.8, change: 0.34, changePercent: 0.19, volume: "26.2M", sparkline: [6, 5, 6, 6, 7, 7, 7, 8] },
  { symbol: "TSLA", name: "Tesla", price: 184.93, change: -3.16, changePercent: -1.68, volume: "92.7M", sparkline: [12, 11, 9, 8, 8, 7, 6, 5] },
  { symbol: "NFLX", name: "Netflix", price: 1224.51, change: 18.3, changePercent: 1.52, volume: "4.1M", sparkline: [4, 6, 5, 7, 9, 9, 10, 12] },
  { symbol: "AMD", name: "AMD", price: 126.55, change: 2.62, changePercent: 2.11, volume: "67.2M", sparkline: [5, 6, 7, 7, 9, 10, 12, 13] },
  { symbol: "AVGO", name: "Broadcom", price: 1806.2, change: 26.1, changePercent: 1.47, volume: "5.7M", sparkline: [6, 6, 7, 8, 10, 9, 11, 12] }
];

export const semiconductorQuotes: MarketQuote[] = [
  { symbol: "SOXX", name: "iShares Semiconductor ETF", price: 246.18, change: 3.21, changePercent: 1.32, volume: "3.8M", sparkline: [4, 5, 6, 8, 7, 10, 11, 12] },
  { symbol: "SMH", name: "VanEck Semiconductor ETF", price: 274.92, change: 3.8, changePercent: 1.4, volume: "8.2M", sparkline: [5, 6, 6, 8, 9, 9, 11, 12] },
  { symbol: "SOXL", name: "Direxion Daily Semiconductor Bull 3X", price: 23.87, change: 1.01, changePercent: 4.42, volume: "74.3M", sparkline: [3, 4, 6, 7, 9, 12, 11, 14] },
  { symbol: "SOXS", name: "Direxion Daily Semiconductor Bear 3X", price: 16.12, change: -0.73, changePercent: -4.33, volume: "41.7M", sparkline: [14, 12, 11, 9, 8, 6, 5, 4] },
  ...bigTechQuotes.filter((quote) => ["NVDA", "AMD", "AVGO"].includes(quote.symbol)),
  { symbol: "TSM", name: "TSMC", price: 176.42, change: 2.12, changePercent: 1.22, volume: "12.9M", sparkline: [5, 5, 6, 7, 8, 9, 9, 10] },
  { symbol: "MU", name: "Micron", price: 126.88, change: -0.91, changePercent: -0.71, volume: "19.4M", sparkline: [8, 7, 7, 6, 6, 5, 6, 5] },
  { symbol: "ASML", name: "ASML", price: 712.74, change: 8.44, changePercent: 1.2, volume: "1.8M", sparkline: [4, 5, 5, 7, 7, 9, 9, 10] },
  { symbol: "INTC", name: "Intel", price: 21.32, change: -0.28, changePercent: -1.3, volume: "62.9M", sparkline: [9, 8, 8, 7, 6, 6, 5, 4] },
  { symbol: "QCOM", name: "Qualcomm", price: 156.63, change: 1.27, changePercent: 0.82, volume: "8.8M", sparkline: [5, 5, 6, 6, 7, 8, 8, 9] },
  { symbol: "TXN", name: "Texas Instruments", price: 183.35, change: 0.74, changePercent: 0.41, volume: "4.5M", sparkline: [5, 6, 5, 6, 6, 7, 7, 8] }
];

export async function getMarketQuotes(kind: "big-tech" | "semiconductor") {
  // FINNHUB_API_KEY can be wired here later. Mock data remains the resilient fallback.
  if (!process.env.FINNHUB_API_KEY) {
    return kind === "big-tech" ? bigTechQuotes : semiconductorQuotes;
  }

  try {
    return kind === "big-tech" ? bigTechQuotes : semiconductorQuotes;
  } catch {
    return kind === "big-tech" ? bigTechQuotes : semiconductorQuotes;
  }
}
