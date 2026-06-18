import { IndicatorChart } from "@/components/IndicatorChart";
import type { Indicator, IndicatorPoint } from "@/lib/indicators";

type IndicatorDetailPageProps = {
  indicator: Indicator;
  history: IndicatorPoint[];
};

const RELATION_TEXT: Record<string, string> = {
  cpi: "CPI 발표 직후에는 미 국채금리와 달러가 먼저 반응하고, 그 움직임이 나스닥 대형 성장주의 변동성으로 이어지는 경우가 많습니다.",
  ppi: "PPI가 높으면 금리 인하 기대가 약해지고, 낮으면 성장주 선호가 회복되는 식으로 나스닥에 영향을 줄 수 있습니다.",
  fomc: "FOMC에서 금리 경로가 높게 유지될수록 성장주 밸류에이션 부담이 커지고, 완화적 메시지는 나스닥 반등 재료가 될 수 있습니다.",
  payrolls: "고용이 너무 강하면 금리 인하 기대가 후퇴할 수 있고, 급격히 약하면 경기 둔화 우려가 커져 나스닥 변동성이 확대될 수 있습니다.",
  unemployment: "실업률은 경기 냉각 속도를 보여주기 때문에 금리 기대와 위험자산 선호를 동시에 움직입니다.",
  "retail-sales": "소매판매는 미국 소비 체력을 보여주며, 빅테크 광고·커머스·결제 관련 기대에도 영향을 줄 수 있습니다.",
};

export function IndicatorDetailPage({ indicator, history }: IndicatorDetailPageProps) {
  return (
    <main className="main">
      <section className="hero">
        <h1 className="page-title">{indicator.name}</h1>
        <p className="page-subtitle">{indicator.description}</p>
      </section>
      <section className="grid three section">
        <article className="card card-inner metric"><span>최신 발표</span><strong>{indicator.latest}</strong></article>
        <article className="card card-inner metric"><span>예상</span><strong>{indicator.forecast}</strong></article>
        <article className="card card-inner metric"><span>이전</span><strong>{indicator.previous}</strong></article>
      </section>
      <section className="card card-inner section">
        <div className="section-head">
          <h2>최근 추이</h2>
          <span className="badge">{indicator.source}</span>
        </div>
        {history.length > 0 ? <IndicatorChart data={history} /> : <p className="muted">표시할 차트 데이터가 없습니다.</p>}
      </section>
      <section className="grid two section">
        <article className="card card-inner info-card"><h2>설명</h2><p>{indicator.description}</p></article>
        <article className="card card-inner info-card"><h2>왜 중요한지</h2><p>시장 컨센서스와 실제 발표값의 차이가 금리, 달러, 주식 선물의 단기 방향을 크게 흔들 수 있습니다.</p></article>
        <article className="card card-inner info-card wide"><h2>나스닥과의 관계</h2><p>{RELATION_TEXT[indicator.slug] ?? "미국 경제지표는 금리 기대와 위험자산 선호를 통해 나스닥 흐름에 영향을 줍니다."}</p></article>
      </section>
    </main>
  );
}
