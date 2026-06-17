import type { Metadata } from "next";
import { LoungeEditor } from "@/components/LoungeEditor";

export const metadata: Metadata = {
  title: "나선코 - 라운지 새 글",
  description: "나선코 라운지에 새 게시글을 작성하세요."
};

export default function LoungeNewPage() {
  return (
    <main className="main lounge-main">
      <section className="hero">
        <h1 className="page-title">새 글 작성</h1>
      </section>
      <LoungeEditor />
    </main>
  );
}
