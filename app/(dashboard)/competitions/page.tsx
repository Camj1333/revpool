"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { SkeletonTable } from "@/components/skeleton";
import { useToast } from "@/components/toast";
import { Modal } from "@/components/modal";
import { formatCurrency } from "@/lib/format";
import { apiFetch } from "@/lib/api";
import { Competition, CompetitionStatus, Column } from "@/lib/types";

const tabs: { label: string; value: CompetitionStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Upcoming", value: "upcoming" },
];

const baseColumns: Column<Competition>[] = [
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
    key: "prize",
    label: "Prize",
    render: (v) => (
      <span className="text-blue-600 font-mono">{formatCurrency(v as number)}</span>
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
  const { data: session } = useSession();
  const role = (session?.user as Record<string, unknown> | undefined)?.role as string | undefined;

  const { toast } = useToast();
  const [filter, setFilter] = useState<CompetitionStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrize, setNewPrize] = useState("");
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [newEndDate, setNewEndDate] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Competition[]>("/api/competitions").then((data) => {
      setCompetitions(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (role === "rep") {
      apiFetch<number[]>("/api/competitions/enrolled").then((ids) => {
        setEnrolledIds(new Set(ids));
      });
    }
  }, [role]);

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
        prize: newPrize ? Number(newPrize) : 0,
        startDate: newStartDate || null,
        endDate: newEndDate || null,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setCompetitions([...competitions, created]);
      setNewName("");
      setNewPrize("");
      setNewStartDate(new Date().toISOString().split("T")[0]);
      setNewEndDate("");
      setShowForm(false);
      toast("Competition created!");
    }
  };

  const handleJoin = async (competitionId: string) => {
    setJoiningId(competitionId);
    try {
      const res = await fetch(`/api/competitions/${competitionId}/join`, {
        method: "POST",
      });
      if (res.ok || res.status === 409) {
        setEnrolledIds((prev) => new Set([...prev, Number(competitionId)]));
      }
    } finally {
      setJoiningId(null);
    }
  };

  const handleDelete = async (competitionId: string) => {
    if (!confirm("Are you sure you want to delete this competition?")) return;
    setDeletingId(competitionId);
    try {
      const res = await fetch(`/api/competitions/${competitionId}`, { method: "DELETE" });
      if (res.ok) {
        setCompetitions((prev) => prev.filter((c) => String(c.id) !== competitionId));
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Add action column based on role
  const columns: Column<Competition>[] = (() => {
    if (role === "rep") {
      return [
        ...baseColumns,
        {
          key: "id" as keyof Competition & string,
          label: "",
          sortable: false,
          render: (v: unknown) => {
            const compId = String(v);
            if (enrolledIds.has(Number(compId))) {
              return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  Joined
                </span>
              );
            }
            return (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoin(compId);
                }}
                disabled={joiningId === compId}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition rounded-lg px-3 py-1.5 text-xs font-semibold"
              >
                {joiningId === compId ? "Joining..." : "Join"}
              </button>
            );
          },
        },
      ];
    }
    if (role === "manager") {
      return [
        ...baseColumns,
        {
          key: "id" as keyof Competition & string,
          label: "",
          sortable: false,
          render: (v: unknown) => {
            const compId = String(v);
            return (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(compId);
                }}
                disabled={deletingId === compId}
                className="text-red-500 hover:text-red-700 disabled:opacity-50 transition text-xs font-medium"
              >
                {deletingId === compId ? "Deleting..." : "Delete"}
              </button>
            );
          },
        },
      ];
    }
    return baseColumns;
  })();

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
        <SkeletonTable rows={5} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
        {role === "manager" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white transition rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm hover:shadow"
          >
            + New Competition
          </button>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Competition">
        <div className="space-y-4">
          <div>
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
          <div>
            <label className="text-sm text-gray-500 block mb-1">Prize ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={newPrize}
              onChange={(e) => setNewPrize(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 h-10 text-sm w-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 block mb-1">Start Date</label>
              <input
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 h-10 text-sm w-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">End Date</label>
              <input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 h-10 text-sm w-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
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
        </div>
      </Modal>

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
        searchable
        searchKey="name"
        pageSize={10}
      />
    </div>
  );
}
