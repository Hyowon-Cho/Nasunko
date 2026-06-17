"use client";

import { useEffect, useRef } from "react";

type TradingViewRelatedMarketCardProps = {
  symbol: string;
  title: string;
  subtitle: string;
};

const symbolPath = (symbol: string) => symbol.replace(":", "-");

export function TradingViewRelatedMarketCard({ symbol, title, subtitle }: TradingViewRelatedMarketCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tradingViewUrl = `https://kr.tradingview.com/symbols/${symbolPath(symbol)}/`;

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width: "100%",
      height: "100%",
      locale: "kr",
      dateRange: "1D",
      colorTheme: "dark",
      isTransparent: false,
      autosize: true,
      largeChartUrl: tradingViewUrl
    });

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(script);
  }, [symbol, tradingViewUrl]);

  return (
    <article className="card related-tv-card">
      <div className="related-tv-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <a href={tradingViewUrl} target="_blank" rel="noreferrer" aria-label={`${title} TradingView 열기`}>TV</a>
      </div>
      <div ref={containerRef} className="tradingview-widget-container__widget" />
    </article>
  );
}
