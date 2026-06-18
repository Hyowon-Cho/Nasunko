import type { Metadata } from "next";
import { IndicatorDetailPage } from "@/components/IndicatorDetailPage";
import { getIndicator, getIndicatorHistory } from "@/lib/indicators";

export const metadata: Metadata = {
  title: "나선코 - 미국 PPI 상세",
  description: "미국 PPI 최신 발표값, 예상, 이전치와 나스닥의 관계를 확인하세요."
};

export default async function PpiPage() {
  const indicator = await getIndicator("ppi");
  const history = await getIndicatorHistory("ppi");

  return <IndicatorDetailPage indicator={indicator!} history={history} />;
}
