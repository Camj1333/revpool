import { CompetitionStatus } from "@/lib/types";

const styles: Record<CompetitionStatus, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
  upcoming: "bg-blue-50 text-blue-700 border-blue-200",
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
