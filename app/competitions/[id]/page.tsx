"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { KPICard } from "@/components/kpi-card";
import { BarChart } from "@/components/charts/bar-chart";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/format";
import { apiFetch } from "@/lib/api";
import { Competition, Participant, Column, ChartDataPoint } from "@/lib/types";

const participantColumns: Column<Participant>[] = [
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

export default function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<Competition>(`/api/competitions/${id}`).catch(() => null),
      apiFetch<Participant[]>(`/api/competitions/${id}/participants`).catch(() => []),
    ]).then(([comp, parts]) => {
      if (!comp) {
        setNotFound(true);
      } else {
        setCompetition(comp);
        setParticipants(parts);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Link href="/competitions" className="text-blue-400 hover:text-blue-300 text-sm">
          &larr; Back to Competitions
        </Link>
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (notFound || !competition) {
    return (
      <div className="space-y-4">
        <Link href="/competitions" className="text-blue-400 hover:text-blue-300 text-sm">
          &larr; Back to Competitions
        </Link>
        <p className="text-gray-400">Competition not found.</p>
      </div>
    );
  }

  const kpis = [
    { label: "Total Revenue", value: formatCurrency(competition.revenue), change: 0, changeLabel: "vs last period" },
    { label: "Participants", value: String(competition.participants), change: 0, changeLabel: "vs last comp" },
    { label: "Avg per Rep", value: formatCurrency(competition.participants > 0 ? Math.round(competition.revenue / competition.participants) : 0), change: 0, changeLabel: "vs last comp" },
  ];

  // Build revenue history from participant data
  const revenueHistory: ChartDataPoint[] = participants.length > 0
    ? participants.slice(0, 8).map((p) => ({ label: p.name.split(" ")[0], value: Number(p.revenue) }))
    : [];

  return (
    <div className="space-y-6">
      <Link
        href="/competitions"
        className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1"
      >
        &larr; Back to Competitions
      </Link>

      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{competition.name}</h1>
        <StatusBadge status={competition.status} />
      </div>

      <p className="text-gray-400 text-sm">
        {competition.startDate} &mdash; {competition.endDate || "TBD"}
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* Two-column: Chart + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Revenue by Rep</h2>
          <BarChart data={revenueHistory} />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight mb-4">Leaderboard</h2>
          <DataTable
            columns={participantColumns}
            data={participants}
          />
        </div>
      </div>
    </div>
  );
}
