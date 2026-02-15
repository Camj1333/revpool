"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/format";
import { apiFetch } from "@/lib/api";
import { Competition, CompetitionStatus, Column } from "@/lib/types";

const tabs: { label: string; value: CompetitionStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Upcoming", value: "upcoming" },
];

const columns: Column<Competition>[] = [
  { key: "name", label: "Competition" },
  { key: "leader", label: "Leader" },
  {
    key: "revenue",
    label: "Revenue",
    render: (v) => (
      <span className="text-emerald-600 font-mono">{formatCurrency(v as number)}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (v) => <StatusBadge status={v as CompetitionStatus} />,
  },
  { key: "participants", label: "Participants" },
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
];

export default function CompetitionsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<CompetitionStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Competition[]>("/api/competitions").then((data) => {
      setCompetitions(data);
      setLoading(false);
    });
  }, []);

  const filtered =
    filter === "all"
      ? competitions
      : competitions.filter((c) => c.status === filter);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/competitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        startDate: new Date().toISOString().split("T")[0],
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setCompetitions([...competitions, created]);
      setNewName("");
      setShowForm(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white transition rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm hover:shadow"
        >
          + New Competition
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-sm text-gray-500 block mb-1">Competition Name</label>
            <input
              type="text"
              placeholder="e.g. Q3 Revenue Sprint"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 h-10 text-sm w-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm"
          >
            Create
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-500 hover:text-gray-900 transition px-4 py-2.5 rounded-xl text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1.5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-sm transition ${
              filter === tab.value
                ? "bg-white text-gray-900 shadow-sm font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => router.push(`/competitions/${row.id}`)}
      />
    </div>
  );
}
