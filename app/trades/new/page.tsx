import type { Metadata } from "next";
import Link from "next/link";
import { TradeEditor } from "@/components/TradeEditor";

export const metadata: Metadata = {
  title: "나선코 수익/손절 인증 작성",
  description: "나선코 수익/손절 인증을 작성합니다.",
};

export default function NewTradePage() {
  return (
    <main className="main lounge-main">
      <section className="lounge-editor-head">
        <div>
          <p className="lounge-kicker">수익/손절 인증</p>
          <h1>매매 인증 작성</h1>
          <p>종목, 수익률, 스크린샷과 복기 내용을 남겨보세요.</p>
        </div>
        <Link className="lounge-write-button" href="/trades">목록으로</Link>
      </section>
      <TradeEditor />
    </main>
  );
}
