export type Indicator = {
  slug: string;
  name: string;
  latest: string;
  forecast: string;
  previous: string;
  releaseDate: string;
  description: string;
};

export type IndicatorPoint = {
  month: string;
  yoy: number;
  mom: number;
};

export const indicators: Indicator[] = [
  { slug: "cpi", name: "미국 CPI", latest: "2.4%", forecast: "2.5%", previous: "2.3%", releaseDate: "2026-07-15", description: "소비자물가지수는 가계가 구매하는 상품과 서비스 가격 변화를 보여줍니다." },
  { slug: "ppi", name: "미국 PPI", latest: "2.6%", forecast: "2.7%", previous: "2.4%", releaseDate: "2026-07-16", description: "생산자물가지수는 기업 판매 가격의 변화를 통해 향후 소비자물가 압력을 가늠하게 합니다." },
  { slug: "fomc", name: "FOMC", latest: "4.25-4.50%", forecast: "동결", previous: "4.25-4.50%", releaseDate: "2026-07-29", description: "연준의 기준금리 결정과 점도표, 기자회견은 금리와 성장주 할인율에 직접 영향을 줍니다." },
  { slug: "payrolls", name: "비농업 고용", latest: "164K", forecast: "140K", previous: "139K", releaseDate: "2026-07-03", description: "고용 증가 속도는 경기와 임금 압력, 연준 정책 기대를 동시에 움직입니다." },
  { slug: "unemployment", name: "실업률", latest: "4.1%", forecast: "4.2%", previous: "4.2%", releaseDate: "2026-07-03", description: "실업률은 노동시장 냉각 여부를 확인하는 대표 지표입니다." },
  { slug: "retail-sales", name: "소매판매", latest: "0.3%", forecast: "0.2%", previous: "-0.1%", releaseDate: "2026-07-17", description: "소비 모멘텀을 보여주며 경기 민감주와 금리 기대에 영향을 줍니다." }
];

export const indicatorHistory: Record<string, IndicatorPoint[]> = {
  cpi: [
    { month: "1월", yoy: 3.1, mom: 0.3 },
    { month: "2월", yoy: 3.0, mom: 0.2 },
    { month: "3월", yoy: 2.8, mom: 0.1 },
    { month: "4월", yoy: 2.6, mom: 0.2 },
    { month: "5월", yoy: 2.3, mom: 0.1 },
    { month: "6월", yoy: 2.4, mom: 0.2 }
  ],
  ppi: [
    { month: "1월", yoy: 3.4, mom: 0.4 },
    { month: "2월", yoy: 3.1, mom: 0.2 },
    { month: "3월", yoy: 2.9, mom: 0.1 },
    { month: "4월", yoy: 2.7, mom: 0.2 },
    { month: "5월", yoy: 2.4, mom: 0.0 },
    { month: "6월", yoy: 2.6, mom: 0.2 }
  ]
};

export async function getIndicators() {
  // FRED_API_KEY can be used here later. The mock payload keeps all pages stable.
  return indicators;
}

export async function getIndicator(slug: string) {
  return indicators.find((item) => item.slug === slug);
}

export async function getIndicatorHistory(slug: string) {
  return indicatorHistory[slug] ?? indicatorHistory.cpi;
}
