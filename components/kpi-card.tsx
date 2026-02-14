import { KPI } from "@/lib/types";

export function KPICard({ kpi }: { kpi: KPI }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <p className="text-gray-500 text-sm">{kpi.label}</p>
      <p className="text-2xl font-semibold tracking-tight mt-1">{kpi.value}</p>
      <p className="text-sm mt-2">
        <span className={kpi.change >= 0 ? "text-green-600" : "text-red-600"}>
          {kpi.change >= 0 ? "\u2191" : "\u2193"} {Math.abs(kpi.change)}%
        </span>
        <span className="text-gray-500 ml-1">{kpi.changeLabel}</span>
      </p>
    </div>
  );
}
