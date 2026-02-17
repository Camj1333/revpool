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

  if (data.length === 0) return null;

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
        <defs>
          <filter id="tooltip-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
          </filter>
          <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="bar-gradient-hover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

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

        {/* Hover highlight column */}
        {hovered !== null && (
          <rect
            x={padding.left + hovered * barWidth}
            y={padding.top}
            width={barWidth}
            height={innerHeight}
            fill="#f8fafc"
            rx={4}
          />
        )}

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = maxValue > 0 ? (d.value / maxValue) * innerHeight : 0;
          const x = padding.left + i * barWidth + barWidth * 0.15;
          const y = padding.top + innerHeight - barHeight;
          const w = barWidth * 0.7;

          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              {/* Invisible hit area */}
              <rect
                x={padding.left + i * barWidth}
                y={padding.top}
                width={barWidth}
                height={innerHeight + padding.bottom}
                fill="transparent"
              />
              <rect
                x={x}
                y={y}
                width={w}
                height={barHeight}
                rx={6}
                fill={hovered === i ? "url(#bar-gradient-hover)" : "url(#bar-gradient)"}
                className="transition-all duration-200"
                style={{
                  transform: hovered === i ? "scaleY(1.02)" : "scaleY(1)",
                  transformOrigin: `${x + w / 2}px ${padding.top + innerHeight}px`,
                }}
              />
              {/* X label */}
              <text
                x={padding.left + i * barWidth + barWidth / 2}
                y={chartHeight - 10}
                textAnchor="middle"
                className={`text-[11px] font-medium transition-all duration-150 ${
                  hovered === i ? "fill-gray-900" : "fill-gray-500"
                }`}
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Tooltip */}
        {hovered !== null && data[hovered] && (
          (() => {
            const barHeight = maxValue > 0 ? (data[hovered].value / maxValue) * innerHeight : 0;
            const tooltipX = padding.left + hovered * barWidth + barWidth / 2;
            const tooltipY = padding.top + innerHeight - barHeight - 38;
            const label = data[hovered].label;
            const value = formatCompact(data[hovered].value);

            return (
              <g filter="url(#tooltip-shadow)">
                <rect
                  x={tooltipX - 48}
                  y={tooltipY}
                  width={96}
                  height={32}
                  rx={8}
                  className="fill-gray-900"
                />
                {/* Arrow */}
                <polygon
                  points={`${tooltipX - 5},${tooltipY + 32} ${tooltipX + 5},${tooltipY + 32} ${tooltipX},${tooltipY + 37}`}
                  className="fill-gray-900"
                />
                <text
                  x={tooltipX}
                  y={tooltipY + 14}
                  textAnchor="middle"
                  className="fill-gray-400 text-[10px]"
                >
                  {label}
                </text>
                <text
                  x={tooltipX}
                  y={tooltipY + 26}
                  textAnchor="middle"
                  className="fill-white text-[12px] font-semibold"
                >
                  {value}
                </text>
              </g>
            );
          })()
        )}
      </svg>
    </div>
  );
}
