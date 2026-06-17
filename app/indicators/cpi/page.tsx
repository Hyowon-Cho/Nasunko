import type { Metadata } from "next";
import { IndicatorChart } from "@/components/IndicatorChart";
import { getIndicator, getIndicatorHistory } from "@/lib/indicators";

export const metadata: Metadata = {
  title: "나선코 - 미국 CPI 상세",
  description: "미국 CPI 최신 발표값, 예상, 이전치와 나스닥의 관계를 확인하세요."
};

export default async function CpiPage() {
  const indicator = await getIndicator("cpi");
  const history = await getIndicatorHistory("cpi");

  return <IndicatorDetail indicator={indicator!} history={history} />;
}

function IndicatorDetail({ indicator, history }: Awaited<ReturnType<typeof getIndicator>> extends infer T ? { indicator: NonNullable<T>; history: Awaited<ReturnType<typeof getIndicatorHistory>> } : never) {
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
        <div className="section-head"><h2>전년동월비/전월비 추이</h2></div>
        <IndicatorChart data={history} />
      </section>
      <section className="grid two section">
        <article className="card card-inner info-card"><h2>설명</h2><p>CPI는 소비자 관점의 물가 압력을 보여주는 핵심 지표입니다. 서비스 물가와 주거비 둔화 여부가 시장 해석의 중심이 됩니다.</p></article>
        <article className="card card-inner info-card"><h2>왜 중요한지</h2><p>물가가 예상보다 높으면 금리 인하 기대가 후퇴하고 성장주 할인율 부담이 커질 수 있습니다.</p></article>
        <article className="card card-inner info-card wide"><h2>나스닥과의 관계</h2><p>CPI 발표 직후에는 미 국채금리와 달러가 먼저 반응하고, 그 움직임이 나스닥 대형 성장주의 변동성으로 이어지는 경우가 많습니다.</p></article>
      </section>
    </main>
  );
}
