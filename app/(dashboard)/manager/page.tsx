"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/kpi-card";
import { DataTable } from "@/components/data-table";
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
        <div className="animate-pulse text-gray-400">Loading...</div>
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
    <div className="space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Team Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.kpis.map((kpi) => (
          <KPICard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* Active Pools */}
      {data.activePools.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold tracking-tight mb-4">Active Pools</h2>
          <DataTable columns={poolColumns} data={data.activePools} />
        </div>
      )}

      {/* Team Leaderboard */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Team Leaderboard</h2>
        <DataTable columns={leaderboardColumns} data={data.leaderboard} />
      </div>
    </div>
  );
}
