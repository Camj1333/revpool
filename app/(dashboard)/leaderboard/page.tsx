"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { formatCurrency } from "@/lib/format";
import { apiFetch } from "@/lib/api";
import { Participant, Column } from "@/lib/types";

const podiumColors = [
  "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200/60",
  "bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200/60",
  "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/60",
];
const podiumLabels = ["1st", "2nd", "3rd"];

const columns: Column<Participant>[] = [
  { key: "rank", label: "#" },
  {
    key: "name",
    label: "Name",
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center text-xs font-medium">
          {(row as Participant).avatar}
        </div>
        <span>{(row as Participant).name}</span>
      </div>
    ),
  },
  {
    key: "revenue",
    label: "Revenue",
    render: (v) => (
      <span className="text-emerald-600 font-mono">{formatCurrency(v as number)}</span>
    ),
  },
  { key: "deals", label: "Deals" },
  {
    key: "change",
    label: "Trend",
    render: (v) => {
      const val = v as number;
      if (val === 0) return <span className="text-gray-500">-</span>;
      return (
        <span className={val > 0 ? "text-emerald-600" : "text-red-500"}>
          {val > 0 ? `\u2191${val}` : `\u2193${Math.abs(val)}`}
        </span>
      );
    },
  },
];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Participant[]>("/api/leaderboard").then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>

      {/* Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {top3.map((p, i) => (
          <div
            key={p.id}
            className={`${podiumColors[i]} border rounded-2xl p-6 text-center shadow-sm`}
          >
            <div className="text-lg font-bold text-gray-300 mb-2">{podiumLabels[i]}</div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center text-lg font-semibold mx-auto mb-3">
              {p.avatar}
            </div>
            <p className="font-semibold text-lg">{p.name}</p>
            <p className="text-emerald-600 font-mono text-2xl font-bold mt-1">
              {formatCurrency(Number(p.revenue))}
            </p>
            <p className="text-gray-400 text-sm mt-1">{p.deals} deals</p>
          </div>
        ))}
      </div>

      {/* Full ranking */}
      <DataTable
        columns={columns}
        data={rest}
      />
    </div>
  );
}
