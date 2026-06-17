import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong>나선코</strong>
        <p>나스닥 종합주가지수 / 차트 / 빅테크 / 반도체 / 경제지표 / 뉴스를 한 화면에서.</p>
      </div>
      <div className="footer-links">
        <Link href="/nasdaq">나스닥</Link>
        <Link href="/big-tech">미국 빅테크</Link>
        <Link href="/indicators">경제지표</Link>
        <Link href="/news">실시간 뉴스룸</Link>
        <Link href="/lounge">라운지</Link>
      </div>
      <p className="notice">투자 판단의 책임은 본인에게 있습니다.</p>
      <p className="copyright">© 2026 나선코</p>
    </footer>
  );
}
