"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MarketGroupSummary, MarketMove, MetricSummary } from "@/lib/analytics";

type AnalyticsDashboardProps = {
  summary: MetricSummary;
};

type Period = "today" | "7d" | "30d";
type Segment = "m7" | "semiconductor" | "watched";

type MetricCardProps = {
  label: string;
  value: string;
  note?: string;
  tone?: "default" | "up" | "down" | "flat";
};

const periodOptions: Array<{ value: Period; label: string; days: number }> = [
  { value: "today", label: "오늘", days: 1 },
  { value: "7d", label: "7일", days: 7 },
  { value: "30d", label: "30일", days: 30 },
];

const segmentOptions: Array<{ value: Segment; label: string }> = [
  { value: "m7", label: "M7" },
  { value: "semiconductor", label: "반도체" },
  { value: "watched", label: "전체 관심종목" },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function formatPercent(value: number | null, signed = false) {
  if (value === null) return "자료 없음";
  const prefix = signed && value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

function formatDuration(ms: number | null) {
  if (ms === null) return "자료 없음";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatDate(value: string | null) {
  if (!value) return "자료 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function marketTone(value: number | null): MetricCardProps["tone"] {
  if (value === null) return "default";
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

function riskTone(value: number): MetricCardProps["tone"] {
  if (value >= 65) return "down";
  if (value >= 35) return "default";
  return "flat";
}

function MetricCard({ label, value, note, tone = "default" }: MetricCardProps) {
  return (
    <article className={`analytics-metric-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </article>
  );
}

function MarketMoveList({ items, emptyText }: { items: MarketMove[]; emptyText: string }) {
  return (
    <div className="analytics-rank-list">
      {items.length === 0 ? <p className="muted">{emptyText}</p> : items.map((item, index) => (
        <div className="analytics-rank-row" key={`${item.symbol}-${index}`}>
          <span>{index + 1}</span>
          <strong>{item.symbol}</strong>
          <em className={item.changePercent >= 0 ? "rank-up" : "rank-down"}>{formatPercent(item.changePercent, true)}</em>
        </div>
      ))}
    </div>
  );
}

function sumCounts(data: Array<{ count: number }>) {
  return data.reduce((sum, item) => sum + item.count, 0);
}

function getPreviousPeriodDelta(daily: MetricSummary["news"]["daily"], days: number) {
  if (days === 1) {
    const today = daily.at(-1)?.count ?? 0;
    const yesterday = daily.at(-2)?.count ?? 0;
    return today - yesterday;
  }

  const current = sumCounts(daily.slice(-days));
  const previous = sumCounts(daily.slice(-(days * 2), -days));
  return current - previous;
}

function selectedMarket(summary: MetricSummary, segment: Segment): MarketGroupSummary {
  if (segment === "m7") return summary.market.m7;
  if (segment === "semiconductor") return summary.market.semiconductor;
  return summary.market.watched;
}

export function AnalyticsDashboard({ summary }: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState<Period>("7d");
  const [segment, setSegment] = useState<Segment>("watched");
  const periodDays = periodOptions.find((item) => item.value === period)?.days ?? 7;
  const periodLabel = periodOptions.find((item) => item.value === period)?.label ?? "7일";
  const segmentLabel = segmentOptions.find((item) => item.value === segment)?.label ?? "전체 관심종목";
  const market = selectedMarket(summary, segment);
  const periodNews = useMemo(() => summary.news.daily.slice(-periodDays), [periodDays, summary.news.daily]);
  const periodNewsTotal = sumCounts(periodNews);
  const previousDelta = getPreviousPeriodDelta(summary.news.daily, periodDays);
  const periodAverage = periodNews.length === 0 ? 0 : periodNewsTotal / periodNews.length;
  const syncStatus = summary.news.latestSyncStatus ?? "unknown";
  const categoryTotal = sumCounts(summary.newsCategories30Days);
  const comparisonData = periodNews.map((item, index, array) => ({
    ...item,
    market: index === array.length - 1 ? Number((market.avgChangePercent ?? 0).toFixed(2)) : null,
  }));

  return (
    <main className="main analytics-main">
      <section className="hero analytics-hero">
        <p className="page-kicker">시장 요약</p>
        <h1 className="page-title">오늘 시장은 어떤가요?</h1>
        <p className="page-subtitle">수집된 뉴스와 관심 종목의 현재 움직임을 함께 봅니다.</p>
      </section>

      <section className="section analytics-control-bar">
        <div>
          <span>기간</span>
          <div className="analytics-segments" role="tablist" aria-label="기간 필터">
            {periodOptions.map((item) => (
              <button className={period === item.value ? "active" : ""} key={item.value} onClick={() => setPeriod(item.value)} type="button">
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span>시장 그룹</span>
          <div className="analytics-segments" role="tablist" aria-label="시장 그룹 필터">
            {segmentOptions.map((item) => (
              <button className={segment === item.value ? "active" : ""} key={item.value} onClick={() => setSegment(item.value)} type="button">
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section analytics-section">
        <div className="section-head section-title-row">
          <h2>핵심 요약</h2>
          <span className="section-count">{periodLabel} 기준</span>
        </div>
        <div className="analytics-metric-grid four">
          <MetricCard label={`${periodLabel} 뉴스`} value={formatNumber(periodNewsTotal)} note={`일평균 ${formatNumber(periodAverage)}건`} />
          <MetricCard label="전 기간 대비" value={`${previousDelta >= 0 ? "+" : ""}${formatNumber(previousDelta)}건`} note={period === "today" ? "어제 대비" : `이전 ${periodLabel} 대비`} tone={previousDelta > 0 ? "up" : previousDelta < 0 ? "down" : "flat"} />
          <MetricCard label={`${segmentLabel} 평균`} value={formatPercent(market.avgChangePercent, true)} note={`${market.upCount} 상승 · ${market.downCount} 하락`} tone={marketTone(market.avgChangePercent)} />
          <MetricCard label="시장 리스크 점수" value={`${summary.market.marketRiskScore}/100`} note={`${summary.market.riskLevel} · 하락비율 ${formatPercent(summary.market.riskOffScore)}`} tone={riskTone(summary.market.marketRiskScore)} />
        </div>
      </section>

      <section className="section analytics-insight-card">
        <div>
          <span className="page-kicker">한줄 요약</span>
          <h2>{summary.market.insight}</h2>
        </div>
        <ul>
          {summary.market.riskReasons.map((reason) => <li key={reason}>{reason}</li>)}
        </ul>
      </section>

      <section className="section analytics-split">
        <article className="card card-inner analytics-panel chart-panel">
          <div className="section-head section-title-row">
            <h2>날짜별 뉴스량</h2>
            <span className="badge">{periodLabel}</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={periodNews} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="newsVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2e7bff" stopOpacity={0.48} />
                  <stop offset="95%" stopColor="#2e7bff" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2a3040" strokeDasharray="4 4" />
              <XAxis dataKey="label" stroke="#8c93a3" tickLine={false} axisLine={false} />
              <YAxis stroke="#8c93a3" tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#151821", border: "1px solid #2a3040", borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" name="뉴스 수" stroke="#2e7bff" fill="url(#newsVolume)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </article>

        <article className="card card-inner analytics-panel chart-panel">
          <div className="section-head section-title-row">
            <h2>카테고리별 뉴스 비중</h2>
            <span className="badge">30D</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={summary.newsCategories30Days.slice(0, 8)} layout="vertical" margin={{ left: 8, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="#2a3040" strokeDasharray="4 4" horizontal={false} />
              <XAxis type="number" stroke="#8c93a3" tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="category" stroke="#8c93a3" tickLine={false} axisLine={false} width={72} />
              <Tooltip contentStyle={{ background: "#151821", border: "1px solid #2a3040", borderRadius: 8 }} formatter={(value) => [`${value}건`, "뉴스"]} />
              <Bar dataKey="count" fill="#2e7bff" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="analytics-chart-note">총 {formatNumber(categoryTotal)}건 기준</p>
        </article>
      </section>

      <section className="section analytics-section">
        <div className="section-head section-title-row">
          <h2>뉴스량과 나스닥 등락률 비교</h2>
          <span className="badge">{segmentLabel}</span>
        </div>
        <div className="analytics-comparison-grid">
          <div className="analytics-comparison-chart">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={comparisonData} margin={{ left: -18, right: 8, top: 12, bottom: 0 }}>
                <CartesianGrid stroke="#2a3040" strokeDasharray="4 4" />
                <XAxis dataKey="label" stroke="#8c93a3" tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#8c93a3" tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#8c93a3" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip contentStyle={{ background: "#151821", border: "1px solid #2a3040", borderRadius: 8 }} />
                <Bar yAxisId="left" dataKey="count" name="뉴스 수" fill="#2e7bff" radius={[5, 5, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="market" name="현재 평균 등락률" stroke="#00c7b1" strokeWidth={3} dot={{ r: 5 }} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="analytics-risk-box">
            <MetricCard label="하락 종목 비율" value={formatPercent(summary.market.riskOffScore)} note={`관심 종목 ${summary.market.watched.count}개 중 ${summary.market.watched.downCount}개`} tone={riskTone(summary.market.riskOffScore)} />
            <MetricCard label="최근 동기화" value={syncStatus} note={`${formatDate(summary.news.latestSyncAt)} · ${formatDuration(summary.news.latestSyncDurationMs)}`} tone={syncStatus === "success" ? "flat" : "default"} />
          </div>
        </div>
      </section>

      <section className="section analytics-split three-panel">
        <article className="card card-inner analytics-panel">
          <div className="section-head section-title-row">
            <h2>많이 오른 종목</h2>
            <span className="section-count">상위 5개</span>
          </div>
          <MarketMoveList items={summary.market.topGainers} emptyText="시장 데이터를 불러오지 못했습니다." />
        </article>

        <article className="card card-inner analytics-panel risk-panel">
          <div className="section-head section-title-row">
            <h2>많이 내린 종목</h2>
            <span className="section-count">상위 5개</span>
          </div>
          <MarketMoveList items={summary.market.topLosers} emptyText="시장 데이터를 불러오지 못했습니다." />
        </article>

        <article className="card card-inner analytics-panel">
          <div className="section-head section-title-row">
            <h2>변동이 큰 종목</h2>
            <span className="section-count">절대 등락률</span>
          </div>
          <MarketMoveList items={summary.market.mostVolatile} emptyText="시장 데이터를 불러오지 못했습니다." />
        </article>
      </section>

    </main>
  );
}
