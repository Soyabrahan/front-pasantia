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
}

const chartConfig = {
  cantidad: {
    label: "Pases",
  },
};

function getBarColor(index: number, isTotal: boolean): string {
  if (isTotal) return "#8B1C23";
  return "#CC1414";
}

export function PasesByDestinoChart({ data, label }: PasesByDestinoChartProps) {
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
              <Cell key={entry.name} fill={getBarColor(index, entry.isTotal)} />
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
