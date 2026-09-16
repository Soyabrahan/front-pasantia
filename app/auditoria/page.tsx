"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    ShieldCheck, Calendar as CalendarIcon, User, Search, Clock,
    ChevronLeft, ChevronRight, HelpCircle
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { decodeToken, getToken, getTokenRole, isNetworkError, isTokenExpired } from "@/lib/auth-utils";
import { AuditChat } from "@/components/auditoria/audit-chat";

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

interface PaginatedResponse {
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface DiffEntry {
    label: string;
    oldValue: string;
    newValue: string;
}

const ITEMS_PER_PAGE = 10;

function parseDiff(accion: string): DiffEntry[] | null {
    const match = accion.match(/— Cambios: (.+)/);
    if (!match) return null;
    const changes = match[1].split('; ');
    return changes.map(c => {
        const sep = c.indexOf('→');
        if (sep === -1) return { label: c.trim(), oldValue: '', newValue: '' };
        const labelEnd = c.indexOf(':');
        const label = labelEnd > 0 ? c.substring(0, labelEnd).trim() : '';
        const afterLabel = c.substring(labelEnd + 1).trim();
        const bar = afterLabel.indexOf('→');
        if (bar === -1) return { label, oldValue: afterLabel.trim(), newValue: '' };
        const oldValue = afterLabel.substring(0, bar).trim().replace(/^'|'$/g, '');
        const newValue = afterLabel.substring(bar + 1).trim().replace(/^'|'$/g, '');
        return { label, oldValue, newValue };
    });
}

export default function AuditoriaPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [diffModal, setDiffModal] = useState<{ accion: string; diff: DiffEntry[] } | null>(null);

    const fetchLogs = useCallback(async (pageNum: number) => {
        setLoading(true);
        try {
            const data = await api.get<PaginatedResponse>("/auditoria", {
                page: pageNum.toString(),
                limit: ITEMS_PER_PAGE.toString(),
            });
            setLogs(data.data);
            setTotalPages(data.totalPages);
            setTotal(data.total);
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
    }, [router]);

    useEffect(() => {
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

        fetchLogs(page);
    }, [page, router, fetchLogs]);

    const goToPage = (p: number) => {
        if (p < 1 || p > totalPages) return;
        setPage(p);
    };

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
                            <span className="text-sm font-normal text-muted-foreground lowercase ml-auto">
                                {total} registro{total !== 1 ? 's' : ''}
                            </span>
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
                                    logs.map((log) => {
                                        const diff = log.accion.includes('editado') ? parseDiff(log.accion) : null;
                                        return (
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
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                        log.accion.includes('Eliminación') ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                        log.accion.includes('Creación') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        log.accion.includes('Actualización') || log.accion.includes('editado') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                                    }`}>
                                                        {log.accion}
                                                    </span>
                                                    {diff && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                                            onClick={() => setDiffModal({ accion: log.accion, diff })}
                                                            title="Ver cambios"
                                                        >
                                                            <HelpCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-left text-xs font-mono text-muted-foreground">
                                                <span className="font-bold mr-2">{log.metodo}</span> 
                                                {log.ruta}
                                            </TableCell>
                                        </TableRow>
                                    )})
                                )}
                            </TableBody>
                        </Table>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 py-4 border-t border-border/20">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page <= 1}
                                    onClick={() => goToPage(page - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                                    .map((p, idx, arr) => (
                                        <React.Fragment key={p}>
                                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                                                <span className="text-muted-foreground px-1">...</span>
                                            )}
                                            <Button
                                                variant={p === page ? "default" : "outline"}
                                                size="sm"
                                                className="min-w-[36px]"
                                                onClick={() => goToPage(p)}
                                            >
                                                {p}
                                            </Button>
                                        </React.Fragment>
                                    ))}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page >= totalPages}
                                    onClick={() => goToPage(page + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Modal de Cambios */}
            <Dialog open={!!diffModal} onOpenChange={(open) => { if (!open) setDiffModal(null); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Cambios</DialogTitle>
                        <DialogDescription>
                            Atributos modificados en este pase
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {diffModal?.diff.map((item, i) => (
                            <div key={i} className="border border-border rounded-lg overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 font-bold text-sm uppercase tracking-wide text-foreground border-b border-border">
                                    {item.label}
                                </div>
                                <div className="grid grid-cols-2 divide-x divide-border">
                                    <div className="p-3 space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Antes</span>
                                        <p className="text-sm text-muted-foreground break-words">{item.oldValue || '(vacío)'}</p>
                                    </div>
                                    <div className="p-3 space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Después</span>
                                        <p className="text-sm text-foreground font-medium break-words">{item.newValue || '(vacío)'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Chat Inteligente de Auditoría */}
            <AuditChat />
        </div>
    );
}