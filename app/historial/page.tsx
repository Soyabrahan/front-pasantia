"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search, Filter, Calendar as CalendarIcon, FileText, Pencil, History } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Mock Data
const MOCK_DATA = Array.from({ length: 25 }).map((_, i) => {
    const id = 86467 - i;
    return {
        id: id.toString(),
        fecha: new Date(2023, 10, 1 + i).toISOString().split("T")[0],
        hora: "08:30",
        solicitante: `Usuario ${i + 1}`,
        fichaSolicitante: `F-${1000 + i}`,
        equipo: i % 3 === 0 ? `Laptop Dell ${i}` : `Monitor HP ${i}`,
        serialEquipo: `SN-${5000 + i}`,
        fmoEquipo: `FMO-${20000 + i}`,
    };
});

export default function HistoryPage() {
    const [filters, setFilters] = useState({
        numeroPase: "",
        equipo: "", // Serial o FMO
        persona: "", // Serial o FMO (interpretado como ficha o nombre)
        fechaInicio: "",
        fechaFin: "",
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const filteredData = useMemo(() => {
        return MOCK_DATA.filter((item) => {
            const matchPase = filters.numeroPase
                ? item.id.includes(filters.numeroPase)
                : true;

            const matchEquipo = filters.equipo
                ? item.equipo.toLowerCase().includes(filters.equipo.toLowerCase()) ||
                item.serialEquipo.toLowerCase().includes(filters.equipo.toLowerCase()) ||
                item.fmoEquipo.toLowerCase().includes(filters.equipo.toLowerCase())
                : true;

            const matchPersona = filters.persona
                ? item.solicitante.toLowerCase().includes(filters.persona.toLowerCase()) ||
                item.fichaSolicitante.toLowerCase().includes(filters.persona.toLowerCase())
                : true;

            const matchFechaInicio = filters.fechaInicio
                ? item.fecha >= filters.fechaInicio
                : true;

            const matchFechaFin = filters.fechaFin
                ? item.fecha <= filters.fechaFin
                : true;

            return matchPase && matchEquipo && matchPersona && matchFechaInicio && matchFechaFin;
        });
    }, [filters]);

    const displayData = filteredData.slice(0, 10); // Show top 10 results

    return (
        <div className="min-h-screen bg-background">
            {/* Header / Letterhead */}
            <header className="bg-primary text-primary-foreground shadow-lg mb-8">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
                    <SidebarTrigger className="text-primary-foreground hover:bg-primary-foreground/10" />
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                            <History className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">HISTORIAL DE PASES</h1>
                            <p className="text-xs text-primary-foreground/70">Consulta de Registros FMO</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 space-y-6">

                {/* Filters */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filtros de Búsqueda
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="pase">Número de Pase</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="pase"
                                    placeholder="Ej: 86467"
                                    className="pl-8"
                                    value={filters.numeroPase}
                                    onChange={(e) => handleFilterChange("numeroPase", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="equipo">Equipo (Serial / FMO)</Label>
                            <Input
                                id="equipo"
                                placeholder="Ej: SN-5000 / FMO-20000"
                                value={filters.equipo}
                                onChange={(e) => handleFilterChange("equipo", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="persona">Solicitante (Nombre / Ficha)</Label>
                            <Input
                                id="persona"
                                placeholder="Ej: Juan Perez / F-1000"
                                value={filters.persona}
                                onChange={(e) => handleFilterChange("persona", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Rango de Fechas</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={filters.fechaInicio}
                                    onChange={(e) => handleFilterChange("fechaInicio", e.target.value)}
                                    className="text-xs"
                                />
                                <Input
                                    type="date"
                                    value={filters.fechaFin}
                                    onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
                                    className="text-xs"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">No. Pase</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Solicitante</TableHead>
                                    <TableHead>Equipo Principal</TableHead>
                                    <TableHead>Serial / FMO</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No se encontraron resultados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    displayData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.id}</TableCell>
                                            <TableCell>{item.fecha}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{item.solicitante}</span>
                                                    <span className="text-xs text-muted-foreground">{item.fichaSolicitante}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{item.equipo}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-xs">S/N: {item.serialEquipo}</span>
                                                    <span className="text-xs">FMO: {item.fmoEquipo}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <FileText className="h-4 w-4" />
                                                        <span className="sr-only">Ver Detalles</span>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">Editar</span>
                                                    </Button>
                                                </div>
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
