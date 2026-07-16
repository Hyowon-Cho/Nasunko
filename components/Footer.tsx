import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong>나선코</strong>
        <p> 왜 내 주식만 안 오르는 건데? 차트, 지표, 뉴스를 한 화면에서.</p>
      </div>
      <div className="footer-links">
        <Link href="/nasdaq">나스닥</Link>
        <Link href="/feed">뉴스</Link>
        <Link href="/analytics">분석</Link>
        <Link href="/lounge">라운지</Link>
        <Link href="/trades">수익/손절</Link>
      </div>
      <p className="notice">투자 판단의 책임은 본인에게 있습니다.</p>
      <p className="copyright">© 2026 나선코</p>
    </footer>
  );
}
