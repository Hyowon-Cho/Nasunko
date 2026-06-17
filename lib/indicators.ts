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

const DESCRIPTIONS: Record<string, string> = {
  cpi: "소비자물가지수는 가계가 구매하는 상품과 서비스 가격 변화를 보여줍니다.",
  ppi: "생산자물가지수는 기업 판매 가격의 변화를 통해 향후 소비자물가 압력을 가늠하게 합니다.",
  fomc: "연준의 기준금리 결정과 점도표, 기자회견은 금리와 성장주 할인율에 직접 영향을 줍니다.",
  payrolls: "고용 증가 속도는 경기와 임금 압력, 연준 정책 기대를 동시에 움직입니다.",
  unemployment: "실업률은 노동시장 냉각 여부를 확인하는 대표 지표입니다.",
  "retail-sales": "소비 모멘텀을 보여주며 경기 민감주와 금리 기대에 영향을 줍니다.",
};

const NEXT_RELEASE: Record<string, string> = {
  cpi: "2026-07-15",
  ppi: "2026-07-16",
  fomc: "2026-07-29",
  payrolls: "2026-07-07",
  unemployment: "2026-07-07",
  "retail-sales": "2026-07-17",
};

const MOCK_INDICATORS: Indicator[] = [
  { slug: "cpi", name: "미국 CPI", latest: "2.4%", forecast: "—", previous: "2.3%", releaseDate: NEXT_RELEASE.cpi, description: DESCRIPTIONS.cpi },
  { slug: "ppi", name: "미국 PPI", latest: "2.6%", forecast: "—", previous: "2.4%", releaseDate: NEXT_RELEASE.ppi, description: DESCRIPTIONS.ppi },
  { slug: "fomc", name: "FOMC", latest: "4.25–4.50%", forecast: "동결", previous: "4.25–4.50%", releaseDate: NEXT_RELEASE.fomc, description: DESCRIPTIONS.fomc },
  { slug: "payrolls", name: "비농업 고용", latest: "164K", forecast: "—", previous: "139K", releaseDate: NEXT_RELEASE.payrolls, description: DESCRIPTIONS.payrolls },
  { slug: "unemployment", name: "실업률", latest: "4.1%", forecast: "—", previous: "4.2%", releaseDate: NEXT_RELEASE.unemployment, description: DESCRIPTIONS.unemployment },
  { slug: "retail-sales", name: "소매판매", latest: "0.3%", forecast: "—", previous: "-0.1%", releaseDate: NEXT_RELEASE["retail-sales"], description: DESCRIPTIONS["retail-sales"] },
];

type BlsSeries = { seriesID: string; data: { year: string; period: string; value: string }[] };

async function fetchBls(): Promise<BlsSeries[]> {
  try {
    const res = await fetch("https://api.bls.gov/publicAPI/v1/timeseries/data/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seriesid: ["CUUR0000SA0", "WPUFD49207", "LNS14000000", "CES0000000001"],
        startyear: String(new Date().getFullYear() - 1),
        endyear: String(new Date().getFullYear()),
      }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json() as { Results: { series: BlsSeries[] } };
    return json.Results.series;
  } catch {
    return [];
  }
}

function toTargetRange(effectiveRate: number): string {
  const lower = Math.floor(effectiveRate / 0.25) * 0.25;
  const upper = lower + 0.25;
  return `${lower.toFixed(2)}–${upper.toFixed(2)}%`;
}

async function fetchFomcRate(): Promise<{ latest: string; previous: string } | null> {
  try {
    const res = await fetch("https://fred.stlouisfed.org/graph/fredgraph.csv?id=FEDFUNDS", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const text = await res.text();
    const rows = text.trim().split("\n").slice(1).reverse();
    const parse = (row: string) => {
      const val = parseFloat(row.split(",")[1]);
      return isNaN(val) ? null : val;
    };
    const latest = parse(rows[0]);
    const previous = parse(rows[1]);
    if (!latest) return null;
    return {
      latest: toTargetRange(latest),
      previous: previous ? toTargetRange(previous) : "—",
    };
  } catch {
    return null;
  }
}

function blsPoints(series: BlsSeries): { key: string; value: number }[] {
  return series.data
    .filter((r) => r.period !== "M13" && r.value !== "-")
    .map((r) => ({ key: r.year + r.period, value: parseFloat(r.value) }))
    .filter((r) => !isNaN(r.value))
    .sort((a, b) => a.key.localeCompare(b.key));
}

function calcYoY(points: { key: string; value: number }[]): { latest: string; previous: string } {
  if (points.length < 2) return { latest: "—", previous: "—" };
  const latest = points[points.length - 1];
  const prevMonth = points[points.length - 2];
  const yearAgoKey = String(parseInt(latest.key.slice(0, 4)) - 1) + latest.key.slice(4);
  const yearAgo = points.find((p) => p.key === yearAgoKey);
  const prevYearAgoKey = String(parseInt(prevMonth.key.slice(0, 4)) - 1) + prevMonth.key.slice(4);
  const prevYearAgo = points.find((p) => p.key === prevYearAgoKey);

  const fmt = (v: number) => `${v.toFixed(1)}%`;
  return {
    latest: yearAgo ? fmt(((latest.value / yearAgo.value) - 1) * 100) : "—",
    previous: prevYearAgo ? fmt(((prevMonth.value / prevYearAgo.value) - 1) * 100) : "—",
  };
}

function calcMoM(points: { key: string; value: number }[]): { latest: string; previous: string } {
  if (points.length < 3) return { latest: "—", previous: "—" };
  const [p2, p1, p0] = points.slice(-3);
  const fmt = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
  return {
    latest: fmt(((p0.value / p1.value) - 1) * 100),
    previous: fmt(((p1.value / p2.value) - 1) * 100),
  };
}

function calcNfp(points: { key: string; value: number }[]): { latest: string; previous: string } {
  if (points.length < 3) return { latest: "—", previous: "—" };
  const [p2, p1, p0] = points.slice(-3);
  const fmt = (v: number) => `${Math.round(v)}K`;
  return {
    latest: fmt(p0.value - p1.value),
    previous: fmt(p1.value - p2.value),
  };
}

function calcRate(points: { key: string; value: number }[]): { latest: string; previous: string } {
  if (points.length < 2) return { latest: "—", previous: "—" };
  const [p1, p0] = points.slice(-2);
  const fmt = (v: number) => `${v.toFixed(1)}%`;
  return { latest: fmt(p0.value), previous: fmt(p1.value) };
}

export async function getIndicators(): Promise<Indicator[]> {
  const [blsSeries, fomc] = await Promise.all([fetchBls(), fetchFomcRate()]);

  if (blsSeries.length === 0 && !fomc) return MOCK_INDICATORS;

  const byId = Object.fromEntries(blsSeries.map((s) => [s.seriesID, blsPoints(s)]));
  const cpiPts = byId["CUUR0000SA0"] ?? [];
  const ppiPts = byId["WPUFD49207"] ?? [];
  const unPts = byId["LNS14000000"] ?? [];
  const nfpPts = byId["CES0000000001"] ?? [];

  const cpi = calcYoY(cpiPts);
  const ppi = calcYoY(ppiPts);
  const un = calcRate(unPts);
  const nfp = calcNfp(nfpPts);

  return [
    { slug: "cpi", name: "미국 CPI", ...cpi, forecast: "—", releaseDate: NEXT_RELEASE.cpi, description: DESCRIPTIONS.cpi },
    { slug: "ppi", name: "미국 PPI", ...ppi, forecast: "—", releaseDate: NEXT_RELEASE.ppi, description: DESCRIPTIONS.ppi },
    {
      slug: "fomc", name: "FOMC",
      latest: fomc?.latest ?? MOCK_INDICATORS[2].latest,
      forecast: "동결",
      previous: fomc?.previous ?? MOCK_INDICATORS[2].previous,
      releaseDate: NEXT_RELEASE.fomc, description: DESCRIPTIONS.fomc,
    },
    { slug: "payrolls", name: "비농업 고용", ...nfp, forecast: "—", releaseDate: NEXT_RELEASE.payrolls, description: DESCRIPTIONS.payrolls },
    { slug: "unemployment", name: "실업률", ...un, forecast: "—", releaseDate: NEXT_RELEASE.unemployment, description: DESCRIPTIONS.unemployment },
    MOCK_INDICATORS[5],
  ];
}

export async function getIndicator(slug: string): Promise<Indicator | undefined> {
  const all = await getIndicators();
  return all.find((item) => item.slug === slug);
}

export const indicatorHistory: Record<string, IndicatorPoint[]> = {
  cpi: [
    { month: "12월", yoy: 2.9, mom: 0.4 },
    { month: "1월", yoy: 3.0, mom: 0.5 },
    { month: "2월", yoy: 2.8, mom: 0.2 },
    { month: "3월", yoy: 2.6, mom: 0.1 },
    { month: "4월", yoy: 2.3, mom: 0.2 },
    { month: "5월", yoy: 2.4, mom: 0.2 },
  ],
  ppi: [
    { month: "12월", yoy: 3.4, mom: 0.4 },
    { month: "1월", yoy: 3.3, mom: 0.3 },
    { month: "2월", yoy: 3.1, mom: 0.1 },
    { month: "3월", yoy: 2.9, mom: 0.1 },
    { month: "4월", yoy: 2.7, mom: 0.0 },
    { month: "5월", yoy: 2.6, mom: 0.2 },
  ],
};

export async function getIndicatorHistory(slug: string): Promise<IndicatorPoint[]> {
  return indicatorHistory[slug] ?? indicatorHistory.cpi;
}
