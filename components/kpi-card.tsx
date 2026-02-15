import { KPI } from "@/lib/types";

interface KPICardProps {
  kpi: KPI;
  accentColor?: string;
}

export function KPICard({ kpi, accentColor = "border-l-blue-500" }: KPICardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border-l-4 ${accentColor}`}>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{kpi.label}</p>
        <p className="text-3xl font-bold tracking-tight">{kpi.value}</p>
        <div className="text-sm">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              kpi.change >= 0
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {kpi.change >= 0 ? "\u2191" : "\u2193"} {Math.abs(kpi.change)}%
          </span>
          <span className="text-gray-500 ml-2">{kpi.changeLabel}</span>
        </div>
      </div>
    </div>
  );
}
