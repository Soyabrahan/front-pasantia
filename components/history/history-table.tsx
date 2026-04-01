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
import { Search, Filter, Calendar as CalendarIcon, FileText } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

interface PaseRecord {
    id: string;
    numeroPase: string;
    fecha_emision: string;
    solicitador?: { nombre: string, ficha: string };
    conductor?: { nombre: string, ficha: string };
    vehiculo?: { placa: string, modelo: string };
    equiposPases?: any[];
}

export function HistoryTable() {
    const [data, setData] = useState<PaseRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        numeroPase: "",
        equipo: "",
        persona: "",
        fechaInicio: "",
        fechaFin: "",
    });

    React.useEffect(() => {
        const fetchPases = async () => {
            try {
                const pases = await api.get<any[]>("/pases");
                setData(pases);
            } catch (error) {
                console.error("Error loading pases:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPases();
    }, []);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchPase = filters.numeroPase
                ? item.numeroPase.includes(filters.numeroPase)
                : true;

            const matchPersona = filters.persona
                ? item.solicitador?.nombre.toLowerCase().includes(filters.persona.toLowerCase()) ||
                  item.solicitador?.ficha.toLowerCase().includes(filters.persona.toLowerCase())
                : true;

            const matchFechaInicio = filters.fechaInicio
                ? item.fecha_emision >= filters.fechaInicio
                : true;

            const matchFechaFin = filters.fechaFin
                ? item.fecha_emision <= filters.fechaFin
                : true;

            return matchPase && matchPersona && matchFechaInicio && matchFechaFin;
        });
    }, [data, filters]);

    const handleDownloadPDF = async (id: string) => {
        try {
            const pase = await api.get<any>(`/pases/${id}`);
            
            if (!pase) {
                toast.error("No se encontró la información del pase");
                return;
            }

            const pdfData = {
                numeroPase: pase.numeroPase,
                concepto: {
                    donacion: pase.concepto === "DONACION",
                    devolucion: pase.concepto === "DEVOLUCION",
                    prestamo: pase.concepto === "PRESTAMO",
                    reparacion: pase.concepto === "REPARACION",
                    revision: pase.concepto === "REVISION",
                    vendido: pase.concepto === "VENDIDO",
                    foraneo: pase.concepto === "FORANEO",
                },
                embarqueseA: pase.destino?.nombre || "",
                ordenCompra: pase.numero_compra || "",
                direccion: pase.destino?.direccion || "",
                telefono: pase.destino?.telefono || "",
                contado: pase.tipo_pago === "CONTADO",
                credito: pase.tipo_pago === "CREDITO",
                conductor: pase.conductor?.nombre || "",
                fichaConductor: pase.conductor?.ficha || "",
                vehiculoFmo: pase.vehiculo?.fmo || "",
                vehiculoParticular: pase.vehiculo?.placa || "",
                departamento: pase.despachador?.departamento || "",
                cargo: pase.despachador?.cargo || "",
                fichaDespachador: pase.despachador?.ficha || "",
                despachadoPor: pase.despachador?.nombre || "",
                dirigidoA: pase.observaciones || "",
                solicitud: "",
                autorizadoPor: pase.autorizador?.nombre,
                cargoAutorizador: pase.autorizador?.cargo,
                fichaAutorizador: pase.autorizador?.ficha,
            };

            const items = (pase.equiposPases || []).map((ep: any) => ({
                cantidad: ep.cantidad,
                unidad: ep.equipo?.unidad || "UND",
                descripcion: ep.equipo?.descripcion || "",
            }));

            const { generatePDF } = await import("@/lib/generatePdf");
            generatePDF(pdfData, items);
            toast.success("PDF generado correctamente");
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Error al generar el PDF");
        }
    };

    const displayData = filteredData.slice(0, 10); // Show top 10 results

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both border-slate-200/60 shadow-sm">
                <CardHeader className="pb-3 bg-slate-50/50">
                    <CardTitle className="text-lg font-medium flex items-center gap-2 text-slate-700">
                        <Filter className="h-4 w-4 text-primary" />
                        Filtros de Búsqueda
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="pase">Número de Pase</Label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                id="pase"
                                placeholder="Ej: 86467"
                                className="pl-9 border-slate-300 focus:border-primary transition-all"
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
                            className="border-slate-300 focus:border-primary transition-all"
                            value={filters.equipo}
                            onChange={(e) => handleFilterChange("equipo", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="persona">Solicitante</Label>
                        <Input
                            id="persona"
                            placeholder="Ej: Juan Perez"
                            className="border-slate-300 focus:border-primary transition-all"
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
                                className="text-xs border-slate-300 focus:border-primary transition-all"
                            />
                            <Input
                                type="date"
                                value={filters.fechaFin}
                                onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
                                className="text-xs border-slate-300 focus:border-primary transition-all"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Table */}
            <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both border-slate-200/60 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[100px] font-semibold text-slate-700">No. Pase</TableHead>
                                <TableHead className="font-semibold text-slate-700">Fecha</TableHead>
                                <TableHead className="font-semibold text-slate-700">Solicitante</TableHead>
                                <TableHead className="font-semibold text-slate-700">Equipo Principal</TableHead>
                                <TableHead className="font-semibold text-slate-700">Serial / FMO</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                            <span>Cargando pases...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : displayData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        No se encontraron resultados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displayData.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                                        <TableCell className="font-medium text-slate-900">{item.numeroPase}</TableCell>
                                        <TableCell className="text-slate-600">{new Date(item.fecha_emision).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900">{item.solicitador?.nombre || 'N/A'}</span>
                                                <span className="text-xs text-slate-500">{item.solicitador?.ficha || '-'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600">
                                            {item.equiposPases && item.equiposPases.length > 0 ? (
                                                item.equiposPases.length === 1 ? (
                                                    [item.equiposPases[0].equipo?.marca, item.equiposPases[0].equipo?.modelo].filter(Boolean).join(" ") || "N/A"
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Varios equipos</span>
                                                )
                                            ) : (
                                                <span className="text-muted-foreground italic">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-slate-600">
                                            {item.equiposPases && item.equiposPases.length > 0 ? (
                                                item.equiposPases.length === 1 ? (
                                                    item.equiposPases[0].equipo?.fmo || "N/A"
                                                ) : (
                                                    "Varios"
                                                )
                                            ) : (
                                                <span className="text-muted-foreground italic">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm" 
                                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                                                    onClick={() => handleDownloadPDF(item.id)}
                                                    title="Descargar PDF"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    <span className="sr-only">Descargar PDF</span>
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
        </div>
    );
}
