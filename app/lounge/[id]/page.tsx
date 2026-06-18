import type { Metadata } from "next";
import { LoungeDetail } from "@/components/LoungeDetail";

export const metadata: Metadata = {
  title: "나선코 라운지 글",
  description: "나선코 라운지 게시글과 댓글을 확인하세요."
};

export default async function LoungeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LoungeDetail id={id} />;
}
