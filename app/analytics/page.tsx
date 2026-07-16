import type { Metadata } from "next";
import { getAnalyticsSummary, type MarketMove } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "나선코 분석",
  description: "뉴스 자동화와 나스닥 주요 종목 데이터를 집계한 나선코 BI 분석 대시보드입니다.",
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

function marketTone(value: number | null): MetricCardProps["tone"] {
  if (value === null) return "default";
  if (value > 0) return "up";
  if (value < 0) return "down";
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

export default async function AnalyticsPage() {
  const summary = await getAnalyticsSummary();
  const syncStatus = summary.news.latestSyncStatus ?? "unknown";
  const riskTone = summary.market.riskOffScore >= 50 ? "down" : summary.market.riskOffScore >= 30 ? "default" : "flat";

  return (
    <main className="main analytics-main">
      <section className="hero analytics-hero">
        <p className="lounge-kicker">Nasunko Analytics</p>
        <h1 className="page-title">뉴스와 나스닥 시장 분석</h1>
        <p className="page-subtitle">자동 수집 뉴스와 나스닥 주요 종목 데이터를 KPI와 리스크 지표로 집계합니다.</p>
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
          <h2>나스닥 시장 KPI</h2>
          <span className="badge">FMP / fallback</span>
        </div>
        <div className="analytics-metric-grid four">
          <MetricCard label="M7 평균 등락률" value={formatPercent(summary.market.m7.avgChangePercent, true)} note={`${summary.market.m7.upCount} 상승 · ${summary.market.m7.downCount} 하락`} tone={marketTone(summary.market.m7.avgChangePercent)} />
          <MetricCard label="빅테크 평균" value={formatPercent(summary.market.bigTech.avgChangePercent, true)} note={`${summary.market.bigTech.liveCount}/${summary.market.bigTech.count} live`} tone={marketTone(summary.market.bigTech.avgChangePercent)} />
          <MetricCard label="반도체 평균" value={formatPercent(summary.market.semiconductor.avgChangePercent, true)} note={`${summary.market.semiconductor.upCount} 상승 · ${summary.market.semiconductor.downCount} 하락`} tone={marketTone(summary.market.semiconductor.avgChangePercent)} />
          <MetricCard label="하락 종목 비율" value={formatPercent(summary.market.riskOffScore)} note={`${summary.market.watched.downCount}/${summary.market.watched.count} watched`} tone={riskTone} />
        </div>
      </section>

      <section className="section analytics-split three-panel">
        <article className="card card-inner analytics-panel">
          <div className="section-head section-title-row">
            <h2>상승률 TOP 5</h2>
            <span className="badge">Watched</span>
          </div>
          <MarketMoveList items={summary.market.topGainers} emptyText="시장 데이터를 불러오지 못했습니다." />
        </article>

        <article className="card card-inner analytics-panel risk-panel">
          <div className="section-head section-title-row">
            <h2>하락률 TOP 5</h2>
            <span className="badge">Risk</span>
          </div>
          <MarketMoveList items={summary.market.topLosers} emptyText="시장 데이터를 불러오지 못했습니다." />
        </article>

        <article className="card card-inner analytics-panel">
          <div className="section-head section-title-row">
            <h2>변동성 TOP 5</h2>
            <span className="badge">Abs %</span>
          </div>
          <MarketMoveList items={summary.market.mostVolatile} emptyText="시장 데이터를 불러오지 못했습니다." />
        </article>
      </section>

      <section className="section analytics-section">
        <div className="section-head section-title-row">
          <h2>사용자 데이터 상태</h2>
          <span className="badge">Future Dataset</span>
        </div>
        <div className="analytics-metric-grid four secondary">
          <MetricCard label="라운지 글" value={formatNumber(summary.community.posts)} note="데이터 축적 후 의견 분석 예정" />
          <MetricCard label="댓글" value={formatNumber(summary.community.comments)} note="커뮤니티 반응 데이터" />
          <MetricCard label="매매기록" value={formatNumber(summary.trades.total)} note="수익/손절 결과 데이터" />
          <MetricCard label="회원" value={formatNumber(summary.community.users)} note="사용자 기반" />
        </div>
      </section>
    </main>
  );
}
