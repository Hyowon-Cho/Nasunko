"use client";

import { useEffect, useRef, useState } from "react";

type TradingViewChartProps = {
  symbol?: string;
};

export function TradingViewChart({ symbol = "CME_MINI:NQ1!" }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "15",
      timezone: "Asia/Seoul",
      theme: "dark",
      style: "1",
      locale: "kr",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com"
    });
    script.onload = () => setLoaded(true);
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(script);

    const timeout = window.setTimeout(() => setLoaded(true), 2200);
    return () => window.clearTimeout(timeout);
  }, [symbol]);

  return (
    <section className="card chart-card">
      <div className="section-head">
        <h2>나스닥100 야간선물 차트</h2>
        <span className="badge">CME_MINI:NQ1!</span>
      </div>
      <div className="tradingview-shell">
        {!loaded && (
          <div className="chart-fallback">
            <strong>차트 불러오는 중…</strong>
            <span>TradingView가 차단된 환경에서도 이 영역의 높이는 유지됩니다.</span>
          </div>
        )}
        <div ref={containerRef} className="tradingview-widget-container__widget" />
      </div>
    </section>
  );
}
