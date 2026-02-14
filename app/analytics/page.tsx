"use client";

import { useState, useEffect, useMemo } from "react";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { apiFetch } from "@/lib/api";
import { ChartDataPoint } from "@/lib/types";

const timeRanges = ["7D", "30D", "90D", "12M"] as const;

// Generate data subsets based on selected range
function getDataForRange(range: string, monthlyRevenue: ChartDataPoint[]): ChartDataPoint[] {
  switch (range) {
    case "7D":
      return [
        { label: "Mon", value: 12400 },
        { label: "Tue", value: 15800 },
        { label: "Wed", value: 9200 },
        { label: "Thu", value: 18700 },
        { label: "Fri", value: 22100 },
        { label: "Sat", value: 8400 },
        { label: "Sun", value: 11300 },
      ];
    case "30D":
      return [
        { label: "W1", value: 45200 },
        { label: "W2", value: 52800 },
        { label: "W3", value: 38900 },
        { label: "W4", value: 61400 },
      ];
    case "90D":
      return monthlyRevenue.slice(-3);
    case "12M":
    default:
      return monthlyRevenue;
  }
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<string>("12M");
  const [monthlyRevenue, setMonthlyRevenue] = useState<ChartDataPoint[]>([]);
  const [competitionRevenue, setCompetitionRevenue] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ monthlyRevenue: ChartDataPoint[]; competitionRevenue: ChartDataPoint[] }>("/api/analytics").then((data) => {
      setMonthlyRevenue(data.monthlyRevenue);
      setCompetitionRevenue(data.competitionRevenue);
      setLoading(false);
    });
  }, []);

  const trendData = useMemo(() => getDataForRange(range, monthlyRevenue), [range, monthlyRevenue]);

  const comparisonData: ChartDataPoint[] = competitionRevenue.length > 0
    ? competitionRevenue.map((c) => ({ label: c.label.split(" ").slice(0, 2).join(" "), value: Number(c.value) }))
    : [];

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>

      {/* Time range selector */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1 w-fit">
        {timeRanges.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-1.5 rounded-md text-sm transition ${
              range === r
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Revenue Trends */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Revenue Trends</h2>
        <LineChart data={trendData} />
      </div>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold tracking-tight mb-4">By Competition</h2>
          <BarChart data={competitionRevenue.map((c) => ({ label: c.label.split(" ").slice(0, 2).join(" "), value: Number(c.value) }))} />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Quarterly Comparison</h2>
          <BarChart data={comparisonData} />
        </div>
      </div>
    </div>
  );
}
