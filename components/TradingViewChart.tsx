"use client";

import { useEffect, useRef, useState } from "react";

type TradingViewChartProps = {
  symbol?: string;
};

export function TradingViewChart({ symbol = "NASDAQ:NVDA" }: TradingViewChartProps) {
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
      locale: "ko",
      allow_symbol_change: true,
      hide_symbol_search: false,
      hide_top_toolbar: false,
      save_image: false,
      show_symbol_logo: false,
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
        <h2>나스닥 대표주 차트</h2>
        <span className="badge">{symbol}</span>
      </div>
      <p className="chart-note">TradingView API로 원하는 주식 차트를 볼 수 있어요.</p>
      <div className="tradingview-shell">
        {!loaded && (
          <div className="chart-fallback">
            <strong>차트 불러오는 중…</strong>
            <span>TradingView가 차단되거나 심볼 제공이 제한되어도 이 영역의 높이는 유지됩니다.</span>
          </div>
        )}
        <div ref={containerRef} className="tradingview-widget-container__widget" />
      </div>
    </section>
  );
}
