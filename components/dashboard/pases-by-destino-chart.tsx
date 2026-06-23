"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartDataItem {
  name: string;
  cantidad: number;
  isTotal: boolean;
}

interface PasesByDestinoChartProps {
  data: ChartDataItem[];
  label: string;
  variant?: "month" | "destino";
}

const chartConfig = {
  cantidad: {
    label: "Pases",
  },
};

const VINOTINTO = "#8B1C23";

const MONTH_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#059669",
  "#D97706",
  "#DC2626",
  "#0891B2",
  "#DB2777",
  "#65A30D",
  "#EA580C",
  "#4F46E5",
  "#0D9488",
  "#CA8A04",
];

const DESTINO_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#059669",
  "#D97706",
  "#DC2626",
  "#0891B2",
  "#DB2777",
  "#65A30D",
  "#EA580C",
  "#4F46E5",
  "#0D9488",
  "#CA8A04",
  "#6366F1",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#84CC16",
  "#06B6D4",
  "#A855F7",
  "#EF4444",
  "#22C55E",
  "#EAB308",
];

function getBarColor(index: number, isTotal: boolean, variant: "month" | "destino"): string {
  if (isTotal) return VINOTINTO;
  if (variant === "month") {
    return MONTH_COLORS[index % MONTH_COLORS.length];
  }
  return DESTINO_COLORS[index % DESTINO_COLORS.length];
}

export function PasesByDestinoChart({ data, label, variant = "destino" }: PasesByDestinoChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm">
        No hay datos para el período seleccionado.
      </div>
    );
  }

  return (
    <div className="w-full">
      <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
        <BarChart
          data={data}
          margin={{ top: 10, right: 16, left: 0, bottom: 60 }}
          barCategoryGap="20%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--border))"
          />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          />
          <ChartTooltip
            cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
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
          <Bar
            dataKey="cantidad"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={getBarColor(index, entry.isTotal, variant)} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
      <p className="text-center text-xs text-muted-foreground mt-2">
        {label}
      </p>
    </div>
  );
}
