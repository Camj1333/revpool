import { KPI } from "@/lib/types";

interface KPICardProps {
  kpi: KPI;
  accentColor?: string;
  delay?: number;
  sparklineData?: number[];
}

export function KPICard({ kpi, accentColor = "border-l-blue-500", delay = 0, sparklineData }: KPICardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border-l-4 ${accentColor} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{kpi.label}</p>
        <div className="flex items-end justify-between gap-2">
          <p className="text-3xl font-bold tracking-tight">{kpi.value}</p>
          {sparklineData && sparklineData.length > 1 && <MiniSparkline data={sparklineData} />}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold ${
              kpi.change >= 0
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            <span className="text-base leading-none">{kpi.change >= 0 ? "\u2191" : "\u2193"}</span>
            {Math.abs(kpi.change)}%
          </span>
          <span className="text-gray-400 text-xs">{kpi.changeLabel}</span>
        </div>
      </div>
    </div>
  );
}

function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 64;
  const h = 24;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");

  const trend = data[data.length - 1] >= data[0];

  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={trend ? "#10b981" : "#ef4444"}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
