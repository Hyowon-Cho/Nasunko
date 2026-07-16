"use client";

import { useEffect, useRef, useState } from "react";

type TradingViewChartProps = {
  symbol?: string;
};

export function TradingViewChart({ symbol = "NASDAQ:IXIC" }: TradingViewChartProps) {
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
        <h2>나스닥 종합지수</h2>
      </div>
      <p className="chart-note">종목 검색과 시간 단위 변경은 차트 상단에서 할 수 있습니다.</p>
      <div className="tradingview-shell">
        {!loaded && (
          <div className="chart-fallback">
            <strong>차트 불러오는 중…</strong>
            <span>잠시만 기다려 주세요.</span>
          </div>
        )}
        <div ref={containerRef} className="tradingview-widget-container__widget" />
      </div>
    </section>
  );
}
