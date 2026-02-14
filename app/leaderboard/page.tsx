"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { formatCurrency } from "@/lib/format";
import { apiFetch } from "@/lib/api";
import { Participant, Column } from "@/lib/types";

const podiumColors = ["from-yellow-500/20 border-yellow-500/30", "from-gray-400/20 border-gray-400/30", "from-amber-600/20 border-amber-600/30"];
const podiumLabels = ["1st", "2nd", "3rd"];

const columns: Column<Participant>[] = [
  { key: "rank", label: "#" },
  {
    key: "name",
    label: "Name",
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium">
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
      <span className="text-green-400 font-mono">{formatCurrency(v as number)}</span>
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
        <span className={val > 0 ? "text-green-400" : "text-red-400"}>
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
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>

      {/* Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {top3.map((p, i) => (
          <div
            key={p.id}
            className={`bg-gradient-to-b ${podiumColors[i]} border rounded-xl p-6 text-center`}
          >
            <div className="text-sm text-gray-400 mb-2">{podiumLabels[i]}</div>
            <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-lg font-semibold mx-auto mb-3">
              {p.avatar}
            </div>
            <p className="font-semibold text-lg">{p.name}</p>
            <p className="text-green-400 font-mono text-xl mt-1">
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
