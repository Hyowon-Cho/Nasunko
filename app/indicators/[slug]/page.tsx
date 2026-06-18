import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IndicatorDetailPage } from "@/components/IndicatorDetailPage";
import { getIndicator, getIndicatorHistory, INDICATOR_CONFIGS } from "@/lib/indicators";

export async function generateStaticParams() {
  return INDICATOR_CONFIGS.map((indicator) => ({ slug: indicator.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const indicator = await getIndicator(slug);

  if (!indicator) {
    return {
      title: "나선코 - 경제지표",
    };
  }

  return {
    title: `나선코 - ${indicator.name} 상세`,
    description: `${indicator.name} 최신 발표값, 이전치와 나스닥의 관계를 확인하세요.`,
  };
}

export default async function IndicatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const indicator = await getIndicator(slug);

  if (!indicator) notFound();

  const history = await getIndicatorHistory(slug);
  return <IndicatorDetailPage indicator={indicator} history={history} />;
}
