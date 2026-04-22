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
import { Search, Filter, Calendar as CalendarIcon, Eye, User, MapPin, Check, ChevronsUpDown, X, Pencil } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PaseRecord {
    id: string;
    numeroPase: string;
    fecha_emision: string;
    solicitador?: { nombre: string, ficha: string };
    conductor?: { nombre: string, ficha: string };
    vehiculo?: { placa: string, modelo: string };
    destino?: { nombre: string, direccion: string, telefono?: string };
    observaciones?: string;
    tiempo_estimado?: string;
    solicitud?: string;
    equiposPases?: any[];
}

export function HistoryTable() {
    const router = useRouter();
    const [data, setData] = useState<PaseRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        numeroPase: "",
        equipo: "",
        persona: "",
        destino: "",
        fechaInicio: undefined as Date | undefined,
        fechaFin: undefined as Date | undefined,
    });

    const [destinos, setDestinos] = useState<any[]>([]);
    const [empleados, setEmpleados] = useState<any[]>([]);
    const [openSolicitante, setOpenSolicitante] = useState(false);
    const [openDestino, setOpenDestino] = useState(false);

    React.useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [pases, destinosList, empleadosList] = await Promise.all([
                    api.get<any[]>("/pases"),
                    api.get<any[]>("/destinos"),
                    api.get<any[]>("/empleados")
                ]);
                setData(pases);
                setDestinos(destinosList);
                setEmpleados(empleadosList);
            } catch (error) {
                console.error("Error loading history data:", error);
                toast.error("Error al cargar datos del historial");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchPase = filters.numeroPase
                ? item.numeroPase.includes(filters.numeroPase)
                : true;

            const matchPersona = filters.persona
                ? (item.solicitador?.nombre?.toLowerCase().includes(filters.persona.toLowerCase()) ||
                   item.solicitador?.ficha?.toLowerCase().includes(filters.persona.toLowerCase()))
                : true;

            const matchDestino = filters.destino
                ? item.destino?.nombre?.toLowerCase().includes(filters.destino.toLowerCase())
                : true;

            const matchEquipo = filters.equipo
                ? item.equiposPases?.some((ep: any) => 
                    ep.equipo?.nombre?.toLowerCase().includes(filters.equipo.toLowerCase()) || 
                    ep.equipo?.marca?.toLowerCase().includes(filters.equipo.toLowerCase()) || 
                    ep.equipo?.fmo?.toLowerCase().includes(filters.equipo.toLowerCase()) || 
                    ep.equipo?.serial?.toLowerCase().includes(filters.equipo.toLowerCase())
                  )
                : true;

            const itemDate = new Date(item.fecha_emision);
            itemDate.setHours(0, 0, 0, 0);

            const matchFechaInicio = filters.fechaInicio
                ? itemDate >= filters.fechaInicio
                : true;

            const matchFechaFin = filters.fechaFin
                ? itemDate <= filters.fechaFin
                : true;

            return matchPase && matchPersona && matchDestino && matchEquipo && matchFechaInicio && matchFechaFin;
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
                solicitud: pase.solicitud || "",
                tiempoEstimado: pase.tiempo_estimado || "",
                autorizadoPor: pase.autorizador?.nombre,
                cargoAutorizador: pase.autorizador?.cargo,
                fichaAutorizador: pase.autorizador?.ficha,
                solicitante: pase.solicitador?.nombre,
                fichaSolicitante: pase.solicitador?.ficha,
                cargoSolicitante: pase.solicitador?.cargo,
                departamentoSolicitante: pase.solicitador?.departamento,
            };

            // Grouping logic for PDF items
            const groups: Record<string, any> = {};
            (pase.equiposPases || []).forEach((ep: any) => {
                const equipo = ep.equipo;
                if (!equipo) return;
                const key = `${equipo.nombre}-${equipo.marca}`;
                if (!groups[key]) {
                    groups[key] = {
                        nombre: equipo.nombre,
                        marca: equipo.marca,
                        cantidad: 0,
                        ids: [],
                        unidad: equipo.unidad || "UND"
                    };
                }
                groups[key].cantidad += ep.cantidad || 1;
                if (equipo.fmo) groups[key].ids.push(equipo.fmo);
                if (equipo.serial) groups[key].ids.push(equipo.serial);
            });

            const mappedItemsForPDF = Object.values(groups).map((g: any) => ({
                cantidad: g.cantidad,
                unidad: g.unidad,
                descripcion: `${g.nombre || ""}${g.marca ? ` ${g.marca}` : ""}`.trim(),
                fmos: g.ids.join(", ")
            }));

            const { generatePDF } = await import("@/lib/generatePdf");
            generatePDF(pdfData, mappedItemsForPDF);
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
            <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both border-border/40 bg-card/50 shadow-sm backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-border/20">
                    <CardTitle className="text-lg font-black flex items-center gap-2 text-foreground uppercase tracking-tight">
                        <Filter className="h-4 w-4 text-primary" />
                        Filtros de Búsqueda
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="pase">Número de Pase</Label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                id="pase"
                                placeholder="Ej: 86467"
                                className="pl-9 border-border/50 focus:border-primary transition-all h-9 bg-muted/20"
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
                            className="border-border/50 focus:border-primary transition-all h-9 bg-muted/20"
                            value={filters.equipo}
                            onChange={(e) => handleFilterChange("equipo", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="persona">Solicitante</Label>
                        <Popover open={openSolicitante} onOpenChange={setOpenSolicitante}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openSolicitante}
                                    className={cn(
                                        "w-full h-9 justify-between border-slate-300 font-normal hover:bg-primary hover:text-white hover:border-primary transition-all group",
                                        !filters.persona && "text-muted-foreground"
                                    )}
                                >
                                    <div className={cn(
                                        "flex items-center gap-2 truncate text-xs transition-colors",
                                        filters.persona && "text-primary font-medium",
                                        "group-hover:text-white"
                                    )}>
                                        <User className={cn("h-3.5 w-3.5 transition-colors", filters.persona ? "text-primary" : "text-primary/70", "group-hover:text-white")} />
                                        {filters.persona || "Filtrar por..."}
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Buscar..." />
                                    <CommandList>
                                        <CommandEmpty>No encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                onSelect={() => {
                                                    handleFilterChange("persona", "");
                                                    setOpenSolicitante(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        filters.persona === "" ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                Todos
                                            </CommandItem>
                                            {empleados
                                                .filter((e) => e.rol?.toLowerCase() === "solicitante")
                                                .map((empleado) => (
                                                    <CommandItem
                                                        key={empleado.id}
                                                        onSelect={() => {
                                                            handleFilterChange("persona", empleado.nombre);
                                                            setOpenSolicitante(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                filters.persona === empleado.nombre ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {empleado.nombre}
                                                    </CommandItem>
                                                ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="destino">Destino</Label>
                        <Popover open={openDestino} onOpenChange={setOpenDestino}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openDestino}
                                    className={cn(
                                        "w-full h-9 justify-between border-slate-300 font-normal hover:bg-primary hover:text-white hover:border-primary transition-all group",
                                        !filters.destino && "text-muted-foreground"
                                    )}
                                >
                                    <div className={cn(
                                        "flex items-center gap-2 truncate text-xs transition-colors",
                                        filters.destino && "text-primary font-medium",
                                        "group-hover:text-white"
                                    )}>
                                        <MapPin className={cn("h-3.5 w-3.5 transition-colors", filters.destino ? "text-primary" : "text-primary/70", "group-hover:text-white")} />
                                        {filters.destino || "Filtrar por..."}
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Buscar..." />
                                    <CommandList>
                                        <CommandEmpty>No encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                onSelect={() => {
                                                    handleFilterChange("destino", "");
                                                    setOpenDestino(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        filters.destino === "" ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                Todos
                                            </CommandItem>
                                            {destinos.map((dest) => (
                                                <CommandItem
                                                    key={dest.id}
                                                    onSelect={() => {
                                                        handleFilterChange("destino", dest.nombre);
                                                        setOpenDestino(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            filters.destino === dest.nombre ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {dest.nombre}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2 md:col-span-2 lg:col-span-1">
                        <Label>Rango de Fechas</Label>
                        <div className="flex flex-col gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full h-9 px-2 text-left font-normal text-xs justify-start border-slate-300 hover:bg-primary hover:text-white hover:border-primary transition-all group",
                                                !filters.fechaInicio ? "text-muted-foreground" : "text-primary font-medium border-primary/20"
                                            )}
                                        >
                                            <CalendarIcon className={cn("mr-1 h-3.5 w-3.5 transition-colors", filters.fechaInicio && "text-primary", "group-hover:text-white")} />
                                            {filters.fechaInicio ? format(filters.fechaInicio, "dd/MM/yy") : "Inicio"}
                                        </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={filters.fechaInicio}
                                        onSelect={(date) => handleFilterChange("fechaInicio", date)}
                                        initialFocus
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>
                            <div className="flex gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full h-9 px-2 text-left font-normal text-xs justify-start border-slate-300 hover:bg-primary hover:text-white hover:border-primary transition-all group",
                                                !filters.fechaFin ? "text-muted-foreground" : "text-primary font-medium border-primary/20"
                                            )}
                                        >
                                            <CalendarIcon className={cn("mr-1 h-3.5 w-3.5 transition-colors", filters.fechaFin && "text-primary", "group-hover:text-white")} />
                                            {filters.fechaFin ? format(filters.fechaFin, "dd/MM/yy") : "Fin"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar
                                            mode="single"
                                            selected={filters.fechaFin}
                                            onSelect={(date) => handleFilterChange("fechaFin", date)}
                                            initialFocus
                                            locale={es}
                                        />
                                    </PopoverContent>
                                </Popover>
                                {filters.fechaInicio || filters.fechaFin ? (
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-9 w-9 shrink-0 text-muted-foreground"
                                        onClick={() => {
                                            handleFilterChange("fechaInicio", undefined);
                                            handleFilterChange("fechaFin", undefined);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Table */}
            <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both border-border/40 bg-card shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 border-b border-border/50">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="w-[120px] font-black text-foreground text-left uppercase text-xs tracking-wider">N° PASE</TableHead>
                                <TableHead className="font-black text-foreground text-left uppercase text-xs tracking-wider">FECHA</TableHead>
                                <TableHead className="font-black text-foreground text-left uppercase text-xs tracking-wider">SOLICITANTE</TableHead>
                                <TableHead className="font-black text-foreground text-left uppercase text-xs tracking-wider">DESTINO</TableHead>
                                <TableHead className="font-black text-foreground text-left uppercase text-xs tracking-wider">EQUIPO / MATERIAL</TableHead>
                                <TableHead className="text-right font-black text-foreground uppercase text-xs tracking-wider">ACCIONES</TableHead>
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
                                    <TableRow key={item.id} className="hover:bg-muted/20 transition-colors group cursor-default border-border/20">
                                        <TableCell className="font-bold text-foreground text-left">{item.numeroPase}</TableCell>
                                        <TableCell className="text-muted-foreground text-left">{new Date(item.fecha_emision).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-left">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{item.solicitador?.nombre || 'N/A'}</span>
                                                <span className="text-xs text-muted-foreground">{item.solicitador?.ficha || '-'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-left">
                                            {item.destino?.nombre || 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-left">
                                            {item.equiposPases && item.equiposPases.length > 0 ? (
                                                (() => {
                                                    const groups: Record<string, any> = {};
                                                    item.equiposPases.forEach((ep: any) => {
                                                        const equipo = ep.equipo;
                                                        if (!equipo) return;
                                                        const key = `${equipo.nombre}-${equipo.marca}`;
                                                        if (!groups[key]) {
                                                            groups[key] = {
                                                                nombre: equipo.nombre,
                                                                marca: equipo.marca,
                                                                cantidad: 0,
                                                                ids: []
                                                            };
                                                        }
                                                        groups[key].cantidad += ep.cantidad || 1;
                                                        if (equipo.fmo) groups[key].ids.push(equipo.fmo);
                                                        if (equipo.serial) groups[key].ids.push(equipo.serial);
                                                    });

                                                    return Object.values(groups).map((g: any) => {
                                                        const idStr = (g.cantidad <= 2 && g.ids.length > 0) ? ` (${g.ids.join(", ")})` : "";
                                                        return `${g.cantidad} ${g.nombre || ""}${g.marca ? ` ${g.marca}` : ""}${idStr}`;
                                                    }).join("; ");
                                                })()
                                            ) : (
                                                <span className="text-muted-foreground italic">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm" 
                                                    className="h-8 w-8 p-0 transition-colors bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 border border-blue-900/50"
                                                    onClick={() => router.push(`/?edit=${item.id}`)}
                                                    title="Editar Pase"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Editar Pase</span>
                                                </Button>
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm" 
                                                    className="h-8 w-8 p-0 transition-colors bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50"
                                                    onClick={() => handleDownloadPDF(item.id)}
                                                    title="Descargar PDF"
                                                >
                                                    <Eye className="h-4 w-4" />
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
