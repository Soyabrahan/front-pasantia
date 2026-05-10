"use client";

import React, { useState, useEffect, Suspense } from "react";
import { History } from "lucide-react";
import { Header } from "@/components/header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardStatsSkeleton } from "@/components/dashboard/dashboard-stats-skeleton";
import { HistoryTable } from "@/components/history/history-table";
import { api } from "@/lib/api-client";

function StatsLoader() {
    const [stats, setStats] = useState({
        totalPases: 0,
        pasesHoy: 0,
        pasesSemana: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.get<any[]>("/pases");
                if (data && Array.isArray(data)) {
                    const newStats = {
                        totalPases: data.length || 0,
                        pasesHoy: 0,
                        pasesSemana: 0,
                    };
                    
                    const today = new Date().toISOString().split('T')[0];
                    newStats.pasesHoy = data.filter((d: any) => d.fecha_emision && d.fecha_emision.startsWith(today)).length;
                    
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    newStats.pasesSemana = data.filter((d: any) => d.fecha_emision && new Date(d.fecha_emision) >= oneWeekAgo).length;
                    
                    setStats(newStats);
                }
            } catch (e) {
                console.error("Failed to fetch stats", e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <DashboardStatsSkeleton />;
    return <DashboardStats stats={stats} />;
}

export default function HistoryPage() {
    return (
        <div className="min-h-screen bg-background pb-10">
            <Header 
                title="HISTORIAL DE PASES"
                subtitle="Consulta de Registros y Estadísticas FMO"
                icon={<History className="h-6 w-6" />}
            />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 -mt-4 pt-8">
                {/* Stats Section */}
                <StatsLoader />

                {/* Client-side Interactive Table */}
                <HistoryTable />
            </main>
        </div>
    );
}

