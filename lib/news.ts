import { query } from "@/lib/db";

export type NewsCategory = "전체" | "경제지표" | "FOMC" | "빅테크" | "반도체" | "환율" | "금리" | "유가" | "코스피";
export type StoredNewsCategory = Exclude<NewsCategory, "전체">;

export type NewsItem = {
  id: string;
  time: string;
  title: string;
  category: StoredNewsCategory;
  tags: string[];
  likes: number;
  dislikes: number;
  comments: number;
  url?: string;
  publishedAt?: string;
};

export type NewsSourceResult = {
  source: string;
  sourceUrl: string;
  articles: NewsItem[];
  error?: string;
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
      signal: AbortSignal.timeout(2500),
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
        publishedAt: new Date(pubDate).toISOString(),
      });
    }

    return items;
  } catch (error) {
    throw error;
  }
}

export async function fetchNewsSources(): Promise<NewsSourceResult[]> {
  const results = await Promise.allSettled(KR_RSS_SOURCES.map(fetchRssSource));
  return results.map((result, index) => ({
    source: KR_RSS_SOURCES[index].site,
    sourceUrl: KR_RSS_SOURCES[index].url,
    articles: result.status === "fulfilled" ? result.value : [],
    error: result.status === "rejected" ? String(result.reason) : undefined,
  }));
}

export async function fetchKrNews(): Promise<NewsItem[]> {
  const results = await fetchNewsSources();

  const seen = new Set<string>();
  const items: NewsItem[] = [];

  for (const result of results) {
    for (const item of result.articles) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
    }
  }

  items.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  return items.slice(0, 50);
}

/** @deprecated Use getNews. Kept empty until the legacy semiconductor route is migrated. */
export const mockNews: NewsItem[] = [];

type StoredNewsRow = {
  id: number;
  source: string;
  canonical_url: string;
  title: string;
  category: StoredNewsCategory;
  published_at: Date;
};

function newsRowToItem(row: StoredNewsRow): NewsItem {
  return {
    id: `db-${row.id}`,
    time: parseRssTime(row.published_at.toISOString()),
    title: row.title,
    category: row.category,
    tags: [row.source],
    likes: 0,
    dislikes: 0,
    comments: 0,
    url: row.canonical_url,
    publishedAt: row.published_at.toISOString(),
  };
}

async function getStoredNews(category: NewsCategory): Promise<NewsItem[]> {
  const values: unknown[] = category === "전체" ? [] : [category];
  const categoryFilter = category === "전체" ? "" : "AND category = $1";
  const { rows } = await query<StoredNewsRow>(
    `SELECT id, source, canonical_url, title, category, published_at FROM news_articles
     WHERE published_at >= NOW() - INTERVAL '7 days' ${categoryFilter}
     ORDER BY published_at DESC LIMIT 50`, values,
  );
  return rows.map(newsRowToItem);
}

export async function getNews(category: NewsCategory = "전체"): Promise<NewsItem[]> {
  try {
    const storedNews = await getStoredNews(category);
    if (storedNews.length > 0) return storedNews;
  } catch {
    // Keep the feed available before migration or during DB outages.
  }

  const krNews = await fetchKrNews();

  if (category === "전체") return krNews;
  return krNews.filter((item) => item.category === category);
}
