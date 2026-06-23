"use client";

import React, { useState, useEffect, useMemo } from "react";
import { LayoutDashboard, Calendar, Hash } from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardStatsSkeleton } from "@/components/dashboard/dashboard-stats-skeleton";
import { PasesByDestinoChart } from "@/components/dashboard/pases-by-destino-chart";
import { PasesPieChart } from "@/components/dashboard/pases-pie-chart";
import { api } from "@/lib/api-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTHS = [
  { value: "0", label: "Anual" },
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => String(currentYear - i));

interface ChartDataItem {
  name: string;
  cantidad: number;
  isTotal: boolean;
}

function getPasesByDestino(
  pases: any[],
  month: number,
  year: number
): ChartDataItem[] {
  const filtered = pases.filter((p) => {
    if (!p.fecha_emision) return false;
    const d = new Date(p.fecha_emision);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  const grouped: Record<string, number> = {};
  filtered.forEach((p) => {
    const name = p.destino?.nombre || "SIN DESTINO";
    grouped[name] = (grouped[name] || 0) + 1;
  });

  const items = Object.entries(grouped)
    .map(([name, cantidad]) => ({ name, cantidad, isTotal: false }))
    .sort((a, b) => b.cantidad - a.cantidad);

  const total = items.reduce((sum, item) => sum + item.cantidad, 0);
  if (items.length > 0) {
    items.push({ name: "TOTAL", cantidad: total, isTotal: true });
  }

  return items;
}

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function getPasesByMonth(pases: any[], year: number): ChartDataItem[] {
  const filtered = pases.filter((p) => {
    if (!p.fecha_emision) return false;
    const d = new Date(p.fecha_emision);
    return d.getFullYear() === year;
  });

  const byMonth = new Array(12).fill(0);
  filtered.forEach((p) => {
    const d = new Date(p.fecha_emision);
    byMonth[d.getMonth()]++;
  });

  const items = byMonth.map((count, i) => ({
    name: MONTH_LABELS[i],
    cantidad: count,
    isTotal: false,
  }));

  const total = byMonth.reduce((a, b) => a + b, 0);
  items.push({ name: "TOTAL", cantidad: total, isTotal: true });

  return items;
}

function getPasesByDestinoOverall(pases: any[]): ChartDataItem[] {
  const grouped: Record<string, number> = {};
  pases.forEach((p) => {
    if (!p.fecha_emision) return;
    const name = p.destino?.nombre || "SIN DESTINO";
    grouped[name] = (grouped[name] || 0) + 1;
  });

  const items = Object.entries(grouped)
    .map(([name, cantidad]) => ({ name, cantidad, isTotal: false }))
    .sort((a, b) => b.cantidad - a.cantidad);

  const total = items.reduce((sum, item) => sum + item.cantidad, 0);
  if (items.length > 0) {
    items.push({ name: "TOTAL", cantidad: total, isTotal: true });
  }

  return items;
}

function getOverallStats(pases: any[]) {
  const totalPases = pases.length;
  const today = new Date().toISOString().split("T")[0];
  const pasesHoy = pases.filter(
    (p) => p.fecha_emision && p.fecha_emision.startsWith(today)
  ).length;
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const pasesSemana = pases.filter(
    (p) => p.fecha_emision && new Date(p.fecha_emision) >= oneWeekAgo
  ).length;
  return { totalPases, pasesHoy, pasesSemana };
}

export default function DashboardPage() {
  const [pases, setPases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("0");
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  const isAnnual = selectedMonth === "0";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<any[]>("/pases");
        setPases(data || []);
      } catch (e) {
        console.error("Error fetching pases for dashboard", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = useMemo(() => {
    const year = Number(selectedYear);
    if (!year) return [];
    if (isAnnual) {
      return getPasesByMonth(pases, year);
    }
    return getPasesByDestino(pases, Number(selectedMonth), year);
  }, [pases, selectedMonth, selectedYear, isAnnual]);

  const overallDestinoData = useMemo(() => getPasesByDestinoOverall(pases), [pases]);

  const overallDestinoPieData = useMemo(
    () => overallDestinoData.filter((d) => !d.isTotal),
    [overallDestinoData]
  );

  const monthlyDestinoPieData = useMemo(
    () => (isAnnual ? [] : chartData.filter((d) => !d.isTotal)),
    [chartData, isAnnual]
  );

  const stats = useMemo(() => getOverallStats(pases), [pases]);

  const selectedMonthLabel = isAnnual
    ? "Anual"
    : MONTHS.find((m) => m.value === selectedMonth)?.label || "";

  const chartLabel = isAnnual
    ? `Métrica de pases por mes - AÑO ${selectedYear}`
    : `Pases por destino - ${selectedMonthLabel} ${selectedYear}`;

  return (
    <div className="min-h-screen bg-background pb-10">
      <Header
        title="PANEL DE CONTROL"
        subtitle="Estadísticas y gráficos del sistema de pases"
        icon={<LayoutDashboard className="h-6 w-6" />}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 -mt-4 pt-8">
        {loading ? (
          <DashboardStatsSkeleton />
        ) : (
          <DashboardStats stats={stats} />
        )}

        <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both border-border/40 bg-card shadow-sm">
          <CardHeader className="pb-3 border-b border-border/20 bg-muted/30 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-black flex items-center gap-2 text-foreground uppercase tracking-tight">
              Métrica de Pases
            </CardTitle>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[140px] h-9 text-sm">
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[110px] h-9 text-sm">
                    <SelectValue placeholder="Año" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <PasesByDestinoChart
                data={chartData}
                label={chartLabel}
                variant={isAnnual ? "month" : "destino"}
              />
            )}
          </CardContent>
        </Card>

        {!loading && isAnnual && (
          <>
            <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both border-border/40 bg-card shadow-sm">
              <CardHeader className="pb-3 border-b border-border/20 bg-muted/30">
                <CardTitle className="text-lg font-black flex items-center gap-2 text-foreground uppercase tracking-tight">
                  Total de Pases por Destino
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <PasesByDestinoChart
                  data={overallDestinoData}
                  label={`Total de pases por destino - AÑO ${selectedYear}`}
                  variant="destino"
                />
              </CardContent>
            </Card>

            <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both border-border/40 bg-card shadow-sm">
              <CardHeader className="pb-3 border-b border-border/20 bg-muted/30">
                <CardTitle className="text-lg font-black flex items-center gap-2 text-foreground uppercase tracking-tight">
                  Distribución de Pases por Destino
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <PasesPieChart
                  data={overallDestinoPieData}
                  label={`Distribución de pases por destino - AÑO ${selectedYear}`}
                />
              </CardContent>
            </Card>
          </>
        )}

        {!loading && !isAnnual && (
          <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both border-border/40 bg-card shadow-sm">
            <CardHeader className="pb-3 border-b border-border/20 bg-muted/30">
              <CardTitle className="text-lg font-black flex items-center gap-2 text-foreground uppercase tracking-tight">
                Distribución de Pases por Destino
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <PasesPieChart
                data={monthlyDestinoPieData}
                label={`Distribución de pases por destino - ${selectedMonthLabel} ${selectedYear}`}
              />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
