export type NewsCategory = "전체" | "경제지표" | "FOMC" | "빅테크" | "반도체" | "환율" | "금리" | "유가" | "코스피";

export type NewsItem = {
  id: string;
  time: string;
  title: string;
  category: Exclude<NewsCategory, "전체">;
  tags: string[];
  likes: number;
  dislikes: number;
  comments: number;
  url?: string;
};

export const newsCategories: NewsCategory[] = ["전체", "경제지표", "FOMC", "빅테크", "반도체", "환율", "금리", "유가", "코스피"];

const KR_RSS_SOURCES = [
  { url: "https://www.yna.co.kr/rss/economy.xml", site: "연합뉴스" },
  { url: "https://rss.donga.com/economy.xml", site: "동아일보" },
  { url: "https://www.hankyung.com/feed/all-news", site: "한국경제" },
];

const CATEGORY_KEYWORDS: [Exclude<NewsCategory, "전체">, string[]][] = [
  ["FOMC", ["FOMC", "연방준비제도", "연준", "파월", "워시", "Fed ", "통화정책", "기준금리 결정", "금리 인상", "금리 인하", "연방공개시장위원회", "점도표", "베이지북"]],
  ["경제지표", ["CPI", "PPI", "PCE", "GDP", "고용지표", "실업률", "소비자물가", "생산자물가", "인플레이션", "경제성장률", "소매판매", "비농업", "고용보고서", "무역수지", "ISM", "PMI", "신규실업"]],
  ["반도체", ["반도체", "엔비디아", "NVIDIA", "AMD", "TSMC", "SK하이닉스", "인텔", "퀄컴", "마이크론", "ASML", "HBM", "D램", "낸드", "파운드리", "시스템반도체", "AI칩", "GPU"]],
  ["빅테크", ["애플", "마이크로소프트", "아마존", "메타", "구글", "알파벳", "테슬라", "넷플릭스", "오픈AI", "OpenAI", "빅테크", "AI 모델", "클라우드", "스트리밍"]],
  ["유가", ["유가", "WTI", "원유", "브렌트", "OPEC", "배럴", "석유", "에너지 가격", "산유국", "이란 원유", "러시아 원유"]],
  ["환율", ["환율", "달러-원", "달러/원", "원화 가치", "달러 강세", "달러 약세", "엔화", "위안화", "유로화", "DXY", "달러인덱스", "외환보유"]],
  ["금리", ["기준금리", "국채 금리", "국채 수익률", "회사채", "장단기 금리", "채권 시장", "금리 동결", "금리 인상", "금리 인하", "10년물", "2년물"]],
  ["코스피", ["코스피", "코스닥", "국내 증시", "한국 증시", "외국인 순매수", "외국인 순매도", "증시 마감", "주가지수", "코스피200"]],
];

function categorize(title: string): Exclude<NewsCategory, "전체"> | null {
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => title.includes(kw))) {
      return category;
    }
  }
  return null;
}

function extractCdataOrText(xml: string, tag: string): string {
  const cdataMatch = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`));
  if (cdataMatch) return cdataMatch[1].trim();
  const textMatch = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return textMatch ? textMatch[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').trim() : "";
}

function parseRssTime(pubDate: string): string {
  try {
    const date = new Date(pubDate);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Seoul",
    }).format(date);
  } catch {
    return "";
  }
}

async function fetchRssSource(source: { url: string; site: string }): Promise<NewsItem[]> {
  try {
    const res = await fetch(source.url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const items: NewsItem[] = [];
    const seen = new Set<string>();

    for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      const itemXml = match[1];
      const title = extractCdataOrText(itemXml, "title");
      const link = extractCdataOrText(itemXml, "link") || (itemXml.match(/<link\s*\/?>\s*(https?:\/\/[^\s<]+)/)?.[1] ?? "");
      const pubDate = extractCdataOrText(itemXml, "pubDate");
      const desc = extractCdataOrText(itemXml, "description").replace(/<[^>]+>/g, "");

      if (!title || !link || seen.has(link)) continue;
      seen.add(link);

      const time = parseRssTime(pubDate);
      if (!time) continue;

      const category = categorize(title + " " + desc);
      if (!category) continue;

      items.push({
        id: `rss-${link}`,
        time,
        title,
        category,
        tags: [source.site],
        likes: 0,
        dislikes: 0,
        comments: 0,
        url: link,
      });
    }

    return items;
  } catch {
    return [];
  }
}

async function fetchKrNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(KR_RSS_SOURCES.map(fetchRssSource));

  const seen = new Set<string>();
  const items: NewsItem[] = [];

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const item of result.value) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
    }
  }

  items.sort((a, b) => b.time.localeCompare(a.time));
  return items.slice(0, 50);
}

export const mockNews: NewsItem[] = [
  { id: "n1", time: "05:54", title: "나스닥, 반도체 강세에 장중 고점 재시도", category: "반도체", tags: ["IXIC", "SOXX"], likes: 42, dislikes: 4, comments: 13 },
  { id: "n2", time: "05:32", title: "미 10년물 금리 4.3%대 등락, 성장주 밸류에이션 부담 완화", category: "금리", tags: ["US10Y", "성장주"], likes: 28, dislikes: 2, comments: 8 },
  { id: "n3", time: "04:58", title: "달러·원 환율 하락세, 위험자산 선호 흐름 반영", category: "환율", tags: ["USD/KRW", "DXY"], likes: 19, dislikes: 1, comments: 5 },
  { id: "n4", time: "04:22", title: "빅테크 프리마켓 혼조, NVDA·AVGO 상대 강세", category: "빅테크", tags: ["NVDA", "AVGO"], likes: 35, dislikes: 5, comments: 11 },
  { id: "n5", time: "03:40", title: "WTI 유가 상승, 에너지 섹터와 인플레이션 기대 주목", category: "유가", tags: ["WTI", "CPI"], likes: 12, dislikes: 3, comments: 4 },
  { id: "n6", time: "02:15", title: "FOMC 의사록 대기, 나스닥은 금리 경로 문구에 집중", category: "FOMC", tags: ["FOMC", "Fed"], likes: 24, dislikes: 6, comments: 14 },
  { id: "n7", time: "01:30", title: "다음 CPI 발표 앞두고 전월비 서비스 물가가 핵심 변수", category: "경제지표", tags: ["CPI", "인플레"], likes: 31, dislikes: 2, comments: 10 },
  { id: "n8", time: "00:48", title: "코스피 흐름, 나스닥과 환율 영향권", category: "코스피", tags: ["코스피", "나스닥"], likes: 16, dislikes: 1, comments: 7 },
];

export async function getNews(category: NewsCategory = "전체"): Promise<NewsItem[]> {
  const krNews = await fetchKrNews();
  const news = krNews.length > 0 ? krNews : mockNews;

  if (category === "전체") return news;
  return news.filter((item) => item.category === category);
}
