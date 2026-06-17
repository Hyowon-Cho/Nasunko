export type Direction = "up" | "down" | "flat";

export type MarketQuote = {
  symbol: string;
  yahooSymbol?: string;
  fmpSymbol?: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: string;
  time?: string;
  status?: "regular" | "closed";
  source?: "live" | "fallback";
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
  { symbol: "NVDA", yahooSymbol: "NVDA", name: "NVDA", price: 144.12, change: 2.44, changePercent: 1.72, sparkline: [5, 6, 8, 8, 9, 11, 10, 12] },
  { symbol: "MSFT", yahooSymbol: "MSFT", name: "MSFT", price: 478.91, change: 3.81, changePercent: 0.8, sparkline: [4, 4, 5, 6, 6, 7, 8, 8] },
  { symbol: "AAPL", yahooSymbol: "AAPL", name: "AAPL", price: 198.43, change: -1.16, changePercent: -0.58, sparkline: [9, 8, 7, 7, 6, 6, 5, 5] },
  { symbol: "AMZN", yahooSymbol: "AMZN", name: "AMZN", price: 187.64, change: 1.88, changePercent: 1.01, sparkline: [5, 5, 6, 7, 8, 7, 9, 10] },
  { symbol: "META", yahooSymbol: "META", name: "META", price: 693.17, change: 7.72, changePercent: 1.13, sparkline: [6, 7, 8, 8, 9, 10, 11, 11] },
  { symbol: "GOOGL", yahooSymbol: "GOOGL", name: "GOOGL", price: 175.8, change: 0.34, changePercent: 0.19, sparkline: [6, 5, 6, 6, 7, 7, 7, 8] },
  { symbol: "TSLA", yahooSymbol: "TSLA", name: "TSLA", price: 184.93, change: -3.16, changePercent: -1.68, sparkline: [12, 11, 9, 8, 8, 7, 6, 5] },
  { symbol: "NFLX", yahooSymbol: "NFLX", name: "NFLX", price: 1224.51, change: 18.3, changePercent: 1.52, sparkline: [4, 6, 5, 7, 9, 9, 10, 12] },
  { symbol: "AMD", yahooSymbol: "AMD", name: "AMD", price: 126.55, change: 2.62, changePercent: 2.11, sparkline: [5, 6, 7, 7, 9, 10, 12, 13] },
  { symbol: "ADBE", yahooSymbol: "ADBE", name: "ADBE", price: 207.32, change: 0.0, changePercent: 0.0, sparkline: [5, 6, 5, 7, 8, 8, 9, 9] },
  { symbol: "INTC", yahooSymbol: "INTC", name: "INTC", price: 117.05, change: 0.0, changePercent: 0.0, sparkline: [4, 5, 5, 6, 6, 7, 6, 8] },
  { symbol: "SPY", yahooSymbol: "SPY", name: "SPY", price: 750.33, change: -4.5, changePercent: -0.6, sparkline: [9, 8, 7, 7, 6, 6, 5, 5] }
];

export const nasdaqComposite: MarketQuote = {
  symbol: "IXIC",
  yahooSymbol: "^IXIC",
  name: "나스닥 종합주가지수",
  price: 19617.88,
  change: 137.54,
  changePercent: 0.71,
  open: 19520.18,
  high: 19685.44,
  low: 19442.91,
  volume: "5.8B",
  time: "실시간 지연 시세",
  status: "regular",
  sparkline: [7, 8, 7, 10, 11, 12, 11, 14]
};

export const relatedMarkets: MarketQuote[] = [
  ...tickerQuotes.slice(0, 10)
];

export const bigTechQuotes: MarketQuote[] = [
  { symbol: "NVDA", yahooSymbol: "NVDA", name: "NVIDIA", price: 144.12, change: 2.44, changePercent: 1.72, volume: "221.4M", sparkline: [5, 6, 8, 8, 9, 11, 10, 12] },
  { symbol: "MSFT", yahooSymbol: "MSFT", name: "Microsoft", price: 478.91, change: 3.81, changePercent: 0.8, volume: "25.9M", sparkline: [4, 4, 5, 6, 6, 7, 8, 8] },
  { symbol: "AAPL", yahooSymbol: "AAPL", name: "Apple", price: 198.43, change: -1.16, changePercent: -0.58, volume: "54.8M", sparkline: [9, 8, 7, 7, 6, 6, 5, 5] },
  { symbol: "AMZN", yahooSymbol: "AMZN", name: "Amazon", price: 187.64, change: 1.88, changePercent: 1.01, volume: "38.1M", sparkline: [5, 5, 6, 7, 8, 7, 9, 10] },
  { symbol: "META", yahooSymbol: "META", name: "Meta", price: 693.17, change: 7.72, changePercent: 1.13, volume: "12.4M", sparkline: [6, 7, 8, 8, 9, 10, 11, 11] },
  { symbol: "GOOGL", yahooSymbol: "GOOGL", name: "Alphabet", price: 175.8, change: 0.34, changePercent: 0.19, volume: "26.2M", sparkline: [6, 5, 6, 6, 7, 7, 7, 8] },
  { symbol: "TSLA", yahooSymbol: "TSLA", name: "Tesla", price: 184.93, change: -3.16, changePercent: -1.68, volume: "92.7M", sparkline: [12, 11, 9, 8, 8, 7, 6, 5] },
  { symbol: "NFLX", yahooSymbol: "NFLX", name: "Netflix", price: 1224.51, change: 18.3, changePercent: 1.52, volume: "4.1M", sparkline: [4, 6, 5, 7, 9, 9, 10, 12] },
  { symbol: "AMD", yahooSymbol: "AMD", name: "AMD", price: 126.55, change: 2.62, changePercent: 2.11, volume: "67.2M", sparkline: [5, 6, 7, 7, 9, 10, 12, 13] },
  { symbol: "ADBE", yahooSymbol: "ADBE", name: "Adobe", price: 207.32, change: 0.0, changePercent: 0.0, volume: "0", sparkline: [5, 6, 5, 7, 8, 8, 9, 9] }
];

export const semiconductorQuotes: MarketQuote[] = [
  { symbol: "SOXX", yahooSymbol: "SOXX", name: "iShares Semiconductor ETF", price: 246.18, change: 3.21, changePercent: 1.32, volume: "3.8M", sparkline: [4, 5, 6, 8, 7, 10, 11, 12] },
  { symbol: "SMH", yahooSymbol: "SMH", name: "VanEck Semiconductor ETF", price: 274.92, change: 3.8, changePercent: 1.4, volume: "8.2M", sparkline: [5, 6, 6, 8, 9, 9, 11, 12] },
  { symbol: "SOXL", yahooSymbol: "SOXL", name: "Direxion Daily Semiconductor Bull 3X", price: 23.87, change: 1.01, changePercent: 4.42, volume: "74.3M", sparkline: [3, 4, 6, 7, 9, 12, 11, 14] },
  { symbol: "SOXS", yahooSymbol: "SOXS", name: "Direxion Daily Semiconductor Bear 3X", price: 16.12, change: -0.73, changePercent: -4.33, volume: "41.7M", sparkline: [14, 12, 11, 9, 8, 6, 5, 4] },
  ...bigTechQuotes.filter((quote) => ["NVDA", "AMD", "AVGO"].includes(quote.symbol)),
  { symbol: "TSM", yahooSymbol: "TSM", name: "TSMC", price: 176.42, change: 2.12, changePercent: 1.22, volume: "12.9M", sparkline: [5, 5, 6, 7, 8, 9, 9, 10] },
  { symbol: "MU", yahooSymbol: "MU", name: "Micron", price: 126.88, change: -0.91, changePercent: -0.71, volume: "19.4M", sparkline: [8, 7, 7, 6, 6, 5, 6, 5] },
  { symbol: "ASML", yahooSymbol: "ASML", name: "ASML", price: 712.74, change: 8.44, changePercent: 1.2, volume: "1.8M", sparkline: [4, 5, 5, 7, 7, 9, 9, 10] },
  { symbol: "INTC", yahooSymbol: "INTC", name: "Intel", price: 21.32, change: -0.28, changePercent: -1.3, volume: "62.9M", sparkline: [9, 8, 8, 7, 6, 6, 5, 4] },
  { symbol: "QCOM", yahooSymbol: "QCOM", name: "Qualcomm", price: 156.63, change: 1.27, changePercent: 0.82, volume: "8.8M", sparkline: [5, 5, 6, 6, 7, 8, 8, 9] },
  { symbol: "TXN", yahooSymbol: "TXN", name: "Texas Instruments", price: 183.35, change: 0.74, changePercent: 0.41, volume: "4.5M", sparkline: [5, 6, 5, 6, 6, 7, 7, 8] }
];

type YahooQuote = {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
  regularMarketTime?: number;
};

type FmpQuote = {
  symbol: string;
  name?: string;
  price?: number;
  change?: number;
  changePercentage?: number;
  changesPercentage?: number;
  open?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  timestamp?: number;
};

const compactNumber = (value?: number) => {
  if (typeof value !== "number") {
    return undefined;
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
};

const quoteTime = (timestamp?: number) => {
  if (!timestamp) {
    return "실시간 지연 시세";
  }

  return `${new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Seoul"
  }).format(new Date(timestamp * 1000))} 기준`;
};

async function fetchYahooQuotes(fallbackQuotes: MarketQuote[]) {
  const symbols = fallbackQuotes.map((quote) => quote.yahooSymbol ?? quote.symbol);
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}`;

  try {
    const response = await fetch(url, { next: { revalidate: 30 } });

    if (!response.ok) {
      return fallbackQuotes.map((quote) => ({ ...quote, source: "fallback" as const }));
    }

    const data = await response.json() as { quoteResponse?: { result?: YahooQuote[] } };
    const results = new Map((data.quoteResponse?.result ?? []).map((quote) => [quote.symbol, quote]));

    return fallbackQuotes.map((fallback) => {
      const yahooSymbol = fallback.yahooSymbol ?? fallback.symbol;
      const live = results.get(yahooSymbol);

      if (!live || typeof live.regularMarketPrice !== "number") {
        return { ...fallback, source: "fallback" as const };
      }

      return {
        ...fallback,
        price: live.regularMarketPrice,
        change: live.regularMarketChange ?? fallback.change,
        changePercent: live.regularMarketChangePercent ?? fallback.changePercent,
        open: live.regularMarketOpen ?? fallback.open,
        high: live.regularMarketDayHigh ?? fallback.high,
        low: live.regularMarketDayLow ?? fallback.low,
        volume: compactNumber(live.regularMarketVolume) ?? fallback.volume,
        time: quoteTime(live.regularMarketTime),
        source: "live" as const
      };
    });
  } catch {
    return fallbackQuotes.map((quote) => ({ ...quote, source: "fallback" as const }));
  }
}

async function fetchFmpQuotes(fallbackQuotes: MarketQuote[]) {
  if (!process.env.FMP_API_KEY) {
    return null;
  }

  try {
    const entries = await Promise.all(fallbackQuotes.map(async (fallback) => {
      const symbol = fallback.fmpSymbol ?? fallback.yahooSymbol ?? fallback.symbol;
      const url = `https://financialmodelingprep.com/stable/quote?symbol=${encodeURIComponent(symbol)}&apikey=${process.env.FMP_API_KEY}`;
      const response = await fetch(url, { next: { revalidate: 30 } });

      if (!response.ok) {
        return [fallback.symbol, null] as const;
      }

      const data = await response.json() as FmpQuote[] | { Error?: string };
      const [quote] = Array.isArray(data) ? data : [];
      return [fallback.symbol, quote ?? null] as const;
    }));

    const results = new Map(entries);

    return fallbackQuotes.map((fallback) => {
      const live = results.get(fallback.symbol);

      if (!live || typeof live.price !== "number") {
        return { ...fallback, source: "fallback" as const };
      }

      return {
        ...fallback,
        price: live.price,
        change: live.change ?? fallback.change,
        changePercent: live.changePercentage ?? live.changesPercentage ?? fallback.changePercent,
        open: live.open ?? fallback.open,
        high: live.dayHigh ?? fallback.high,
        low: live.dayLow ?? fallback.low,
        volume: compactNumber(live.volume) ?? fallback.volume,
        time: quoteTime(live.timestamp ?? Math.floor(Date.now() / 1000)),
        source: "live" as const
      };
    });
  } catch {
    return null;
  }
}

async function getLiveQuotes(fallbackQuotes: MarketQuote[]) {
  const fmpQuotes = await fetchFmpQuotes(fallbackQuotes);

  if (fmpQuotes?.some((quote) => quote.source === "live")) {
    return fmpQuotes;
  }

  return fetchYahooQuotes(fallbackQuotes);
}

export async function getTickerQuotes() {
  return getLiveQuotes(tickerQuotes);
}

export async function getNasdaqComposite() {
  const [quote] = await getLiveQuotes([nasdaqComposite]);
  return quote;
}

export async function getRelatedMarkets() {
  return getLiveQuotes(relatedMarkets);
}

export async function getMarketQuotes(kind: "big-tech" | "semiconductor") {
  return getLiveQuotes(kind === "big-tech" ? bigTechQuotes : semiconductorQuotes);
}
