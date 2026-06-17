import type { Metadata } from "next";
import { IndicatorChart } from "@/components/IndicatorChart";
import { getIndicator, getIndicatorHistory } from "@/lib/indicators";

export const metadata: Metadata = {
  title: "나선코 - 미국 PPI 상세",
  description: "미국 PPI 최신 발표값, 예상, 이전치와 나스닥의 관계를 확인하세요."
};

export default async function PpiPage() {
  const indicator = await getIndicator("ppi");
  const history = await getIndicatorHistory("ppi");

  return (
    <main className="main">
      <section className="hero">
        <h1 className="page-title">{indicator?.name}</h1>
        <p className="page-subtitle">{indicator?.description}</p>
      </section>
      <section className="grid three section">
        <article className="card card-inner metric"><span>최신 발표</span><strong>{indicator?.latest}</strong></article>
        <article className="card card-inner metric"><span>예상</span><strong>{indicator?.forecast}</strong></article>
        <article className="card card-inner metric"><span>이전</span><strong>{indicator?.previous}</strong></article>
      </section>
      <section className="card card-inner section">
        <div className="section-head"><h2>전년동월비/전월비 추이</h2></div>
        <IndicatorChart data={history} />
      </section>
      <section className="grid two section">
        <article className="card card-inner info-card"><h2>설명</h2><p>PPI는 생산자 단계 가격 변화입니다. 기업 비용 압력과 마진 전망을 통해 소비자물가의 선행 단서로 해석됩니다.</p></article>
        <article className="card card-inner info-card"><h2>왜 중요한지</h2><p>예상보다 높은 생산자물가는 인플레이션 재가속 우려를 키워 금리와 달러를 움직일 수 있습니다.</p></article>
        <article className="card card-inner info-card wide"><h2>나스닥과의 관계</h2><p>PPI가 높으면 금리 인하 기대가 약해지고, 낮으면 성장주 선호가 회복되는 식으로 나스닥에 영향을 줄 수 있습니다.</p></article>
      </section>
    </main>
  );
}
