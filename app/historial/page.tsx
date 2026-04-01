import React, { Suspense } from "react";
import { History } from "lucide-react";
import { Header } from "@/components/header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardStatsSkeleton } from "@/components/dashboard/dashboard-stats-skeleton";
import { HistoryTable } from "@/components/history/history-table";
import { cookies } from "next/headers";

async function StatsLoader() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    let stats = {
        totalPases: 0,
        pasesHoy: 0,
        pasesSemana: 0,
        destinosActivos: 0,
    };

    if (token) {
        const API_URL =
            process.env.NEXT_PUBLIC_API_URL_REMOTE ||
            process.env.NEXT_PUBLIC_API_URL_LOCAL ||
            "http://localhost:3001";

        try {
            const res = await fetch(`${API_URL}/pases`, {
                headers: { Authorization: `Bearer ${token}` },
                // Add a revalidation time to cache the data on the server
                next: { revalidate: 30 } 
            });

            if (res.ok) {
                const data = await res.json();
                stats.totalPases = data.length || 0;
                
                const today = new Date().toISOString().split('T')[0];
                stats.pasesHoy = data.filter((d: any) => d.fecha_emision && d.fecha_emision.startsWith(today)).length;
                
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                stats.pasesSemana = data.filter((d: any) => d.fecha_emision && new Date(d.fecha_emision) >= oneWeekAgo).length;
                
                const destinos = new Set(data.map((d: any) => d.destino?.id).filter(Boolean));
                stats.destinosActivos = destinos.size;
            }
        } catch (e) {
            console.error("Failed to fetch stats", e);
            // Ignore failure, use default stats
        }
    }

    return <DashboardStats stats={stats} />;
}

export default function HistoryPage() {
    return (
        <div className="min-h-screen bg-slate-50/50 pb-10">
            <Header 
                title="HISTORIAL DE PASES"
                subtitle="Consulta de Registros y Estadísticas FMO"
                icon={<History className="h-6 w-6" />}
            />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 -mt-4 pt-8">
                {/* Stats Section wrapped in Suspense for optimized loading skeleton */}
                <Suspense fallback={<DashboardStatsSkeleton />}>
                    <StatsLoader />
                </Suspense>

                {/* Client-side Interactive Table */}
                <HistoryTable />
            </main>
        </div>
    );
}
