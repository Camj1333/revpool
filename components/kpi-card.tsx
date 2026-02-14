import { KPI } from "@/lib/types";

export function KPICard({ kpi }: { kpi: KPI }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-gray-400 text-sm">{kpi.label}</p>
      <p className="text-2xl font-semibold tracking-tight mt-1">{kpi.value}</p>
      <p className="text-sm mt-2">
        <span className={kpi.change >= 0 ? "text-green-400" : "text-red-400"}>
          {kpi.change >= 0 ? "\u2191" : "\u2193"} {Math.abs(kpi.change)}%
        </span>
        <span className="text-gray-500 ml-1">{kpi.changeLabel}</span>
      </p>
    </div>
  );
}
