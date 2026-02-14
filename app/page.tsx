"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KPICard } from "@/components/kpi-card";
import { LineChart } from "@/components/charts/line-chart";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/format";
import { apiFetch } from "@/lib/api";
import { Competition, KPI, ChartDataPoint, Column } from "@/lib/types";

const columns: Column<Competition>[] = [
  { key: "name", label: "Competition" },
  { key: "leader", label: "Leader" },
  {
    key: "revenue",
    label: "Revenue",
    render: (v) => (
      <span className="text-green-400 font-mono">{formatCurrency(v as number)}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (v) => <StatusBadge status={v as Competition["status"]} />,
  },
  { key: "participants", label: "Participants" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<ChartDataPoint[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<KPI[]>("/api/dashboard"),
      apiFetch<{ monthlyRevenue: ChartDataPoint[]; competitionRevenue: ChartDataPoint[] }>("/api/analytics"),
      apiFetch<Competition[]>("/api/competitions"),
    ]).then(([kpiData, analyticsData, compData]) => {
      setKpis(kpiData);
      setMonthlyRevenue(analyticsData.monthlyRevenue);
      setCompetitions(compData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const recentCompetitions = competitions.slice(0, 5);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Revenue Overview</h2>
        <LineChart data={monthlyRevenue} />
      </div>

      {/* Recent Competitions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight">Recent Competitions</h2>
          <Link
            href="/competitions"
            className="text-sm text-blue-400 hover:text-blue-300 transition"
          >
            View all
          </Link>
        </div>
        <DataTable
          columns={columns}
          data={recentCompetitions}
          onRowClick={(row) => router.push(`/competitions/${row.id}`)}
        />
      </div>
    </div>
  );
}
