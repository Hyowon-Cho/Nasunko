import type { Metadata } from "next";
import Link from "next/link";
import { TradeList } from "@/components/TradeList";

export const metadata: Metadata = {
  title: "나선코 수익/손절",
  description: "수익 인증과 손절 복기를 남기는 나선코 매매 인증 공간입니다.",
};

export default function TradesPage() {
  return (
    <main className="main lounge-main">
      <section className="lounge-hero">
        <div>
          <p className="lounge-kicker">나선코 수익/손절</p>
          <h1>매매를 기록하고 복기하는 곳</h1>
          <p>수익 인증과 손절 복기를 한 곳에 남겨보세요</p>
        </div>
        <Link className="lounge-write-button" href="/trades/new">인증하기</Link>
      </section>

      <section className="trade-type-grid">
        <article className="trade-type-card profit">
          <span>수익</span>
          <strong>수익 인증</strong>
          <p>종목, 수익률, 진입 이유를 기록하는 공간입니다.</p>
        </article>
        <article className="trade-type-card loss">
          <span>손절</span>
          <strong>손절 복기</strong>
          <p>손실 이유와 다음 매매에서 고칠 점을 정리합니다.</p>
        </article>
      </section>

      <TradeList />
    </main>
  );
}
