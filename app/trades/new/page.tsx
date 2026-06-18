import type { Metadata } from "next";
import Link from "next/link";

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
          <h1>인증 작성 준비 중</h1>
          <p>종목, 수익률, 스크린샷, 복기 내용을 남기는 폼을 붙일 예정입니다.</p>
        </div>
        <Link className="lounge-write-button" href="/trades">목록으로</Link>
      </section>
      <section className="empty-lounge trade-empty">
        <strong>곧 작성 기능을 연결합니다.</strong>
        <p>라운지처럼 DB 기반으로 작성, 수정, 삭제, 댓글까지 붙일 수 있게 만들면 됩니다.</p>
      </section>
    </main>
  );
}
