"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { IndicatorPoint } from "@/lib/indicators";

type IndicatorChartProps = {
  data: IndicatorPoint[];
};

export function IndicatorChart({ data }: IndicatorChartProps) {
  return (
    <div className="indicator-chart">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ left: -18, right: 10, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="yoy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2e7bff" stopOpacity={0.52} />
              <stop offset="95%" stopColor="#2e7bff" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="mom" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff4b55" stopOpacity={0.38} />
              <stop offset="95%" stopColor="#ff4b55" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#2a3040" strokeDasharray="4 4" />
          <XAxis dataKey="month" stroke="#8c93a3" tickLine={false} axisLine={false} />
          <YAxis stroke="#8c93a3" tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: "#151821", border: "1px solid #2a3040", borderRadius: 8 }} />
          <Area type="monotone" dataKey="yoy" name="전년동월비" stroke="#2e7bff" fill="url(#yoy)" strokeWidth={2} />
          <Area type="monotone" dataKey="mom" name="전월비" stroke="#ff4b55" fill="url(#mom)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
