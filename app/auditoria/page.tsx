"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Calendar as CalendarIcon, User, Search, Clock } from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { decodeToken, getToken, getTokenRole, isNetworkError, isTokenExpired } from "@/lib/auth-utils";

interface AuditLog {
    id: string;
    usuarioId: string | null;
    usuarioNombre: string | null;
    usuarioFicha: string | null;
    accion: string;
    metodo: string;
    ruta: string;
    fechaHora: string;
}

export default function AuditoriaPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar token y rol
        const token = getToken();
        if (!token) {
            router.push("/login");
            return;
        }

        const payload = decodeToken(token);
        if (!payload || isTokenExpired(payload)) {
            localStorage.removeItem("auth_token");
            router.push("/login");
            return;
        }

        const userRole = getTokenRole(payload);
        if (userRole !== "admin" && userRole !== "administrador") {
            toast.error("No tienes permisos para ver esta página.");
            router.push("/");
            return;
        }

        // Fetch logs
        const fetchLogs = async () => {
            try {
                const data = await api.get<AuditLog[]>("/auditoria");
                setLogs(data);
            } catch (e) {
                console.error("Error fetching audit logs", e);
                if (isNetworkError(e)) {
                    toast.error("No hay conexión con el servidor. Redirigiendo al login...");
                    localStorage.removeItem("auth_token");
                    router.push("/login");
                    return;
                }
                toast.error("Error al cargar los registros de auditoría");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [router]);

    return (
        <div className="min-h-screen bg-background pb-10">
            <Header 
                title="AUDITORÍA DEL SISTEMA"
                subtitle="Registro inmutable de actividades y modificaciones"
                icon={<ShieldCheck className="h-6 w-6" />}
            />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 -mt-4 pt-8">
                <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both border-border/40 bg-card shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b border-border/20 bg-muted/30">
                        <CardTitle className="text-lg font-black flex items-center gap-2 text-foreground uppercase tracking-tight">
                            <Clock className="h-4 w-4 text-primary" />
                            Últimas Acciones Registradas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/30 border-b border-border/50">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="font-black text-foreground text-left uppercase text-xs tracking-wider">FECHA / HORA</TableHead>
                                    <TableHead className="font-black text-foreground text-left uppercase text-xs tracking-wider">USUARIO</TableHead>
                                    <TableHead className="font-black text-foreground text-left uppercase text-xs tracking-wider">ACCIÓN</TableHead>
                                    <TableHead className="font-black text-foreground text-left uppercase text-xs tracking-wider">RUTA TÉCNICA</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                                <span>Cargando registros...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                            No se encontraron registros de auditoría.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-muted/20 transition-colors group cursor-default border-border/20">
                                            <TableCell className="font-medium text-foreground text-left">
                                                {new Date(log.fechaHora).toLocaleString("es-ES")}
                                            </TableCell>
                                            <TableCell className="text-left">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground">
                                                        {log.usuarioNombre || "Desconocido"}
                                                    </span>
                                                    {log.usuarioFicha && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Ficha: {log.usuarioFicha}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-left">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    log.accion.includes('Eliminación') ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                    log.accion.includes('Creación') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    log.accion.includes('Actualización') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                                }`}>
                                                    {log.accion}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-left text-xs font-mono text-muted-foreground">
                                                <span className="font-bold mr-2">{log.metodo}</span> 
                                                {log.ruta}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
