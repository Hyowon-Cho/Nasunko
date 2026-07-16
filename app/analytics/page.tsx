import type { Metadata } from "next";
import { getAnalyticsSummary } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "나선코 분석",
  description: "뉴스, 라운지, 매매기록 데이터를 집계한 나선코 BI 분석 대시보드입니다.",
};

export const dynamic = "force-dynamic";

type MetricCardProps = {
  label: string;
  value: string;
  note?: string;
  tone?: "default" | "up" | "down" | "flat";
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercent(value: number | null, signed = false) {
  if (value === null) return "N/A";
  const prefix = signed && value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

function formatMoney(value: number | null) {
  if (value === null) return "N/A";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatDuration(ms: number | null) {
  if (ms === null) return "N/A";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
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

export default async function AnalyticsPage() {
  const summary = await getAnalyticsSummary();
  const syncStatus = summary.news.latestSyncStatus ?? "unknown";

  return (
    <main className="main analytics-main">
      <section className="hero analytics-hero">
        <p className="lounge-kicker">Nasunko Analytics</p>
        <h1 className="page-title">데이터 분석 대시보드</h1>
        <p className="page-subtitle">뉴스 수집, 커뮤니티 활동, 매매기록 데이터를 KPI와 리스크 지표로 집계합니다.</p>
      </section>

      <section className="section analytics-section">
        <div className="section-head section-title-row">
          <h2>뉴스 ETL 상태</h2>
          <span className="badge">PostgreSQL</span>
        </div>
        <div className="analytics-metric-grid four">
          <MetricCard label="전체 뉴스" value={formatNumber(summary.news.total)} note="news_articles" />
          <MetricCard label="오늘 수집" value={formatNumber(summary.news.today)} note="fetched_at 기준" />
          <MetricCard label="최근 7일" value={formatNumber(summary.news.last7Days)} note="뉴스 파이프라인 유입량" />
          <MetricCard label="최근 동기화" value={syncStatus} note={`${formatDate(summary.news.latestSyncAt)} · ${formatDuration(summary.news.latestSyncDurationMs)}`} tone={syncStatus === "success" ? "flat" : "default"} />
        </div>
      </section>

      <section className="section analytics-split">
        <article className="card card-inner analytics-panel">
          <div className="section-head section-title-row">
            <h2>뉴스 카테고리 TOP 5</h2>
            <span className="badge">30D</span>
          </div>
          <div className="analytics-rank-list">
            {summary.newsCategories.length === 0 ? <p className="muted">집계할 뉴스 데이터가 없습니다.</p> : summary.newsCategories.map((item, index) => (
              <div className="analytics-rank-row" key={item.category}>
                <span>{index + 1}</span>
                <strong>{item.category}</strong>
                <em>{formatNumber(item.count)}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="card card-inner analytics-panel">
          <div className="section-head section-title-row">
            <h2>동기화 품질</h2>
            <span className="badge">Latest Run</span>
          </div>
          <div className="analytics-metric-grid two compact">
            <MetricCard label="신규 저장" value={formatNumber(summary.news.latestInserted)} note="inserted_count" />
            <MetricCard label="중복 제거" value={formatNumber(summary.news.latestDuplicates)} note="duplicate_count" />
          </div>
        </article>
      </section>

      <section className="section analytics-section">
        <div className="section-head section-title-row">
          <h2>커뮤니티 데이터</h2>
          <span className="badge">User Generated Data</span>
        </div>
        <div className="analytics-metric-grid four">
          <MetricCard label="라운지 글" value={formatNumber(summary.community.posts)} note="posts" />
          <MetricCard label="댓글" value={formatNumber(summary.community.comments)} note="lounge + trade comments" />
          <MetricCard label="활성 작성자" value={formatNumber(summary.community.activeAuthors)} note="라운지 작성 기준" />
          <MetricCard label="회원" value={formatNumber(summary.community.users)} note="users" />
        </div>
      </section>

      <section className="section analytics-section">
        <div className="section-head section-title-row">
          <h2>매매기록 분석</h2>
          <span className="badge">Trade Outcomes</span>
        </div>
        <div className="analytics-metric-grid four">
          <MetricCard label="전체 인증" value={formatNumber(summary.trades.total)} note="trade_posts" />
          <MetricCard label="수익 인증" value={formatNumber(summary.trades.profitCount)} note={formatPercent(summary.trades.avgProfit, true)} tone="up" />
          <MetricCard label="손절 인증" value={formatNumber(summary.trades.lossCount)} note={formatPercent(summary.trades.avgLoss, true)} tone="down" />
          <MetricCard label="실현손익 합계" value={formatMoney(summary.trades.totalRealizedPnl)} note="입력값 기준" />
        </div>
      </section>

      <section className="section analytics-split">
        <article className="card card-inner analytics-panel">
          <div className="section-head section-title-row">
            <h2>종목별 인증 TOP 5</h2>
            <span className="badge">SQL</span>
          </div>
          <div className="analytics-rank-list">
            {summary.topTradeSymbols.length === 0 ? <p className="muted">집계할 매매기록이 없습니다.</p> : summary.topTradeSymbols.map((item, index) => (
              <div className="analytics-rank-row" key={item.symbol}>
                <span>{index + 1}</span>
                <strong>{item.symbol}</strong>
                <em>{formatNumber(item.trades)}건 · {formatPercent(item.avgReturn, true)}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="card card-inner analytics-panel risk-panel">
          <div className="section-head section-title-row">
            <h2>리스크 요약</h2>
            <span className="badge">Loss Risk</span>
          </div>
          <div className="analytics-metric-grid two compact">
            <MetricCard label="손절 비율" value={formatPercent(summary.risk.lossRatio)} note="loss / total" tone="down" />
            <MetricCard label="평균 손실폭" value={formatPercent(summary.risk.avgLossMagnitude)} note="손절 인증 기준" tone="down" />
          </div>
          <div className="analytics-rank-list risk-list">
            {summary.lossSymbols.length === 0 ? <p className="muted">손절 데이터가 없습니다.</p> : summary.lossSymbols.map((item, index) => (
              <div className="analytics-rank-row" key={item.symbol}>
                <span>{index + 1}</span>
                <strong>{item.symbol}</strong>
                <em>{formatNumber(item.losses)}건 · {formatPercent(item.avgLoss, true)}</em>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
