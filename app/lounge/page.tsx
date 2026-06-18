import type { Metadata } from "next";
import Link from "next/link";
import { LoungeList } from "@/components/LoungeList";

export const metadata: Metadata = {
  title: "나선코 - 라운지",
  description: "나스닥, 빅테크, 반도체, 경제지표를 함께 보는 투자자 라운지입니다."
};

export default function LoungePage() {
  return (
    <main className="main lounge-main">
      <section className="lounge-hero">
        <div>
          <p className="lounge-kicker">나선코 라운지</p>
          <h1>자유롭게 이야기하는 곳</h1>
          <p>자신의 생각을 가볍게 남겨보세요.</p>
        </div>
        <Link className="lounge-write-button" href="/lounge/new">글쓰기</Link>
      </section>
      <LoungeList />
    </main>
  );
}
