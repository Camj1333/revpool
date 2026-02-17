"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { KPICard } from "@/components/kpi-card";
import { BarChart } from "@/components/charts/bar-chart";
import { DataTable } from "@/components/data-table";
import { SkeletonKPIRow, SkeletonChart, SkeletonTable } from "@/components/skeleton";
import { useToast } from "@/components/toast";
import { formatCurrency } from "@/lib/format";
import { apiFetch } from "@/lib/api";
import { KPI, ChartDataPoint, Participant, Column } from "@/lib/types";

interface ActiveCompetition {
  id: number;
  name: string;
  endDate: string;
  rank: number;
  totalParticipants: number;
}

interface RepDashboardData {
  userName: string;
  activeCompetitions: ActiveCompetition[];
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
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calc() {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }
    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  // Urgency color: green > 7 days, amber 1-7 days, red < 1 day
  const totalHours = timeLeft.days * 24 + timeLeft.hours;
  const urgency = totalHours > 168 ? "green" : totalHours > 24 ? "amber" : "red";
  const urgencyColors = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    red: "bg-red-50 border-red-200 text-red-700",
  };
  const digitBg = {
    green: "bg-emerald-100/60",
    amber: "bg-amber-100/60",
    red: "bg-red-100/60",
  };

  const segments = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className={`border rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors ${urgencyColors[urgency]}`}>
      <h3 className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-4">Time Remaining</h3>
      <div className="flex gap-3">
        {segments.map((item, i) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="text-center">
              <div className={`${digitBg[urgency]} rounded-xl px-4 py-3 min-w-[64px]`}>
                <p className="text-3xl font-bold tracking-tight font-mono tabular-nums">
                  {String(item.value).padStart(2, "0")}
                </p>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mt-1.5 opacity-60">{item.label}</p>
            </div>
            {i < segments.length - 1 && (
              <span className="text-2xl font-bold opacity-30 -mt-5">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LogSaleCard({ competition, onSaleLogged }: { competition: ActiveCompetition; onSaleLogged: () => void }) {
  const [revenue, setRevenue] = useState("");
  const [deals, setDeals] = useState("1");
  const [logging, setLogging] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogging(true);
    try {
      const res = await fetch(`/api/competitions/${competition.id}/log-sale`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revenue: Number(revenue), deals: Number(deals) }),
      });
      if (res.ok) {
        setRevenue("");
        setDeals("1");
        toast("Sale logged successfully!");
        await onSaleLogged();
      } else {
        toast("Failed to log sale", "error");
      }
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h2 className="text-lg font-semibold tracking-tight mb-4">{competition.name}</h2>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Revenue ($)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            placeholder="5000"
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="w-28">
          <label className="block text-xs font-medium text-gray-500 mb-1">Deals</label>
          <input
            type="number"
            min="1"
            step="1"
            required
            value={deals}
            onChange={(e) => setDeals(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={logging}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          {logging ? "Logging..." : "Log Sale"}
        </button>
      </form>
    </div>
  );
}

export default function RepDashboardPage() {
  const [data, setData] = useState<RepDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () =>
    apiFetch<RepDashboardData>("/api/rep-dashboard")
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
        setLoading(false);
      });

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-gray-400 mt-1">Loading your performance data...</p>
        </div>
        <SkeletonKPIRow />
        <SkeletonChart />
        <SkeletonTable rows={5} cols={4} />
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
  const hasActive = data.activeCompetitions.length > 0;
  const nearestEnding = hasActive ? data.activeCompetitions[0] : null;

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting}, {firstName}</h1>
          {hasActive && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {data.activeCompetitions.map((comp) => (
                <span key={comp.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {comp.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {data.kpis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.kpis.map((kpi, i) => (
            <KPICard key={kpi.label} kpi={kpi} accentColor={["border-l-blue-500", "border-l-emerald-500", "border-l-violet-500", "border-l-amber-500"][i % 4]} delay={i * 75} />
          ))}
        </div>
      )}

      {/* Log Sale Cards — one per active competition */}
      {hasActive && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Log Sale</h2>
          {data.activeCompetitions.map((comp) => (
            <LogSaleCard key={comp.id} competition={comp} onSaleLogged={loadData} />
          ))}
        </div>
      )}

      {/* No active competition prompt */}
      {!hasActive && (
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

      {/* Countdown Timer — nearest ending competition */}
      {nearestEnding && (
        <CountdownTimer endDate={nearestEnding.endDate} />
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
