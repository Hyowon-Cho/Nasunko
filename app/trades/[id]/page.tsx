import type { Metadata } from "next";
import { TradeDetail } from "@/components/TradeDetail";

export const metadata: Metadata = {
  title: "나선코 수익/손절 인증",
  description: "나선코 회원의 매매 인증과 복기를 확인합니다.",
};

export default async function TradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TradeDetail id={id} />;
}
