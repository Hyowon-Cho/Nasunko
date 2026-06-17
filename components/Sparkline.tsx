import { directionOf } from "@/lib/markets";

type SparklineProps = {
  values: number[];
  change?: number;
};

export function Sparkline({ values, change = 0 }: SparklineProps) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 96;
      const y = 30 - ((value - min) / spread) * 24;
      return `${x},${y}`;
    })
    .join(" ");
  const direction = directionOf(change);

  return (
    <svg className={`sparkline ${direction}`} viewBox="0 0 96 34" role="img" aria-label="미니 차트">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
