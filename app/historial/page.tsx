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

export default function HistoryPage() {
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
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Cargando pases...
                                        </TableCell>
                                    </TableRow>
                                ) : displayData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No se encontraron resultados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    displayData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.numeroPase}</TableCell>
                                            <TableCell>{new Date(item.fecha_emision).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{item.solicitador?.nombre || 'N/A'}</span>
                                                    <span className="text-xs text-muted-foreground">{item.solicitador?.ficha || '-'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{item.equiposPases?.[0]?.equipo?.descripcion || 'Varios'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-xs">Vehículo: {item.vehiculo?.placa || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => handleDownloadPDF(item.id)}
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
            </main>
        </div>
    );
}
