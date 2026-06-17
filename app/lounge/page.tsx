import type { Metadata } from "next";
import Link from "next/link";
import { LoungeList } from "@/components/LoungeList";

export const metadata: Metadata = {
  title: "나선코 - 라운지",
  description: "나스닥100 야간선물, 빅테크, 반도체, 경제지표를 함께 보는 투자자 라운지입니다."
};

export default function LoungePage() {
  return (
    <main className="main lounge-main">
      <section className="hero lounge-head">
        <div>
          <h1 className="page-title"><span className="lounge-icon">▣</span> 라운지</h1>
        </div>
        <Link className="button write-button" href="/lounge/new">✎ 새 글</Link>
      </section>
      <LoungeList />
    </main>
  );
}
