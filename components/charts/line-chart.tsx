"use client";

import { useState } from "react";
import { ChartDataPoint } from "@/lib/types";
import { formatCompact } from "@/lib/format";

interface LineChartProps {
  data: ChartDataPoint[];
  height?: number;
}

export function LineChart({ data, height = 300 }: LineChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value)) * 1.1;
  const minValue = 0;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = 600;
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const gridLines = 5;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * innerWidth,
    y:
      padding.top +
      innerHeight -
      ((d.value - minValue) / (maxValue - minValue)) * innerHeight,
  }));

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        width="100%"
        className="overflow-visible"
      >
        <defs>
          <filter id="line-tooltip-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* Grid lines */}
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = padding.top + (innerHeight / gridLines) * i;
          const value = maxValue - ((maxValue - minValue) / gridLines) * i;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#f3f4f6"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-gray-400 text-[11px]"
              >
                {formatCompact(value)}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={padding.left + (i / (data.length - 1)) * innerWidth}
            y={chartHeight - 10}
            textAnchor="middle"
            className="fill-gray-500 text-[11px] font-medium"
          >
            {d.label}
          </text>
        ))}

        {/* Line */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points + hover zones */}
        {points.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
            <circle
              cx={p.x}
              cy={p.y}
              r={hovered === i ? 5 : 3}
              className="transition-all duration-150"
              fill={hovered === i ? "#3b82f6" : "white"}
              stroke="#3b82f6"
              strokeWidth={2.5}
            />
          </g>
        ))}

        {/* Tooltip */}
        {hovered !== null && (
          <g filter="url(#line-tooltip-shadow)">
            <rect
              x={points[hovered].x - 40}
              y={points[hovered].y - 32}
              width={80}
              height={24}
              rx={4}
              className="fill-white"
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <text
              x={points[hovered].x}
              y={points[hovered].y - 16}
              textAnchor="middle"
              className="fill-gray-900 text-[12px] font-semibold"
            >
              {formatCompact(data[hovered].value)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
