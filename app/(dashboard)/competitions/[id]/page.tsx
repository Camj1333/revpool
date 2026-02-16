"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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

export default function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const role = (session?.user as Record<string, unknown> | undefined)?.role as string | undefined;

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [joining, setJoining] = useState(false);
  const [saleRevenue, setSaleRevenue] = useState("");
  const [saleDeals, setSaleDeals] = useState("1");
  const [loggingSale, setLoggingSale] = useState(false);
  const [saleSuccess, setSaleSuccess] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPrize, setEditPrize] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [saving, setSaving] = useState(false);

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

  // Check enrollment for reps
  useEffect(() => {
    if (role === "rep") {
      apiFetch<number[]>("/api/competitions/enrolled").then((ids) => {
        setEnrolled(ids.includes(Number(id)));
      });
    }
  }, [role, id]);

  const refreshData = async () => {
    const [comp, parts] = await Promise.all([
      apiFetch<Competition>(`/api/competitions/${id}`).catch(() => null),
      apiFetch<Participant[]>(`/api/competitions/${id}/participants`).catch(() => []),
    ]);
    if (comp) setCompetition(comp);
    setParticipants(parts);
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await fetch(`/api/competitions/${id}/join`, { method: "POST" });
      if (res.ok || res.status === 409) {
        setEnrolled(true);
        await refreshData();
      }
    } finally {
      setJoining(false);
    }
  };

  const handleLogSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingSale(true);
    try {
      const res = await fetch(`/api/competitions/${id}/log-sale`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revenue: Number(saleRevenue), deals: Number(saleDeals) }),
      });
      if (res.ok) {
        setSaleRevenue("");
        setSaleDeals("1");
        setSaleSuccess(true);
        setTimeout(() => setSaleSuccess(false), 2000);
        await refreshData();
      }
    } finally {
      setLoggingSale(false);
    }
  };

  const openEditForm = () => {
    if (!competition) return;
    setEditName(competition.name);
    setEditPrize(String(competition.prize));
    setEditStatus(competition.status);
    setEditStartDate(competition.startDate || "");
    setEditEndDate(competition.endDate || "");
    setEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/competitions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          prize: Number(editPrize),
          status: editStatus,
          startDate: editStartDate || null,
          endDate: editEndDate || null,
        }),
      });
      if (res.ok) {
        await refreshData();
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Link href="/competitions" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
          &larr; Back to Competitions
        </Link>
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (notFound || !competition) {
    return (
      <div className="space-y-4">
        <Link href="/competitions" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
          &larr; Back to Competitions
        </Link>
        <p className="text-gray-400">Competition not found.</p>
      </div>
    );
  }

  const kpis = [
    { label: "Total Revenue", value: formatCurrency(competition.revenue), change: 0, changeLabel: "vs last period" },
    { label: "Prize", value: formatCurrency(competition.prize), change: 0, changeLabel: "" },
    { label: "Participants", value: String(competition.participants), change: 0, changeLabel: "vs last comp" },
    { label: "Avg per Rep", value: formatCurrency(competition.participants > 0 ? Math.round(competition.revenue / competition.participants) : 0), change: 0, changeLabel: "vs last comp" },
  ];

  // Build revenue history from participant data
  const revenueHistory: ChartDataPoint[] = participants.length > 0
    ? participants.slice(0, 8).map((p) => ({ label: p.name.split(" ")[0], value: Number(p.revenue) }))
    : [];

  return (
    <div className="space-y-8">
      <Link
        href="/competitions"
        className="text-blue-600 hover:text-blue-500 text-sm inline-flex items-center gap-1 font-medium"
      >
        &larr; Back to Competitions
      </Link>

      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{competition.name}</h1>
        <StatusBadge status={competition.status} />
        {role === "manager" && (
          <button
            onClick={openEditForm}
            className="text-blue-600 hover:text-blue-700 transition text-sm font-semibold"
          >
            Edit
          </button>
        )}
        {role === "rep" && (
          enrolled ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
              Joined
            </span>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition rounded-lg px-4 py-1.5 text-sm font-semibold"
            >
              {joining ? "Joining..." : "Join Competition"}
            </button>
          )
        )}
      </div>

      <p className="text-gray-500 text-sm">
        {competition.startDate} &mdash; {competition.endDate || "TBD"}
      </p>

      {/* Edit Competition Form — managers only */}
      {role === "manager" && editing && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Edit Competition</h2>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Prize ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={editPrize}
                  onChange={(e) => setEditPrize(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-gray-500 hover:text-gray-700 transition text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Log Sale Form — enrolled reps only */}
      {role === "rep" && enrolled && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Log Sale</h2>
          <form onSubmit={handleLogSale} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Revenue ($)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={saleRevenue}
                onChange={(e) => setSaleRevenue(e.target.value)}
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
                value={saleDeals}
                onChange={(e) => setSaleDeals(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loggingSale}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition rounded-xl px-5 py-2.5 text-sm font-semibold"
            >
              {loggingSale ? "Logging..." : "Log Sale"}
            </button>
            {saleSuccess && (
              <span className="text-emerald-600 text-sm font-medium">Sale logged!</span>
            )}
          </form>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.label} kpi={kpi} accentColor={["border-l-blue-500", "border-l-emerald-500", "border-l-violet-500", "border-l-amber-500"][i % 4]} />
        ))}
      </div>

      {/* Two-column: Chart + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
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
