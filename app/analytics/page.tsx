import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { getAnalyticsSummary } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "나선코 분석",
  description: "뉴스 자동화와 나스닥 주요 종목 데이터를 KPI, 추세, 리스크 점수로 집계한 BI 분석 대시보드입니다.",
};

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const summary = await getAnalyticsSummary();

  return <AnalyticsDashboard summary={summary} />;
}
