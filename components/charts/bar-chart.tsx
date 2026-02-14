"use client";

import { useState } from "react";
import { ChartDataPoint } from "@/lib/types";
import { formatCompact } from "@/lib/format";

interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
}

export function BarChart({ data, height = 300 }: BarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value));
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = 600;
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const barWidth = innerWidth / data.length;
  const gridLines = 5;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        width="100%"
        className="overflow-visible"
      >
        {/* Grid lines */}
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = padding.top + (innerHeight / gridLines) * i;
          const value = maxValue - (maxValue / gridLines) * i;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#e5e7eb"
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

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * innerHeight;
          const x = padding.left + i * barWidth + barWidth * 0.15;
          const y = padding.top + innerHeight - barHeight;
          const w = barWidth * 0.7;

          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <rect
                x={x}
                y={y}
                width={w}
                height={barHeight}
                rx={4}
                className={`transition-all duration-150 ${
                  hovered === i ? "fill-blue-400" : "fill-blue-600"
                }`}
              />
              {/* X label */}
              <text
                x={padding.left + i * barWidth + barWidth / 2}
                y={chartHeight - 10}
                textAnchor="middle"
                className="fill-gray-500 text-[11px]"
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Tooltip */}
        {hovered !== null && (
          <g>
            <rect
              x={padding.left + hovered * barWidth + barWidth / 2 - 40}
              y={
                padding.top +
                innerHeight -
                (data[hovered].value / maxValue) * innerHeight -
                32
              }
              width={80}
              height={24}
              rx={4}
              className="fill-gray-800"
            />
            <text
              x={padding.left + hovered * barWidth + barWidth / 2}
              y={
                padding.top +
                innerHeight -
                (data[hovered].value / maxValue) * innerHeight -
                16
              }
              textAnchor="middle"
              className="fill-white text-[12px] font-medium"
            >
              {formatCompact(data[hovered].value)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
