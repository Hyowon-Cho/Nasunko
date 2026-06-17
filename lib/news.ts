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
};

export const newsCategories: NewsCategory[] = ["전체", "경제지표", "FOMC", "빅테크", "반도체", "환율", "금리", "유가", "코스피"];

export const mockNews: NewsItem[] = [
  { id: "n1", time: "05:54", title: "나스닥, 반도체 강세에 장중 고점 재시도", category: "반도체", tags: ["IXIC", "SOXX"], likes: 42, dislikes: 4, comments: 13 },
  { id: "n2", time: "05:32", title: "미 10년물 금리 4.3%대 등락, 성장주 밸류에이션 부담 완화", category: "금리", tags: ["US10Y", "성장주"], likes: 28, dislikes: 2, comments: 8 },
  { id: "n3", time: "04:58", title: "달러·원 환율 하락세, 위험자산 선호 흐름 반영", category: "환율", tags: ["USD/KRW", "DXY"], likes: 19, dislikes: 1, comments: 5 },
  { id: "n4", time: "04:22", title: "빅테크 프리마켓 혼조, NVDA·AVGO 상대 강세", category: "빅테크", tags: ["NVDA", "AVGO"], likes: 35, dislikes: 5, comments: 11 },
  { id: "n5", time: "03:40", title: "WTI 유가 상승, 에너지 섹터와 인플레이션 기대 주목", category: "유가", tags: ["WTI", "CPI"], likes: 12, dislikes: 3, comments: 4 },
  { id: "n6", time: "02:15", title: "FOMC 의사록 대기, 나스닥은 금리 경로 문구에 집중", category: "FOMC", tags: ["FOMC", "Fed"], likes: 24, dislikes: 6, comments: 14 },
  { id: "n7", time: "01:30", title: "다음 CPI 발표 앞두고 전월비 서비스 물가가 핵심 변수", category: "경제지표", tags: ["CPI", "인플레"], likes: 31, dislikes: 2, comments: 10 },
  { id: "n8", time: "00:48", title: "코스피 흐름, 나스닥과 환율 영향권", category: "코스피", tags: ["코스피", "나스닥"], likes: 16, dislikes: 1, comments: 7 }
];

export async function getNews(category: NewsCategory = "전체") {
  if (category === "전체") {
    return mockNews;
  }

  return mockNews.filter((item) => item.category === category);
}
