"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/kpi-card";
import { DataTable } from "@/components/data-table";
import { SkeletonKPIRow, SkeletonTable } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { apiFetch } from "@/lib/api";
import { KPI, Participant, Column } from "@/lib/types";

interface ActivePool {
  id: number;
  name: string;
  status: "active" | "completed" | "upcoming";
  leader: string;
  revenue: number;
  endDate: string;
  participants: number;
}

interface ManagerDashboardData {
  kpis: KPI[];
  activePools: ActivePool[];
  leaderboard: Participant[];
}

const poolColumns: Column<ActivePool>[] = [
  { key: "name", label: "Competition" },
  {
    key: "status",
    label: "Status",
    render: (v) => <StatusBadge status={v as ActivePool["status"]} />,
  },
  { key: "leader", label: "Leader" },
  { key: "participants", label: "Participants" },
  {
    key: "revenue",
    label: "Revenue",
    render: (v) => (
      <span className="text-emerald-600 font-mono">{formatCurrency(v as number)}</span>
    ),
  },
  {
    key: "endDate",
    label: "End Date",
    render: (v) => new Date(v as string).toLocaleDateString(),
  },
];

const leaderboardColumns: Column<Participant>[] = [
  { key: "rank", label: "#" },
  {
    key: "name",
    label: "Name",
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center text-xs font-medium">
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
];

export default function ManagerDashboardPage() {
  const [data, setData] = useState<ManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ManagerDashboardData>("/api/manager-dashboard")
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-10">
        <h1 className="text-3xl font-bold tracking-tight">Team Overview</h1>
        <SkeletonKPIRow />
        <SkeletonTable rows={4} cols={6} />
        <SkeletonTable rows={5} cols={4} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-10">
        <h1 className="text-3xl font-bold tracking-tight">Team Overview</h1>
        <p className="text-red-500">{error || "Failed to load dashboard data."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in-up">
      <h1 className="text-3xl font-bold tracking-tight">Team Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.kpis.map((kpi, i) => (
          <KPICard key={kpi.label} kpi={kpi} accentColor={["border-l-blue-500", "border-l-emerald-500", "border-l-violet-500", "border-l-amber-500"][i % 4]} delay={i * 75} />
        ))}
      </div>

      {/* Active Pools */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Active Pools</h2>
        {data.activePools.length > 0 ? (
          <DataTable columns={poolColumns} data={data.activePools} />
        ) : (
          <EmptyState icon="trophy" title="No active pools" description="Create a competition to get your team started." action={{ label: "Create Competition", href: "/competitions" }} />
        )}
      </div>

      {/* Team Leaderboard */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Team Leaderboard</h2>
        {data.leaderboard.length > 0 ? (
          <DataTable columns={leaderboardColumns} data={data.leaderboard} />
        ) : (
          <EmptyState icon="users" title="No participants yet" description="Once reps join a competition, they'll appear here." />
        )}
      </div>
    </div>
  );
}
