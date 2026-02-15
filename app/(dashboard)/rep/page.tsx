"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { KPICard } from "@/components/kpi-card";
import { BarChart } from "@/components/charts/bar-chart";
import { DataTable } from "@/components/data-table";
import { formatCurrency } from "@/lib/format";
import { apiFetch } from "@/lib/api";
import { KPI, ChartDataPoint, Participant, Column } from "@/lib/types";

interface RepDashboardData {
  userName: string;
  activeCompetition: {
    id: number;
    name: string;
    endDate: string;
    rank: number;
    totalParticipants: number;
  } | null;
  kpis: KPI[];
  history: ChartDataPoint[];
  leaderboard: Participant[];
  participantId: number;
}

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

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    function calc() {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
      };
    }
    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 60000);
    return () => clearInterval(id);
  }, [endDate]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Time Remaining</h3>
      <div className="flex gap-6">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Minutes", value: timeLeft.minutes },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-3xl font-bold tracking-tight">{item.value}</p>
            <p className="text-xs text-gray-400 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RepDashboardPage() {
  const [data, setData] = useState<RepDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<RepDashboardData>("/api/rep-dashboard")
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-gray-400 mt-1">Loading your performance data...</p>
        </div>
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-10">
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-red-500">{error || "Failed to load dashboard data."}</p>
      </div>
    );
  }

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  const firstName = data.userName?.split(" ")[0] || "there";

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting}, {firstName}</h1>
          {data.activeCompetition && (
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {data.activeCompetition.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {data.kpis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.kpis.map((kpi) => (
            <KPICard key={kpi.label} kpi={kpi} />
          ))}
        </div>
      )}

      {/* No active competition prompt */}
      {!data.activeCompetition && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center">
          <p className="text-gray-500 mb-4">You haven&apos;t joined any active competitions yet.</p>
          <Link
            href="/competitions"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm"
          >
            Browse Competitions
          </Link>
        </div>
      )}

      {/* Countdown Timer */}
      {data.activeCompetition && (
        <CountdownTimer endDate={data.activeCompetition.endDate} />
      )}

      {/* Performance History */}
      {data.history.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold tracking-tight mb-4">My Performance</h2>
          <BarChart data={data.history.map((h) => ({ label: h.label.split(" ").slice(0, 2).join(" "), value: Number(h.value) }))} />
        </div>
      )}

      {/* Mini Leaderboard */}
      {data.leaderboard.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold tracking-tight mb-4">
            Competition Leaderboard
          </h2>
          <DataTable
            columns={leaderboardColumns}
            data={data.leaderboard}
            rowClassName={(row) =>
              Number((row as Participant).id) === data.participantId ? "bg-blue-50" : ""
            }
          />
        </div>
      )}
    </div>
  );
}
