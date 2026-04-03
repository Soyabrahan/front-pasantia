import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText, Calendar as CalendarIcon, Truck } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalPases: number;
    pasesHoy: number;
    pasesSemana: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="overflow-hidden border-slate-200/50 shadow-sm hover:shadow-md transition-all group relative isolate">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-slate-500">Total Pases Emitidos</CardTitle>
          <div className="bg-primary/10 p-2 rounded-md group-hover:scale-110 transition-transform group-hover:bg-primary/20">
            <FileText className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{stats.totalPases}</div>
          <p className="text-xs text-muted-foreground mt-1">Registrados en el sistema</p>
        </CardContent>
        {/* Aesthetic gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Card>

      <Card className="overflow-hidden border-slate-200/50 shadow-sm hover:shadow-md transition-all group relative isolate">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-slate-500">Pases Hoy</CardTitle>
          <div className="bg-emerald-500/10 p-2 rounded-md group-hover:scale-110 transition-transform group-hover:bg-emerald-500/20">
            <CalendarIcon className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{stats.pasesHoy}</div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center">
            <CheckCircle2 className="h-3 w-3 mr-1 inline" />
            Movimientos del día
          </p>
        </CardContent>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Card>

      <Card className="overflow-hidden border-slate-200/50 shadow-sm hover:shadow-md transition-all group relative isolate">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-slate-500">Pases Esta Semana</CardTitle>
          <div className="bg-amber-500/10 p-2 rounded-md group-hover:scale-110 transition-transform group-hover:bg-amber-500/20">
            <CalendarIcon className="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{stats.pasesSemana}</div>
          <p className="text-xs text-muted-foreground mt-1">Últimos 7 días</p>
        </CardContent>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Card>

    </div>
  );
}
