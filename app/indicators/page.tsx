import type { Metadata } from "next";
import Link from "next/link";
import { getIndicators } from "@/lib/indicators";

export const metadata: Metadata = {
  title: "나선코 - 미국 경제지표 캘린더",
  description: "미국 CPI, PPI, FOMC, 고용, 실업률, 소매판매와 나스닥100 선물의 관계를 확인하세요."
};

export default async function IndicatorsPage() {
  const indicators = await getIndicators();

  return (
    <main className="main">
      <section className="hero">
        <h1 className="page-title">경제지표</h1>
        <p className="page-subtitle">나스닥100 야간선물에 영향을 주는 미국 물가, 고용, 소비, FOMC 일정을 한 화면에서 확인합니다.</p>
      </section>
      <section className="grid three section">
        {indicators.map((indicator) => (
          <article className="card indicator-card" key={indicator.slug}>
            <div className="card-inner">
              <div className="section-head">
                <h2>{indicator.name}</h2>
                <span className="badge">{indicator.releaseDate}</span>
              </div>
              <div className="indicator-stats">
                <div><span>최근 발표값</span><strong>{indicator.latest}</strong></div>
                <div><span>예상</span><strong>{indicator.forecast}</strong></div>
                <div><span>이전</span><strong>{indicator.previous}</strong></div>
              </div>
              <p>{indicator.description}</p>
              <Link className="button" href={`/indicators/${indicator.slug}`}>상세 보기</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
