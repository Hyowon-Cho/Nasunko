export type Indicator = {
  slug: string;
  name: string;
  latest: string;
  forecast: string;
  previous: string;
  releaseDate: string;
  description: string;
  source: string;
};

export type IndicatorPoint = {
  month: string;
  yoy: number;
  mom: number;
};

type FredPoint = {
  date: string;
  value: number;
};

type IndicatorConfig = {
  slug: string;
  name: string;
  fredSeries: string;
  kind: "index-yoy" | "monthly-change" | "rate" | "level" | "target-rate";
  description: string;
};

export const INDICATOR_CONFIGS: IndicatorConfig[] = [
  {
    slug: "cpi",
    name: "미국 CPI",
    fredSeries: "CPIAUCSL",
    kind: "index-yoy",
    description: "소비자물가지수는 가계가 구매하는 상품과 서비스 가격 변화를 보여줍니다.",
  },
  {
    slug: "ppi",
    name: "미국 PPI",
    fredSeries: "PPIACO",
    kind: "index-yoy",
    description: "생산자물가지수는 기업 판매 가격의 변화를 통해 향후 소비자물가 압력을 가늠하게 합니다.",
  },
  {
    slug: "fomc",
    name: "FOMC",
    fredSeries: "DFEDTARU",
    kind: "target-rate",
    description: "연준의 기준금리 결정과 점도표, 기자회견은 금리와 성장주 할인율에 직접 영향을 줍니다.",
  },
  {
    slug: "payrolls",
    name: "비농업 고용",
    fredSeries: "PAYEMS",
    kind: "monthly-change",
    description: "고용 증가 속도는 경기와 임금 압력, 연준 정책 기대를 동시에 움직입니다.",
  },
  {
    slug: "unemployment",
    name: "실업률",
    fredSeries: "UNRATE",
    kind: "rate",
    description: "실업률은 노동시장 냉각 여부를 확인하는 대표 지표입니다.",
  },
  {
    slug: "retail-sales",
    name: "소매판매",
    fredSeries: "RSAFS",
    kind: "index-yoy",
    description: "소비 모멘텀을 보여주며 경기 민감주와 금리 기대에 영향을 줍니다.",
  },
];

const KR_MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

function toPercent(value: number, signed = false) {
  const prefix = signed && value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

function toDateLabel(date: string) {
  return date.slice(0, 7);
}

function toMonthLabel(date: string) {
  const month = Number(date.slice(5, 7));
  return KR_MONTHS[month - 1] ?? date.slice(5, 7);
}

function normalizeFredPoints(points: FredPoint[]) {
  return points
    .filter((point) => point.date && Number.isFinite(point.value))
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchFredJsonSeries(seriesId: string): Promise<FredPoint[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) return [];

  const url = new URL("https://api.stlouisfed.org/fred/series/observations");
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "desc");
  url.searchParams.set("limit", "48");

  const res = await fetch(url, {
    next: { revalidate: 60 * 60 },
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) return [];

  const payload = await res.json() as { observations?: Array<{ date?: string; value?: string }> };
  return normalizeFredPoints((payload.observations ?? []).map((item) => ({
    date: item.date ?? "",
    value: Number(item.value),
  })));
}

async function fetchFredCsvSeries(seriesId: string): Promise<FredPoint[]> {
  const res = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`, {
    next: { revalidate: 60 * 60 },
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) return [];

  const csv = await res.text();
  return normalizeFredPoints(csv
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [date, rawValue] = line.split(",");
      return { date, value: Number(rawValue) };
    }));
}

async function fetchFredSeries(seriesId: string): Promise<FredPoint[]> {
  try {
    const jsonPoints = await fetchFredJsonSeries(seriesId);
    if (jsonPoints.length > 0) return jsonPoints;
  } catch {
    // Fall through to the public CSV endpoint.
  }

  try {
    return await fetchFredCsvSeries(seriesId);
  } catch {
    return [];
  }
}

function previousPoint(points: FredPoint[], point: FredPoint, offset: number) {
  const index = points.findIndex((candidate) => candidate.date === point.date);
  return index >= offset ? points[index - offset] : undefined;
}

function yearAgoPoint(points: FredPoint[], point: FredPoint) {
  const yearAgoDate = `${Number(point.date.slice(0, 4)) - 1}${point.date.slice(4)}`;
  return points.find((candidate) => candidate.date === yearAgoDate);
}

function calcIndexYoY(points: FredPoint[], point: FredPoint) {
  const yearAgo = yearAgoPoint(points, point);
  if (!yearAgo) return null;
  return ((point.value / yearAgo.value) - 1) * 100;
}

function calcIndexMoM(points: FredPoint[], point: FredPoint) {
  const prev = previousPoint(points, point, 1);
  if (!prev) return null;
  return ((point.value / prev.value) - 1) * 100;
}

function latestSummary(config: IndicatorConfig, points: FredPoint[]): Pick<Indicator, "latest" | "previous" | "releaseDate"> {
  const latest = points.at(-1);
  const previous = points.at(-2);

  if (!latest) {
    return { latest: "데이터 없음", previous: "데이터 없음", releaseDate: "확인 필요" };
  }

  if (config.kind === "index-yoy") {
    const latestYoY = calcIndexYoY(points, latest);
    const prevYoY = previous ? calcIndexYoY(points, previous) : null;
    return {
      latest: latestYoY === null ? "데이터 없음" : toPercent(latestYoY),
      previous: prevYoY === null ? "데이터 없음" : toPercent(prevYoY),
      releaseDate: toDateLabel(latest.date),
    };
  }

  if (config.kind === "monthly-change") {
    const prev = previousPoint(points, latest, 1);
    const prevPrev = previous ? previousPoint(points, previous, 1) : undefined;
    const latestChange = prev ? latest.value - prev.value : null;
    const previousChange = previous && prevPrev ? previous.value - prevPrev.value : null;
    return {
      latest: latestChange === null ? "데이터 없음" : `${Math.round(latestChange)}K`,
      previous: previousChange === null ? "데이터 없음" : `${Math.round(previousChange)}K`,
      releaseDate: toDateLabel(latest.date),
    };
  }

  if (config.kind === "target-rate") {
    return {
      latest: `${latest.value.toFixed(2)}%`,
      previous: previous ? `${previous.value.toFixed(2)}%` : "데이터 없음",
      releaseDate: latest.date,
    };
  }

  return {
    latest: config.kind === "rate" ? toPercent(latest.value) : latest.value.toLocaleString("en-US"),
    previous: previous ? (config.kind === "rate" ? toPercent(previous.value) : previous.value.toLocaleString("en-US")) : "데이터 없음",
    releaseDate: toDateLabel(latest.date),
  };
}

export async function getIndicators(): Promise<Indicator[]> {
  const allPoints = await Promise.all(INDICATOR_CONFIGS.map((config) => fetchFredSeries(config.fredSeries)));

  return INDICATOR_CONFIGS.map((config, index) => ({
    slug: config.slug,
    name: config.name,
    forecast: "컨센서스 별도 확인",
    description: config.description,
    source: `FRED:${config.fredSeries}`,
    ...latestSummary(config, allPoints[index] ?? []),
  }));
}

export async function getIndicator(slug: string): Promise<Indicator | undefined> {
  const all = await getIndicators();
  return all.find((item) => item.slug === slug);
}

export async function getIndicatorHistory(slug: string): Promise<IndicatorPoint[]> {
  const config = INDICATOR_CONFIGS.find((item) => item.slug === slug);
  if (!config) return [];

  const points = await fetchFredSeries(config.fredSeries);
  const recent = points.slice(-24);

  return recent.slice(-12).map((point) => {
    if (config.kind === "index-yoy") {
      return {
        month: toMonthLabel(point.date),
        yoy: Number((calcIndexYoY(points, point) ?? 0).toFixed(2)),
        mom: Number((calcIndexMoM(points, point) ?? 0).toFixed(2)),
      };
    }

    if (config.kind === "monthly-change") {
      const change = previousPoint(points, point, 1);
      return {
        month: toMonthLabel(point.date),
        yoy: change ? Math.round(point.value - change.value) : 0,
        mom: point.value,
      };
    }

    return {
      month: toMonthLabel(point.date),
      yoy: point.value,
      mom: previousPoint(points, point, 1)?.value ?? point.value,
    };
  });
}
