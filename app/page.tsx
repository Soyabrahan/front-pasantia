"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  MaterialsTable,
  type MaterialItem,
} from "@/components/materials-table";

import {
  FileText,
  Truck,
  Calendar,
  Clock,
  Send,
  RotateCcw,
  CheckCircle2,
  Building2,
  User,
  MapPin,
  Phone,
  CreditCard,
  UserCheck,
  Monitor,
  Check,
  ChevronsUpDown,
  Plus,
  Search,
} from "lucide-react";

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
  CommandSeparator,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";

import { api } from "@/lib/api-client";
import { AddEntityModal } from "@/components/add-entity-modal";

interface Destino {
  id: string | number;
  nombre: string;
  direccion: string;
  telefono: string;
}

export default function MaterialPassPage() {
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [loadingDestinos, setLoadingDestinos] = useState(true);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  const [loadingVehiculos, setLoadingVehiculos] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    folio: "",
    fecha: "",
    hora: "",

    // Concept Options
    conceptoOpcion: "",

    // Shipping / General Info
    tiempoEstimado: "",
    embargueseA: "",
    ordenCompra: "",
    direccion: "",
    telefono: "",
    tipoPago: "", // Contado or Credito

    // Driver Info
    conductor: "",
    fichaConductor: "",
    vehiculoFMO: "",
    vehiculoParticular: "",
    vehiculoId: null as number | null,

    // Dispatch Info
    despachadoPor: "",
    fichaDespachador: "",
    cargoDespachador: "",
    departamentoDespachador: "",

    // Authorization Info
    autorizadoPor: "Carmen Marquez",
    cargoAutorizador: "Gerente de Telemática (e)",
    fichaAutorizador: "15508",

    // Observations / Request
    observaciones: "",
    solicitud: "",

    // Applicant Info
    solicitante: "",
    fichaSolicitante: "",
    cargoSolicitante: "",
    departamentoSolicitante: "",
  });

  const fetchUltimoNumero = async () => {
    try {
      const result = await api.get<{ numeroPase: string | null }>("/pases/ultimo-numero");
      if (result && result.numeroPase) {
        const lastNumStr = String(result.numeroPase);

        // Intentar incrementar si es numérico
        const baseNum = parseInt(lastNumStr.replace(/\D/g, ""));
        if (!isNaN(baseNum)) {
          const nextNum = (baseNum + 1)
            .toString()
            .padStart(lastNumStr.length, "0");
          handleInputChange("folio", nextNum);
          return nextNum;
        } else {
          handleInputChange("folio", lastNumStr);
          return lastNumStr;
        }
      } else {
        handleInputChange("folio", "0001");
        return "0001";
      }
    } catch (error) {
      console.error("Error al cargar último número:", error);
      handleInputChange("folio", "0001");
      return "0001";
    }
  };

  React.useEffect(() => {
    setMounted(true);
    setFormData((prev) => ({
      ...prev,
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    // Cargar destinos desde el backend
    const fetchDestinos = async () => {
      try {
        const data = await api.get<Destino[]>("/destinos");
        setDestinos(data);
      } catch (error) {
        console.error("Error al cargar destinos:", error);
      } finally {
        setLoadingDestinos(false);
      }
    };

    const fetchEmpleados = async () => {
      try {
        const data = await api.get<any[]>("/empleados");
        setEmpleados(data);
      } catch (error) {
        console.error("Error al cargar empleados:", error);
      } finally {
        setLoadingEmpleados(false);
      }
    };

    const fetchVehiculos = async () => {
      try {
        const data = await api.get<any[]>("/vehiculos");
        setVehiculos(data);
      } catch (error) {
        console.error("Error al cargar vehículos:", error);
      } finally {
        setLoadingVehiculos(false);
      }
    };

    fetchDestinos();
    fetchEmpleados();
    fetchVehiculos();
    fetchUltimoNumero();
  }, []);

  const [items, setItems] = useState<MaterialItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openDestino, setOpenDestino] = useState(false);
  const [openDespachador, setOpenDespachador] = useState(false);
  const [openSolicitante, setOpenSolicitante] = useState(false);
  const [openConductor, setOpenConductor] = useState(false);
  const [openVehiculoFMO, setOpenVehiculoFMO] = useState(false);
  const [openVehiculoParticular, setOpenVehiculoParticular] = useState(false);

  // States for AddEntityModal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"empleado" | "destino">("empleado");
  const [modalRole, setModalRole] = useState<string>("");

  const openAddModal = (type: "empleado" | "destino", role: string = "") => {
    setModalType(type);
    setModalRole(role);
    setIsModalOpen(true);
  };

  const handleEntityAdded = (data: any) => {
    if (modalType === "empleado") {
      setEmpleados((prev) => [...prev, data]);
      // Auto-select based on role
      if (modalRole === "Conductor") {
        handleInputChange("conductor", data.nombre);
        handleInputChange("fichaConductor", data.ficha);
      } else if (modalRole === "Despachador") {
        handleInputChange("despachadoPor", data.nombre);
        handleInputChange("fichaDespachador", data.ficha);
        handleInputChange("cargoDespachador", data.cargo);
        handleInputChange("departamentoDespachador", data.departamento);
      } else if (modalRole === "Solicitante") {
        handleInputChange("solicitante", data.nombre);
        handleInputChange("fichaSolicitante", data.ficha);
        handleInputChange("cargoSolicitante", data.cargo);
        handleInputChange("departamentoSolicitante", data.departamento);
      }
    } else {
      setDestinos((prev) => [...prev, data]);
      handleInputChange("embargueseA", data.nombre);
      handleInputChange("direccion", data.direccion);
      handleInputChange("telefono", data.telefono);
    }
  };

  // Smart Extraction
  const extractedData = React.useMemo(() => {
    const text = formData.observaciones;
    const fichaMatch = text.match(/(?:Ficha[:\s]*|F-?)\s*(\d+)/i);
    const fmoMatch = text.match(/(?:FMO[:\s-]*|PC[:\s-]*)\s*(\d+)/i);

    return {
      ficha: fichaMatch ? fichaMatch[1] : null,
      fmo: fmoMatch ? fmoMatch[1] : null,
    };
  }, [formData.observaciones]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de campos obligatorios
    const requiredFields = [
      { field: 'folio', name: 'N° Pase' },
      { field: 'conceptoOpcion', name: 'Concepto del Pase' },
      { field: 'tiempoEstimado', name: 'Tiempo Estimado' },
      { field: 'embargueseA', name: 'Embárguese a' },
      { field: 'direccion', name: 'Dirección' },
      { field: 'telefono', name: 'Teléfono' },
      { field: 'conductor', name: 'Conductor' },
      { field: 'fichaConductor', name: 'Ficha Conductor' },
      { field: 'despachadoPor', name: 'Material Despachado Por' },
      { field: 'fichaDespachador', name: 'Ficha Despachador' },
      { field: 'solicitante', name: 'Solicitante' },
    ];

    const missingFields = requiredFields.filter(rf => !formData[rf.field as keyof typeof formData]);

    if (!formData.vehiculoFMO && !formData.vehiculoParticular) {
      missingFields.push({ field: 'vehiculo', name: 'Vehículo (FMO o Particular)' });
    }

    if (items.length === 0) {
      missingFields.push({ field: 'items', name: 'Materiales (al menos 1)' });
    }

    if (missingFields.length > 0) {
      alert(`Por favor, complete los campos obligatorios:\n- ${missingFields.map(f => f.name).join('\n- ')}`);
      return;
    }

    setIsSubmitting(true);

    const getEmpleadoId = (ficha: string) => {
      const emp = empleados.find((e) => e.ficha === ficha);
      return emp ? emp.id : null;
    };

    const paseBody = {
      numeroPase: formData.folio,
      concepto: formData.conceptoOpcion,
      destinoId:
        destinos.find((d) => d.nombre === formData.embargueseA)?.id || null,
      numero_compra: formData.ordenCompra,
      tipo_pago: formData.tipoPago,
      // Intentar obtener los IDs reales de los empleados vinculados
      solicitadorId: getEmpleadoId(formData.fichaSolicitante),
      conductorId: getEmpleadoId(formData.fichaConductor),
      despachadorId: getEmpleadoId(formData.fichaDespachador),
      autorizadorId: getEmpleadoId("15508"),
      vehiculoId: formData.vehiculoId,
      observaciones: formData.observaciones,
      tiempo_estimado: formData.tiempoEstimado,
      solicitud: formData.conceptoOpcion,
      equipos: items.map((item) => {
        const rawValues = item.identificadores ? item.identificadores.split(',').map(f => f.trim()).filter(f => f !== "") : [];
        const isFMO = item.tipoIdentificador === "FMO";
        const isSerial = item.tipoIdentificador === "Serial";
        return {
          marca: item.marca,
          descripcion: item.producto,
          cantidad:
            typeof item.cantidad === "string"
              ? parseInt(item.cantidad)
              : item.cantidad,
          unidad: item.unidad,
          fmos: isFMO ? rawValues : [],
          serial: isSerial ? rawValues.join(', ') : "",
          seriales: isSerial ? rawValues : [],
        };
      }),
    };

    try {
      // Enviar al backend
      await api.post("/pases", paseBody);

      // Generar PDF original
      const pdfData = {
        numeroPase: formData.folio,
        concepto: {
          donacion: formData.conceptoOpcion === "DONACION",
          devolucion: formData.conceptoOpcion === "DEVOLUCION",
          prestamo: formData.conceptoOpcion === "PRESTAMO",
          reparacion: formData.conceptoOpcion === "REPARACION",
          revision: formData.conceptoOpcion === "REVISION",
          vendido: formData.conceptoOpcion === "VENDIDO",
          foraneo: formData.conceptoOpcion === "FORANEO",
        },
        embarqueseA: formData.embargueseA,
        tiempoEstimado: formData.tiempoEstimado,
        ordenCompra: formData.ordenCompra,
        direccion: formData.direccion,
        telefono: formData.telefono,
        contado: formData.tipoPago === "CONTADO",
        credito: formData.tipoPago === "CREDITO",
        conductor: formData.conductor,
        fichaConductor: formData.fichaConductor,
        vehiculoFmo: formData.vehiculoFMO,
        vehiculoParticular: formData.vehiculoParticular,
        departamento: formData.departamentoDespachador,
        cargo: formData.cargoDespachador,
        fichaDespachador: formData.fichaDespachador,
        despachadoPor: formData.despachadoPor,
        dirigidoA: formData.observaciones,
        solicitud: formData.conceptoOpcion,
        conceptoNombre: formData.conceptoOpcion,
        solicitante: formData.solicitante,
        fichaSolicitante: formData.fichaSolicitante,
        cargoSolicitante: formData.cargoSolicitante,
        departamentoSolicitante: formData.departamentoSolicitante,
      };

      const mappedItemsForPDF = items.map(item => ({
        cantidad: item.cantidad,
        unidad: item.unidad,
        descripcion: `${item.marca} ${item.producto}`.trim(),
        fmos: item.tipoIdentificador !== "S/N" ? `${item.tipoIdentificador}: ${item.identificadores}` : "",
      }));

      const { generatePDF } = await import("@/lib/generatePdf");
      generatePDF(pdfData, mappedItemsForPDF);

      setIsSubmitted(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error desconocido al registrar el pase";
          
      if (errorMessage.toLowerCase().includes("ya existe") || errorMessage.toLowerCase().includes("duplicate") || errorMessage.toLowerCase().includes("duplicado") || errorMessage.toLowerCase().includes("tomado")) {
        
        const currentBase = parseInt(formData.folio.replace(/\D/g, ""));
        if (!isNaN(currentBase)) {
          const nextNum = (currentBase + 1).toString().padStart(formData.folio.length, "0");
          handleInputChange("folio", nextNum);
          alert(`Error detectado: ${errorMessage}\n\nEl sistema ha intentado avanzar al número (${nextNum}). Por favor intente registrar nuevamente con este nuevo número.`);
        } else {
          alert(`Error detectado: ${errorMessage}\n\nPor favor, modifique el número de pase e intente nuevamente.`);
        }
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData((prev) => ({
      folio: prev.folio, // Keep temporalily until fetch completes
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      conceptoOpcion: "PRESTAMO",
      tiempoEstimado: "",
      embargueseA: "",
      ordenCompra: "",
      direccion: "",
      telefono: "",
      tipoPago: "",
      conductor: "",
      fichaConductor: "",
      vehiculoFMO: "",
      vehiculoParticular: "",
      despachadoPor: "",
      fichaDespachador: "",
      cargoDespachador: "",
      departamentoDespachador: "",
      autorizadoPor: "Carmen Marquez",
      cargoAutorizador: "Gerente de Telemática (e)",
      fichaAutorizador: "15508",
      vehiculoId: null,
      observaciones: "",
      solicitud: "",
      solicitante: "",
      fichaSolicitante: "",
      cargoSolicitante: "",
      departamentoSolicitante: "",
    }));
    fetchUltimoNumero();
    setItems([]);
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 animate-fadeIn">
        <Card className="w-full max-w-md text-center animate-scaleIn">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto animate-pulseRed">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Pase Registrado
            </h2>
            <p className="text-muted-foreground text-sm">
              El pase de materiales <strong>{formData.folio}</strong> ha sido
              registrado exitosamente.
            </p>
            <Button onClick={handleReset} className="mt-4">
              <RotateCcw className="h-4 w-4 mr-2" />
              Nuevo Pase
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background pb-10">
      <Header 
        title="PASE PARA MATERIALES Y MISCELÁNEOS"
        subtitle="Sistema de Gestión de Pases FMO"
        icon={<Truck className="h-6 w-6" />}
        rightElement={
          <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
            <Calendar className="h-4 w-4" />
            <span>{formData.fecha}</span>
          </div>
        }
      />

      <main className="max-w-5xl mx-auto px-4 space-y-6">
        <form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
        >
          {/* Concept Options */}
          <Card className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100 fill-mode-both border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-semibold flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Concepto del Pase
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="folio-input" className="text-sm font-medium">
                    N° Pase:
                  </Label>
                  <Input
                    id="folio-input"
                    className="h-8 w-32 border-slate-400 font-mono"
                    value={formData.folio}
                    onChange={(e) => handleInputChange("folio", e.target.value)}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <RadioGroup
                value={formData.conceptoOpcion}
                onValueChange={(val) =>
                  handleInputChange("conceptoOpcion", val)
                }
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {[
                  "DONACION",
                  "DEVOLUCION",
                  "PRESTAMO",
                  "REPARACION",
                  "REVISION",
                  "VENDIDO",
                  "FORANEO",
                ].map((opcion) => (
                  <label
                    key={opcion}
                    htmlFor={opcion}
                    className="flex items-center space-x-2 border-2 border-slate-600 rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                  >
                    <RadioGroupItem
                      value={opcion}
                      id={opcion}
                      className="border-slate-600 text-primary w-5 h-5 transition-none duration-0"
                    />
                    <span className="font-medium text-base text-foreground">
                      {opcion}
                    </span>
                  </label>
                ))}
              </RadioGroup>
              <div className="mt-4 pt-4 border-t border-slate-300">
                <Label>Tiempo Estimado de Regreso a la Empresa</Label>
                <Input
                  className="mt-2 border-slate-600"
                  placeholder="Ej. 3 días, 1 semana, Indefinido..."
                  value={formData.tiempoEstimado}
                  onChange={(e) =>
                    handleInputChange("tiempoEstimado", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200 fill-mode-both border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-slate-300">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Datos de Envío y Destino
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Embárguese a (Nombre / Empresa)</Label>
                <Popover open={openDestino} onOpenChange={setOpenDestino}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openDestino}
                      className={cn(
                        "w-full justify-between border-slate-400 font-normal hover:bg-slate-50 transition-colors",
                        !formData.embargueseA && "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-4 w-4 text-primary/70" />
                        {formData.embargueseA || "Seleccionar destino..."}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar destino..." />
                      <CommandList>
                        <CommandEmpty className="p-2">
                          <p className="text-sm mb-2">
                            No se encontró el destino.
                          </p>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full gap-2"
                            onClick={() => {
                              handleInputChange("embargueseA", "");
                              handleInputChange("direccion", "");
                              handleInputChange("telefono", "");
                              setOpenDestino(false);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            Nuevo Destino (Limpiar campos)
                          </Button>
                        </CommandEmpty>
                        <CommandGroup heading="Destinos Registrados">
                          {loadingDestinos ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              Cargando destinos...
                            </div>
                          ) : (
                            destinos.map((destino) => (
                              <CommandItem
                                key={destino.id}
                                value={destino.nombre}
                                onSelect={() => {
                                  handleInputChange(
                                    "embargueseA",
                                    destino.nombre,
                                  );
                                  handleInputChange(
                                    "direccion",
                                    destino.direccion,
                                  );
                                  handleInputChange(
                                    "telefono",
                                    destino.telefono,
                                  );
                                  setOpenDestino(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.embargueseA === destino.nombre
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{destino.nombre}</span>
                                  <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                                    {destino.direccion}
                                  </span>
                                </div>
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              openAddModal("destino");
                              setOpenDestino(false);
                            }}
                            className="text-primary font-medium"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Nuevo Destino
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {/* Fallback input for manual typing if not selected from list */}
                <Input
                  className="mt-2 border-slate-400 cursor-not-allowed bg-slate-100 text-slate-600 focus-visible:ring-0"
                  placeholder="Se llena automáticamente al seleccionar..."
                  value={formData.embargueseA}
                  readOnly
                  onChange={(e) =>
                    handleInputChange("embargueseA", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>N° Orden de Compra</Label>
                <Input
                  className="border-slate-400"
                  value={formData.ordenCompra}
                  onChange={(e) =>
                    handleInputChange("ordenCompra", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  type="tel"
                  className="border-slate-400 cursor-not-allowed bg-slate-100 text-slate-600 focus-visible:ring-0"
                  value={formData.telefono}
                  readOnly
                  onChange={(e) =>
                    handleInputChange("telefono", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Dirección</Label>
                <Input
                  className="border-slate-400 cursor-not-allowed bg-slate-100 text-slate-600 focus-visible:ring-0"
                  value={formData.direccion}
                  readOnly
                  onChange={(e) =>
                    handleInputChange("direccion", e.target.value)
                  }
                />
              </div>
              <div className="md:col-span-2 pt-2">
                <Label className="block mb-2">Condición de Pago</Label>
                <RadioGroup
                  value={formData.tipoPago}
                  onValueChange={(val) => handleInputChange("tipoPago", val)}
                  className="flex gap-6"
                >
                  <label
                    className="flex items-center space-x-2 cursor-pointer"
                    htmlFor="contado"
                  >
                    <RadioGroupItem
                      value="CONTADO"
                      id="contado"
                      className="border-slate-500 w-5 h-5 transition-none duration-0"
                    />
                    <span className="text-base font-medium">Contado</span>
                  </label>
                  <label
                    className="flex items-center space-x-2 cursor-pointer"
                    htmlFor="credito"
                  >
                    <RadioGroupItem
                      value="CREDITO"
                      id="credito"
                      className="border-slate-500 w-5 h-5 transition-none duration-0"
                    />
                    <span className="text-base font-medium">Crédito</span>
                  </label>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Driver & Vehicle */}
          <Card className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 fill-mode-both border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-slate-300">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Conductor y Vehículo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Left Column: Manual/Search */}
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Conductor</Label>
                  <Popover open={openConductor} onOpenChange={setOpenConductor}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openConductor}
                        className={cn(
                          "w-full justify-between border-slate-400 font-normal hover:bg-slate-50 transition-colors",
                          !formData.conductor && "text-muted-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <User className="h-4 w-4 text-primary/70" />
                          {formData.conductor || "Seleccionar conductor..."}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar conductor por nombre o ficha..." />
                        <CommandList>
                          <CommandEmpty className="p-2 text-sm">
                            No se encontró el conductor.
                          </CommandEmpty>
                          <CommandGroup heading="Conductores Registrados">
                            {empleados
                              .filter((e) => e.rol?.toLowerCase() === "conductor")
                              .map((empleado) => (
                                <CommandItem
                                  key={empleado.id}
                                  value={`${empleado.nombre} ${empleado.ficha}`}
                                  onSelect={() => {
                                    handleInputChange(
                                      "conductor",
                                      empleado.nombre,
                                    );
                                    handleInputChange(
                                      "fichaConductor",
                                      empleado.ficha,
                                    );
                                    setOpenConductor(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.conductor === empleado.nombre
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{empleado.nombre}</span>
                                    <span className="text-xs text-muted-foreground">
                                      Ficha: {empleado.ficha}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => {
                                openAddModal("empleado", "Conductor");
                                setOpenConductor(false);
                              }}
                              className="text-primary font-medium"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Agregar Nuevo Conductor
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Input
                    className="mt-2 border-slate-400 cursor-not-allowed bg-slate-100 text-slate-600 focus-visible:ring-0"
                    placeholder="Se llena automáticamente al seleccionar..."
                    value={formData.conductor}
                    readOnly
                    onChange={(e) =>
                      handleInputChange("conductor", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Vehículo Particular</Label>
                  <Popover
                    open={openVehiculoParticular}
                    onOpenChange={setOpenVehiculoParticular}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openVehiculoParticular}
                        className={cn(
                          "w-full justify-between border-slate-400 font-normal hover:bg-slate-50 transition-colors",
                          !formData.vehiculoParticular && "text-muted-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Truck className="h-4 w-4 text-primary/70" />
                          {formData.vehiculoParticular || "Elegir vehículo..."}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar por placa..." />
                        <CommandList>
                          <CommandEmpty>No registrado.</CommandEmpty>
                          <CommandGroup heading="Vehículos Registrados">
                            {vehiculos.map((v) => (
                              <CommandItem
                                key={v.id}
                                value={v.placa || v.fmo}
                                onSelect={() => {
                                  handleInputChange("vehiculoId", v.id);
                                  if (v.esFMO) {
                                    handleInputChange(
                                      "vehiculoParticular",
                                      v.placa || "",
                                    );
                                    handleInputChange("vehiculoFMO", v.fmo);
                                  } else {
                                    handleInputChange(
                                      "vehiculoParticular",
                                      v.placa,
                                    );
                                    handleInputChange("vehiculoFMO", "");
                                  }
                                  setOpenVehiculoParticular(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.vehiculoParticular === v.placa
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {v.placa} {v.esFMO ? `(FMO: ${v.fmo})` : ""}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Input
                    className="mt-2 border-slate-400"
                    placeholder="Marca, Modelo o Placa..."
                    value={formData.vehiculoParticular as string}
                    onChange={(e) =>
                      handleInputChange("vehiculoParticular", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Right Column: Auto-filled */}
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label>Ficha o C.I. (Autocompletado)</Label>
                  <Input
                    className="border-slate-400 cursor-not-allowed bg-slate-100 text-slate-600 focus-visible:ring-0"
                    value={formData.fichaConductor}
                    readOnly
                    onChange={(e) =>
                      handleInputChange("fichaConductor", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Vehículo F.M.O (Autocompletado)</Label>
                  <Input
                    className="border-slate-400 cursor-not-allowed bg-slate-100 text-slate-600 focus-visible:ring-0"
                    placeholder="Se llenará automáticamente o escriba..."
                    value={formData.vehiculoFMO as string}
                    onChange={(e) =>
                      handleInputChange("vehiculoFMO", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dispatch Info */}
          <Card className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-500 fill-mode-both border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-slate-300">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Material Despachado Por
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Left Column: Manual/Search */}
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Popover open={openDespachador} onOpenChange={setOpenDespachador}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openDespachador}
                        className={cn(
                          "w-full justify-between border-slate-400 font-normal hover:bg-slate-50 transition-colors",
                          !formData.despachadoPor && "text-muted-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Search className="h-4 w-4 text-primary/70" />
                          {formData.despachadoPor || "Seleccionar despachador..."}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar empleado por nombre o ficha..." />
                        <CommandList>
                          <CommandEmpty className="p-2 text-sm">
                            No se encontró el empleado.
                          </CommandEmpty>
                          <CommandGroup heading="Empleados Registrados">
                            {loadingEmpleados ? (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                Cargando empleados...
                              </div>
                            ) : (
                              empleados
                                .filter((e) => e.rol?.toLowerCase() === "despachador")
                                .map((empleado) => (
                                  <CommandItem
                                    key={empleado.id}
                                    value={`${empleado.nombre} ${empleado.ficha}`}
                                    onSelect={() => {
                                      handleInputChange(
                                        "despachadoPor",
                                        empleado.nombre,
                                      );
                                      handleInputChange(
                                        "fichaDespachador",
                                        empleado.ficha,
                                      );
                                      handleInputChange(
                                        "cargoDespachador",
                                        empleado.cargo,
                                      );
                                      handleInputChange(
                                        "departamentoDespachador",
                                        empleado.departamento,
                                      );
                                      setOpenDespachador(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.despachadoPor === empleado.nombre
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{empleado.nombre}</span>
                                      <span className="text-xs text-muted-foreground">
                                        Ficha: {empleado.ficha} | {empleado.cargo}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))
                            )}
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => {
                                openAddModal("empleado", "Despachador");
                                setOpenDespachador(false);
                              }}
                              className="text-primary font-medium"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Agregar Nuevo Despachador
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Input
                    className="mt-2 border-slate-400 cursor-not-allowed bg-slate-100 text-slate-600 focus-visible:ring-0"
                    placeholder="Se llena automáticamente al seleccionar..."
                    value={formData.despachadoPor}
                    readOnly
                    onChange={(e) =>
                      handleInputChange("despachadoPor", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Right Column: Auto-filled */}
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label>Ficha (Autocompletado)</Label>
                  <Input
                    className="border-slate-400 cursor-not-allowed bg-slate-100 text-slate-600 focus-visible:ring-0"
                    value={formData.fichaDespachador}
                    readOnly
                    onChange={(e) =>
                      handleInputChange("fichaDespachador", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cargo (Autocompletado)</Label>
                  <Input
                    className="border-slate-400 cursor-not-allowed bg-slate-100 text-slate-600 focus-visible:ring-0"
                    value={formData.cargoDespachador}
                    readOnly
                    onChange={(e) =>
                      handleInputChange("cargoDespachador", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Departamento (Autocompletado)</Label>
                  <Input
                    className="border-slate-400 cursor-not-allowed bg-slate-100 text-slate-600 focus-visible:ring-0"
                    value={formData.departamentoDespachador}
                    readOnly
                    onChange={(e) =>
                      handleInputChange("departamentoDespachador", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applicant Info */}
          <Card className="border-slate-300">
            <CardHeader className="pb-3 border-b border-slate-300">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Datos del Solicitante
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Left Column: Manual/Search */}
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Solicitante</Label>
                  <div className="flex flex-col gap-2">
                    <Popover open={openSolicitante} onOpenChange={setOpenSolicitante}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openSolicitante}
                          className={cn(
                            "w-full justify-between border-slate-400 font-normal hover:bg-slate-50 transition-colors",
                            !formData.solicitante && "text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <UserCheck className="h-4 w-4 text-primary/70" />
                            {formData.solicitante || "Seleccionar solicitante..."}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar por nombre o ficha..." />
                          <CommandList>
                            <CommandEmpty>No se encontró el empleado.</CommandEmpty>
                            <CommandGroup heading="Empleados Registrados">
                              {empleados
                                  .filter((e) => e.rol?.toLowerCase() === "solicitante")
                                  .map((empleado) => (
                                <CommandItem
                                  key={empleado.id}
                                  value={`${empleado.nombre} ${empleado.ficha}`}
                                  onSelect={() => {
                                    handleInputChange("solicitante", empleado.nombre);
                                    handleInputChange("fichaSolicitante", empleado.ficha);
                                    handleInputChange("cargoSolicitante", empleado.cargo);
                                    handleInputChange("departamentoSolicitante", empleado.departamento);
                                    setOpenSolicitante(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.solicitante === empleado.nombre ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{empleado.nombre}</span>
                                    <span className="text-xs text-muted-foreground">
                                      F- {empleado.ficha} | {empleado.cargo}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => {
                                  openAddModal("empleado", "Solicitante");
                                  setOpenSolicitante(false);
                                }}
                                className="text-primary font-medium"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Nuevo Solicitante
                              </CommandItem>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Input
                      className="border-slate-400 cursor-not-allowed bg-slate-100 text-slate-600 focus-visible:ring-0"
                      placeholder="Se llena automáticamente al seleccionar..."
                      value={formData.solicitante}
                      readOnly
                      onChange={(e) => handleInputChange("solicitante", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Auto-filled */}
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label>Ficha (Autocompletado)</Label>
                  <Input
                    className="border-slate-400 cursor-not-allowed bg-slate-100 text-slate-600 focus-visible:ring-0"
                    value={formData.fichaSolicitante}
                    readOnly
                    onChange={(e) => handleInputChange("fichaSolicitante", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cargo (Autocompletado)</Label>
                  <Input
                    className="border-slate-400 cursor-not-allowed bg-slate-100 text-slate-600 focus-visible:ring-0"
                    value={formData.cargoSolicitante}
                    readOnly
                    onChange={(e) => handleInputChange("cargoSolicitante", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Departamento (Autocompletado)</Label>
                  <Input
                    className="border-slate-400 cursor-not-allowed bg-slate-100 text-slate-600 focus-visible:ring-0"
                    value={formData.departamentoSolicitante}
                    readOnly
                    onChange={(e) => handleInputChange("departamentoSolicitante", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Authorization - Static */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Autorización
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase">
                  Autorizado Por
                </Label>
                <Input
                  className="border-slate-400 font-medium h-8"
                  value={formData.autorizadoPor}
                  onChange={(e) =>
                    handleInputChange("autorizadoPor", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase">
                  Cargo
                </Label>
                <Input
                  className="border-slate-400 h-8"
                  value={formData.cargoAutorizador}
                  onChange={(e) =>
                    handleInputChange("cargoAutorizador", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase">
                  Ficha
                </Label>
                <Input
                  className="border-slate-400 h-8 font-medium"
                  value={formData.fichaAutorizador}
                  onChange={(e) =>
                    handleInputChange("fichaAutorizador", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Materials Table */}
          <Card>
            <CardContent className="pt-6">
              <MaterialsTable items={items} onItemsChange={setItems} />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="h-11 px-6 border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpiar Formulario
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-11 px-8">
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Procesando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Registrar Pase
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    <AddEntityModal 
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      type={modalType}
      role={modalRole}
      onSuccess={handleEntityAdded}
    />
    </div>
  );
}
