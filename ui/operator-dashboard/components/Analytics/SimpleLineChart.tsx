/**
 * SimpleLineChart Component
 *
 * A simple line chart component using SVG.
 * Displays trends over time without external libraries.
 *
 * Features:
 * - Multiple data series
 * - Color-coded lines
 * - Responsive SVG
 * - Tooltip on hover
 *
 * Usage:
 *   <SimpleLineChart
 *     data={timelineData}
 *     height={300}
 *   />
 */

"use client";

import React, { useState } from "react";

export interface LineChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface LineChartSeries {
  name: string;
  data: LineChartDataPoint[];
  color: string;
}

interface SimpleLineChartProps {
  series: LineChartSeries[];
  height?: number;
  showLegend?: boolean;
}

export function SimpleLineChart({
  series,
  height = 300,
  showLegend = true,
}: SimpleLineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    seriesIndex: number;
    pointIndex: number;
  } | null>(null);

  if (series.length === 0 || series[0].data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-500"
        style={{ height: `${height}px` }}
      >
        No data available
      </div>
    );
  }

  // Get all unique dates across all series
  const allDates = Array.from(
    new Set(series.flatMap((s) => s.data.map((d) => d.date)))
  ).sort();

  // Find min/max values for scaling
  const allValues = series.flatMap((s) => s.data.map((d) => d.value));
  const minValue = Math.min(...allValues, 0);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue || 1;

  const padding = 40;
  const chartWidth = 800;
  const chartHeight = height - padding * 2;

  // Scale functions
  const xScale = (index: number) =>
    padding + (index / (allDates.length - 1 || 1)) * (chartWidth - padding * 2);
  const yScale = (value: number) =>
    padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;

  return (
    <div className="space-y-4">
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="w-full"
        style={{ maxHeight: `${height}px` }}
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const y = padding + (chartHeight * percent) / 100;
          return (
            <line
              key={percent}
              x1={padding}
              y1={y}
              x2={chartWidth - padding}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* X-axis */}
        <line
          x1={padding}
          y1={height - padding}
          x2={chartWidth - padding}
          y2={height - padding}
          stroke="#9ca3af"
          strokeWidth="2"
        />

        {/* Y-axis */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#9ca3af"
          strokeWidth="2"
        />

        {/* Draw lines for each series */}
        {series.map((serie, seriesIndex) => {
          const points = allDates
            .map((date, index) => {
              const dataPoint = serie.data.find((d) => d.date === date);
              if (!dataPoint) return null;
              return {
                x: xScale(index),
                y: yScale(dataPoint.value),
                value: dataPoint.value,
              };
            })
            .filter((p) => p !== null);

          const pathData = points
            .map((point, i) =>
              i === 0
                ? `M ${point!.x} ${point!.y}`
                : `L ${point!.x} ${point!.y}`
            )
            .join(" ");

          return (
            <g key={seriesIndex}>
              {/* Line */}
              <path
                d={pathData}
                fill="none"
                stroke={serie.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {points.map((point, pointIndex) => (
                <circle
                  key={pointIndex}
                  cx={point!.x}
                  cy={point!.y}
                  r={
                    hoveredPoint?.seriesIndex === seriesIndex &&
                    hoveredPoint?.pointIndex === pointIndex
                      ? 6
                      : 4
                  }
                  fill={serie.color}
                  onMouseEnter={() =>
                    setHoveredPoint({ seriesIndex, pointIndex })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer transition-all"
                />
              ))}
            </g>
          );
        })}

        {/* X-axis labels (show only some dates) */}
        {allDates
          .filter((_, i) => i % Math.ceil(allDates.length / 7) === 0)
          .map((date, i) => {
            const originalIndex = allDates.indexOf(date);
            return (
              <text
                key={i}
                x={xScale(originalIndex)}
                y={height - padding + 20}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </text>
            );
          })}

        {/* Y-axis labels */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const value = minValue + (valueRange * percent) / 100;
          const y = padding + chartHeight - (chartHeight * percent) / 100;
          return (
            <text
              key={percent}
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#6b7280"
            >
              {Math.round(value)}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 justify-center">
          {series.map((serie, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: serie.color }}
              />
              <span className="text-sm text-gray-700">{serie.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
