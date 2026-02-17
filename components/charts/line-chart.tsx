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

  if (data.length === 0) return null;

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
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
          </filter>
          <linearGradient id="line-area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
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
            className={`text-[11px] font-medium transition-all duration-150 ${
              hovered === i ? "fill-gray-900" : "fill-gray-500"
            }`}
          >
            {d.label}
          </text>
        ))}

        {/* Area fill */}
        {points.length > 0 && (
          <polygon
            points={`${points[0].x},${padding.top + innerHeight} ${polylinePoints} ${points[points.length - 1].x},${padding.top + innerHeight}`}
            fill="url(#line-area-gradient)"
          />
        )}

        {/* Line */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Crosshair */}
        {hovered !== null && points[hovered] && (
          <line
            x1={points[hovered].x}
            y1={padding.top}
            x2={points[hovered].x}
            y2={padding.top + innerHeight}
            stroke="#3b82f6"
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.4}
          />
        )}

        {/* Data points + hover zones */}
        {points.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className="cursor-pointer"
          >
            <circle cx={p.x} cy={p.y} r={20} fill="transparent" />
            <circle
              cx={p.x}
              cy={p.y}
              r={hovered === i ? 6 : 3}
              className="transition-all duration-200"
              fill={hovered === i ? "#3b82f6" : "white"}
              stroke="#3b82f6"
              strokeWidth={2.5}
            />
            {hovered === i && (
              <circle
                cx={p.x}
                cy={p.y}
                r={12}
                fill="#3b82f6"
                opacity={0.1}
              />
            )}
          </g>
        ))}

        {/* Tooltip */}
        {hovered !== null && points[hovered] && (
          (() => {
            const px = points[hovered].x;
            const py = points[hovered].y;
            const label = data[hovered].label;
            const value = formatCompact(data[hovered].value);

            return (
              <g filter="url(#line-tooltip-shadow)">
                <rect
                  x={px - 48}
                  y={py - 44}
                  width={96}
                  height={32}
                  rx={8}
                  className="fill-gray-900"
                />
                <polygon
                  points={`${px - 5},${py - 12} ${px + 5},${py - 12} ${px},${py - 7}`}
                  className="fill-gray-900"
                />
                <text
                  x={px}
                  y={py - 30}
                  textAnchor="middle"
                  className="fill-gray-400 text-[10px]"
                >
                  {label}
                </text>
                <text
                  x={px}
                  y={py - 18}
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
