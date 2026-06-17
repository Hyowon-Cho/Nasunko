import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "나스닥 실시간 시세 나선코",
  description: "나스닥 종합주가지수, 미국 빅테크, 반도체, 경제지표, 환율, 금리, 실시간 뉴스를 한 화면에서 확인하세요."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <div className="site-shell">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
