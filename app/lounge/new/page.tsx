import type { Metadata } from "next";
import { LoungeEditor } from "@/components/LoungeEditor";

export const metadata: Metadata = {
  title: "나선코 - 라운지 새 글",
  description: "나선코 라운지에 새 게시글을 작성하세요."
};

export default function LoungeNewPage() {
  return (
    <main className="main lounge-main">
      <section className="lounge-editor-head">
        <h1>새 글 작성</h1>
        <p>제목과 내용을 적고 필요하면 사진을 첨부하세요.</p>
      </section>
      <LoungeEditor />
    </main>
  );
}
