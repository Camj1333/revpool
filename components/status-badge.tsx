import { CompetitionStatus } from "@/lib/types";

const styles: Record<CompetitionStatus, string> = {
  active: "bg-green-400/10 text-green-400 border-green-400/20",
  completed: "bg-gray-400/10 text-gray-400 border-gray-400/20",
  upcoming: "bg-blue-400/10 text-blue-400 border-blue-400/20",
};

export function StatusBadge({ status }: { status: CompetitionStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
