"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { SkeletonCard, SkeletonTable } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { formatCurrency } from "@/lib/format";
import { apiFetch } from "@/lib/api";
import { Participant, Column } from "@/lib/types";

const podiumConfig = [
  {
    order: "sm:order-2",
    color: "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300",
    ring: "ring-2 ring-amber-200",
    trophy: "\uD83E\uDD47",
    avatarBg: "from-amber-200 to-yellow-200 text-amber-800",
    height: "sm:-mt-4",
    label: "1st Place",
  },
  {
    order: "sm:order-1",
    color: "bg-gradient-to-br from-gray-50 to-slate-100 border-gray-300",
    ring: "",
    trophy: "\uD83E\uDD48",
    avatarBg: "from-gray-200 to-slate-200 text-gray-700",
    height: "sm:mt-4",
    label: "2nd Place",
  },
  {
    order: "sm:order-3",
    color: "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300",
    ring: "",
    trophy: "\uD83E\uDD49",
    avatarBg: "from-orange-200 to-amber-200 text-orange-800",
    height: "sm:mt-8",
    label: "3rd Place",
  },
];

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} className="text-center" />
          ))}
        </div>
        <SkeletonTable rows={7} cols={5} />
      </div>
    );
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  if (entries.length === 0) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <EmptyState icon="trophy" title="No rankings yet" description="Once a competition starts and reps log sales, rankings will appear here." action={{ label: "View Competitions", href: "/competitions" }} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>

      {/* Podium — 2nd / 1st / 3rd layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        {top3.map((p, i) => {
          const cfg = podiumConfig[i];
          return (
            <div
              key={p.id}
              className={`${cfg.order} ${cfg.height} ${cfg.color} ${cfg.ring} border-2 rounded-2xl p-6 text-center shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1`}
            >
              <div className="text-3xl mb-2">{cfg.trophy}</div>
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${cfg.avatarBg} flex items-center justify-center text-lg font-semibold mx-auto mb-3 shadow-sm`}>
                {p.avatar}
              </div>
              <p className="font-semibold text-lg">{p.name}</p>
              <p className="text-emerald-600 font-mono text-2xl font-bold mt-1">
                {formatCurrency(Number(p.revenue))}
              </p>
              <p className="text-gray-400 text-sm mt-1">{p.deals} deals</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-2">{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Full ranking */}
      <DataTable
        columns={columns}
        data={rest}
      />
    </div>
  );
}
