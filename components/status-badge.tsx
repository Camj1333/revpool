import { CompetitionStatus } from "@/lib/types";

const styles: Record<CompetitionStatus, { bg: string; dot: string }> = {
  active: { bg: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  completed: { bg: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
  upcoming: { bg: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
};

export function StatusBadge({ status }: { status: CompetitionStatus }) {
  const style = styles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${style.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}${status === "active" ? " animate-pulse" : ""}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
