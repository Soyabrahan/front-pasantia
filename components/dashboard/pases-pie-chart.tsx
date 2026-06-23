"use client";

import React from "react";
import { Pie, PieChart, Cell, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartDataItem {
  name: string;
  cantidad: number;
}

interface PasesPieChartProps {
  data: ChartDataItem[];
  label: string;
}

const PIE_COLORS = [
  "#2563EB", "#7C3AED", "#059669", "#D97706",
  "#DC2626", "#0891B2", "#DB2777", "#65A30D",
  "#EA580C", "#4F46E5", "#0D9488", "#CA8A04",
  "#6366F1", "#EC4899", "#14B8A6", "#F97316",
  "#84CC16", "#06B6D4", "#A855F7", "#EF4444",
  "#22C55E", "#EAB308",
];

function renderLegend(props: Record<string, unknown>) {
  const { payload } = props as { payload: Array<{ color: string; value: string }> };
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mt-2">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function PasesPieChart({ data, label }: PasesPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm">
        No hay datos para el período seleccionado.
      </div>
    );
  }

  return (
    <div className="w-full">
      <ChartContainer config={{}} className="min-h-[350px] w-full">
        <PieChart margin={{ top: 10, right: 16, left: 0, bottom: 60 }}>
          <Pie
            data={data}
            dataKey="cantidad"
            nameKey="name"
            cx="50%"
            cy="45%"
            outerRadius={120}
            innerRadius={50}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value: unknown) => {
                  const num = Number(value);
                  return (
                    <span className="font-mono font-bold tabular-nums">
                      {num} pase{num !== 1 ? "s" : ""}
                    </span>
                  );
                }}
              />
            }
          />
          <Legend content={renderLegend} />
        </PieChart>
      </ChartContainer>
      <p className="text-center text-xs text-muted-foreground mt-2">
        {label}
      </p>
    </div>
  );
}
