"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  AlertTriangle,
  ShieldCheck,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

function MaterialPassForm() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [isEditing, setIsEditing] = useState(false);
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [loadingDestinos, setLoadingDestinos] = useState(true);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  const [loadingVehiculos, setLoadingVehiculos] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Validation Modal State
  const [validationModal, setValidationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    fields: [] as string[]
  });

  const [formData, setFormData] = useState({
    folio: "",
    fecha: "",
    hora: "",

    // Concept Options
    conceptoOpcion: "PRESTAMO",

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

    // Authorization Info (Defaults from logic)
    autorizadoPor: "Carmen Marquez",
    cargoAutorizador: "Gerente de Telemática (e)",
    fichaAutorizador: "15508",

    // Observations / Request

    solicitud: "",
    observaciones: "",

    // Applicant Info
    solicitante: "",
    fichaSolicitante: "",
    cargoSolicitante: "",
    departamentoSolicitante: "",
  });

  const fetchUltimoNumero = async () => {
    try {
      // 1. Check if there's a manual override in localStorage
      const savedAjustes = localStorage.getItem("fmo_pases_settings");
      if (savedAjustes) {
        const settings = JSON.parse(savedAjustes);
        if (settings.ultimoFolio) {
          handleInputChange("folio", settings.ultimoFolio);
          return settings.ultimoFolio;
        }
      }

      // 2. Otherwise fetch from API
      const result = await api.get<{ numeroPase: string | null }>("/pases/ultimo-numero");
      if (result && result.numeroPase) {
        const lastNumStr = String(result.numeroPase);
        const baseNum = parseInt(lastNumStr.replace(/\D/g, ""));
        if (!isNaN(baseNum)) {
          const nextNum = (baseNum + 1).toString().padStart(lastNumStr.length, "0");
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

  useEffect(() => {
    setMounted(true);
    
    if (editId) {
      loadEditData(editId);
    } else {
      // Initialize normally if not editing
      const savedAjustes = localStorage.getItem("fmo_pases_settings");
      if (savedAjustes) {
        const settings = JSON.parse(savedAjustes);
        setFormData(prev => ({
          ...prev,
          autorizadoPor: settings.gerenteNombre || prev.autorizadoPor,
          cargoAutorizador: settings.gerenteCargo || prev.cargoAutorizador,
          fichaAutorizador: settings.gerenteFicha || prev.fichaAutorizador,
        }));
      }

      setFormData((prev) => ({
        ...prev,
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      fetchUltimoNumero();
    }
  }, [editId]);

  const loadEditData = async (id: string) => {
    try {
      const pase = await api.get<any>(`/pases/${id}`);
      setIsEditing(true);

      const d = new Date(pase.fecha_emision);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, -1);

      setFormData((prev) => ({
        ...prev,
        folio: pase.numeroPase,
        fecha: localISOTime.split("T")[0],
        hora: pase.fecha_emision.split("T")[1]?.substring(0, 5) || prev.hora,
        conceptoOpcion: pase.concepto,
        tiempoEstimado: pase.tiempo_estimado || "",
        embargueseA: pase.destino?.nombre || "",
        ordenCompra: pase.numero_compra || "",
        direccion: pase.destino?.direccion || "",
        telefono: pase.destino?.telefono || "",
        tipoPago: pase.tipo_pago || "",
        conductor: pase.conductor?.nombre || "",
        fichaConductor: pase.conductor?.ficha || "",
        vehiculoFMO: pase.vehiculo?.fmo || "",
        vehiculoParticular: pase.vehiculo?.placa || "",
        vehiculoId: pase.vehiculo?.id || null,
        despachadoPor: pase.despachador?.nombre || "",
        fichaDespachador: pase.despachador?.ficha || "",
        cargoDespachador: pase.despachador?.cargo || "",
        departamentoDespachador: pase.despachador?.departamento || "",
        autorizadoPor: pase.autorizador?.nombre || prev.autorizadoPor,
        cargoAutorizador: pase.autorizador?.cargo || prev.cargoAutorizador,
        fichaAutorizador: pase.autorizador?.ficha || prev.fichaAutorizador,
        solicitud: pase.solicitud || pase.concepto,
        solicitante: pase.solicitador?.nombre || "",
        fichaSolicitante: pase.solicitador?.ficha || "",
        cargoSolicitante: pase.solicitador?.cargo || "",
        departamentoSolicitante: pase.solicitador?.departamento || "",
      }));

      if (pase.equiposPases && pase.equiposPases.length > 0) {
        const loadedItems = pase.equiposPases.map((ep: any) => ({
          id: ep.equipo?.id || Math.random().toString(),
          cantidad: ep.cantidad,
          unidad: ep.equipo?.unidad || "UND",
          producto: ep.equipo?.nombre || "",
          marca: ep.equipo?.marca || "",
          tipoIdentificador: ep.equipo?.fmo ? "FMO" : "Serial",
          identificadores: ep.equipo?.fmo || ep.equipo?.serial || "",
        }));
        setItems(loadedItems);
      }
    } catch (e) {
      console.error("Failed to load edit data", e);
    }
  };

  useEffect(() => {
    setMounted(true);
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
    if (editId) {
      loadEditData(editId);
    } else {
      const savedAjustes = localStorage.getItem("fmo_pases_settings");
      if (savedAjustes) {
        const settings = JSON.parse(savedAjustes);
        setFormData(prev => ({
          ...prev,
          autorizadoPor: settings.gerenteNombre || prev.autorizadoPor,
          cargoAutorizador: settings.gerenteCargo || prev.cargoAutorizador,
          fichaAutorizador: settings.gerenteFicha || prev.fichaAutorizador,
        }));
      }
      setFormData((prev) => ({
        ...prev,
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      }));
      fetchUltimoNumero();
    }
  }, [editId]);

  const [items, setItems] = useState<MaterialItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openDestino, setOpenDestino] = useState(false);
  const [openDespachador, setOpenDespachador] = useState(false);
  const [openSolicitante, setOpenSolicitante] = useState(false);
  const [openConductor, setOpenConductor] = useState(false);
  const [openVehiculoFMO, setOpenVehiculoFMO] = useState(false);
  const [openVehiculoParticular, setOpenVehiculoParticular] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"empleado" | "destino" | "vehiculo">("empleado");
  const [modalRole, setModalRole] = useState<string>("");
  const [isChangingVehicle, setIsChangingVehicle] = useState(false);

  const openAddModal = (type: "empleado" | "destino" | "vehiculo", role: string = "") => {
    setModalType(type);
    setModalRole(role);
    setIsModalOpen(true);
  };

  const handleEntityAdded = (data: any) => {
    if (modalType === "empleado") {
      setEmpleados((prev) => [...prev, data]);
      if (modalRole === "Conductor") {
        handleInputChange("conductor", data.nombre);
        handleInputChange("fichaConductor", data.ficha);
        if (data.vehiculo) {
           setVehiculos(prev => [...prev, data.vehiculo]);
           handleInputChange("vehiculoId", data.vehiculo.id);
           handleInputChange("vehiculoParticular", data.vehiculo.placa);
           if (data.vehiculo.esFMO) handleInputChange("vehiculoFMO", data.vehiculo.fmo);
        }
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
    } else if (modalType === "destino") {
      setDestinos((prev) => [...prev, data]);
      handleInputChange("embargueseA", data.nombre);
      handleInputChange("direccion", data.direccion);
      handleInputChange("telefono", data.telefono);
    } else if (modalType === "vehiculo") {
      setVehiculos((prev) => [...prev, data]);
      handleInputChange("vehiculoId", data.id);
      handleInputChange("vehiculoParticular", data.placa);
      if (data.esFMO) handleInputChange("vehiculoFMO", data.fmo);
      setIsChangingVehicle(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setValidationModal({
        isOpen: true,
        title: "Campos Incompletos",
        message: "Por favor, complete los siguientes campos obligatorios para continuar:",
        fields: missingFields.map(f => f.name)
      });
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
      destinoId: destinos.find((d) => d.nombre === formData.embargueseA)?.id || null,
      numero_compra: formData.ordenCompra,
      tipo_pago: formData.tipoPago,
      solicitadorId: getEmpleadoId(formData.fichaSolicitante),
      conductorId: getEmpleadoId(formData.fichaConductor),
      despachadorId: getEmpleadoId(formData.fichaDespachador),
      autorizadorId: getEmpleadoId(formData.fichaAutorizador),
      vehiculoId: formData.vehiculoId,
      observaciones: "",
      tiempo_estimado: formData.tiempoEstimado,
      solicitud: formData.conceptoOpcion,
      equipos: items.map((item) => {
        const rawValues = item.identificadores ? item.identificadores.split(',').map(f => f.trim()).filter(f => f !== "") : [];
        const isFMO = item.tipoIdentificador === "FMO";
        const isSerial = item.tipoIdentificador === "Serial";
        return {
          marca: item.marca,
          descripcion: item.producto,
          cantidad: typeof item.cantidad === "string" ? parseInt(item.cantidad) : item.cantidad,
          unidad: item.unidad,
          fmos: isFMO ? rawValues : [],
          serial: isSerial ? rawValues.join(', ') : "",
          seriales: isSerial ? rawValues : [],
        };
      }),
    };
    try {
      if (isEditing && editId) {
        await api.patch(`/pases/${editId}`, paseBody);
      } else {
        await api.post("/pases", paseBody);
      }
      const savedAjustes = localStorage.getItem("fmo_pases_settings");
      if (savedAjustes) {
        const settings = JSON.parse(savedAjustes);
        if (settings.ultimoFolio === formData.folio) {
          settings.ultimoFolio = "";
          localStorage.setItem("fmo_pases_settings", JSON.stringify(settings));
        }
      }
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
        autorizadoPor: formData.autorizadoPor,
        cargoAutorizador: formData.cargoAutorizador,
        fichaAutorizador: formData.fichaAutorizador,
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
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al registrar el pase";
      if (errorMessage.toLowerCase().includes("ya existe") || errorMessage.toLowerCase().includes("duplicate")) {
        const currentBase = parseInt(formData.folio.replace(/\D/g, ""));
        if (!isNaN(currentBase)) {
          const nextNum = (currentBase + 1).toString().padStart(formData.folio.length, "0");
          handleInputChange("folio", nextNum);
          setValidationModal({
            isOpen: true,
            title: "Error de Registro",
            message: `El número de pase ya existe. El sistema ha avanzado al número (${nextNum}). Por favor intente nuevamente.`,
            fields: []
          });
        } else {
          setValidationModal({
            isOpen: true,
            title: "Error de Registro",
            message: "El número de pase ya existe. Por favor modifíquelo e intente nuevamente.",
            fields: []
          });
        }
      } else {
        setValidationModal({ isOpen: true, title: "Error", message: errorMessage, fields: [] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    const savedAjustes = localStorage.getItem("fmo_pases_settings");
    let auth = { 
      autorizadoPor: "Carmen Marquez", 
      cargoAutorizador: "Gerente de Telemática (e)", 
      fichaAutorizador: "15508" 
    };
    if (savedAjustes) {
      const settings = JSON.parse(savedAjustes);
      auth.autorizadoPor = settings.gerenteNombre || auth.autorizadoPor;
      auth.cargoAutorizador = settings.gerenteCargo || auth.cargoAutorizador;
      auth.fichaAutorizador = settings.gerenteFicha || auth.fichaAutorizador;
    }
    setFormData((prev) => ({
      folio: prev.folio,
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
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
      ...auth,
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
    setIsChangingVehicle(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 animate-fadeIn">
        <Card className="w-full max-w-md text-center animate-scaleIn shadow-xl border-primary/20">
          <CardContent className="pt-10 pb-10 space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto animate-pulse">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Pase Registrado</h2>
              <p className="text-muted-foreground">
                El pase de materiales <strong>{formData.folio}</strong> ha sido registrado exitosamente.
              </p>
            </div>
            <Button onClick={handleReset} size="lg" className="w-full font-bold">
              <RotateCcw className="h-5 w-5 mr-2" />
              Nuevo Pase
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mounted) return null;

  const inputStyles = "bg-background border-border focus-visible:ring-ring focus-visible:border-ring text-base";
  const readOnlyStyles = "bg-muted border-border cursor-not-allowed text-foreground font-bold focus-visible:ring-0";

  return (
    <div className="min-h-screen bg-background pb-10">
      <Header 
        title="PASE PARA MATERIALES Y MISCELÁNEOS"
        subtitle="Sistema de Gestión de Pases FMO"
        icon={<Truck className="h-6 w-6" />}
        rightElement={
          <div className="flex items-center gap-2 text-sm text-primary-foreground/80 font-bold">
            <Calendar className="h-4 w-4" />
            <span>{formData.fecha}</span>
          </div>
        }
      />

      <main className="max-w-5xl mx-auto px-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-2xl font-black flex items-center justify-between gap-2 w-full text-foreground">
                <div className="flex items-center gap-2">
                  <FileText className="h-7 w-7 text-primary" />
                  {isEditing ? `EDITANDO PASE N° ${formData.folio}` : "NUEVO PASE"}
                </div>
                <div className="flex flex-col items-end gap-0 bg-primary/5 px-4 py-1 rounded-lg border-r-4 border-primary">
                  <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.3em]">
                    N° DE CONTROL
                  </span>
                  <span className="font-mono font-black text-4xl text-primary leading-none">
                    {formData.folio}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">TIPO DE MOVIMIENTO</Label>
                <Select value={formData.conceptoOpcion} onValueChange={(val) => handleInputChange("conceptoOpcion", val)}>
                  <SelectTrigger className={cn("h-12 text-lg font-bold", inputStyles)}>
                    <SelectValue placeholder="Elija una opción..." />
                  </SelectTrigger>
                  <SelectContent>
                    {["DONACION", "DEVOLUCION", "PRESTAMO", "REPARACION", "REVISION", "VENDIDO", "FORANEO"].map((op) => (
                      <SelectItem key={op} value={op} className="font-bold py-3 text-base">
                        {op}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">TIEMPO ESTIMADO DE REGRESO</Label>
                <Input
                  className={cn("h-12 text-lg", inputStyles)}
                  placeholder="Ej. 3 días, 1 semana, Indefinido..."
                  value={formData.tiempoEstimado}
                  onChange={(e) => handleInputChange("tiempoEstimado", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-2xl font-black flex items-center gap-2 text-foreground">
                <MapPin className="h-7 w-7 text-primary" />
                DATOS DE ENVÍO Y DESTINO
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 md:col-span-2">
                <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">EMBÁRGUESE A (NOMBRE / EMPRESA)</Label>
                <div className="flex flex-col gap-2">
                  <Popover open={openDestino} onOpenChange={setOpenDestino}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        role="combobox" 
                        className={cn("w-full h-12 justify-between text-lg font-medium", inputStyles)}
                        onKeyDown={(e) => { if (e.key === "Enter") setOpenDestino(true); }}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Building2 className="h-5 w-5 text-primary/70" />
                          {formData.embargueseA || "Buscar o seleccionar destino..."}
                        </div>
                        <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Filtrar destinos..." className="h-12" />
                        <CommandList className="max-h-[300px]">
                          <CommandEmpty className="p-4 text-center">
                            <p className="text-sm mb-3">No se encontró el destino.</p>
                            <Button size="sm" variant="secondary" className="w-full" onClick={() => {
                              handleInputChange("embargueseA", "");
                              handleInputChange("direccion", "");
                              handleInputChange("telefono", "");
                              setOpenDestino(false);
                            }}>
                              Limpiar campos
                            </Button>
                          </CommandEmpty>
                          <CommandGroup heading="Destinos Registrados">
                            {destinos.map((d) => (
                              <CommandItem key={d.id} value={d.nombre} onSelect={() => {
                                handleInputChange("embargueseA", d.nombre);
                                handleInputChange("direccion", d.direccion);
                                handleInputChange("telefono", d.telefono);
                                setOpenDestino(false);
                              }} className="py-3">
                                <Check className={cn("mr-2 h-4 w-4", formData.embargueseA === d.nombre ? "opacity-100" : "opacity-0")} />
                                <div className="flex flex-col">
                                  <span className="font-bold">{d.nombre}</span>
                                  <span className="text-xs text-muted-foreground truncate">{d.direccion}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem onSelect={() => { openAddModal("destino"); setOpenDestino(false); }} className="text-primary font-black py-3">
                              <Plus className="mr-2 h-5 w-5" /> AGREGAR NUEVO DESTINO
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Input className={cn("h-11", readOnlyStyles)} value={formData.embargueseA} readOnly tabIndex={-1} />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">N° ORDEN DE COMPRA</Label>
                <Input className={cn("h-12 text-lg", inputStyles)} value={formData.ordenCompra} onChange={(e) => handleInputChange("ordenCompra", e.target.value)} />
              </div>
              <div className="space-y-3">
                <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">TELÉFONO</Label>
                <Input type="tel" className={cn("h-12 text-lg", readOnlyStyles)} value={formData.telefono} readOnly tabIndex={-1} />
              </div>
              <div className="space-y-3 md:col-span-2">
                <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">DIRECCIÓN</Label>
                <Input className={cn("h-12 text-lg", readOnlyStyles)} value={formData.direccion} readOnly tabIndex={-1} />
              </div>
              <div className="md:col-span-2 pt-2">
                <Label className="block mb-4 text-base font-black text-foreground font-black uppercase tracking-tight">CONDICIÓN DE PAGO</Label>
                <RadioGroup value={formData.tipoPago} onValueChange={(val) => handleInputChange("tipoPago", val)} className="flex gap-10">
                  <label className="flex items-center space-x-3 cursor-pointer group" htmlFor="contado">
                    <RadioGroupItem value="CONTADO" id="contado" className="border-border w-6 h-6 border-2" />
                    <span className="text-xl font-black group-hover:text-primary transition-colors">Contado</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer group" htmlFor="credito">
                    <RadioGroupItem value="CREDITO" id="credito" className="border-border w-6 h-6 border-2" />
                    <span className="text-xl font-black group-hover:text-primary transition-colors">Crédito</span>
                  </label>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-2xl font-black flex items-center gap-2 text-foreground">
                <Truck className="h-7 w-7 text-primary" />
                CONDUCTOR Y VEHÍCULO
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">NOMBRE DEL CONDUCTOR</Label>
                  <Popover open={openConductor} onOpenChange={setOpenConductor}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        role="combobox" 
                        className={cn("w-full h-12 justify-between text-lg", inputStyles)}
                        onKeyDown={(e) => { if (e.key === "Enter") setOpenConductor(true); }}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <User className="h-5 w-5 text-primary/70" />
                          {formData.conductor || "Seleccionar conductor..."}
                        </div>
                        <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar conductor..." className="h-12" />
                        <CommandList>
                          <CommandEmpty className="p-4 text-center">No se encontró el conductor.</CommandEmpty>
                          <CommandGroup heading="Conductores">
                            {empleados.filter((e) => e.rol?.toLowerCase() === "conductor").map((emp) => (
                              <CommandItem key={emp.id} value={`${emp.nombre} ${emp.ficha}`} onSelect={() => {
                                handleInputChange("conductor", emp.nombre);
                                handleInputChange("fichaConductor", emp.ficha);
                                const assignedVehicle = vehiculos.find(v => 
                                  v.conductores?.some((c: any) => c.id === emp.id)
                                );
                                if (assignedVehicle) {
                                  handleInputChange("vehiculoId", assignedVehicle.id);
                                  if (assignedVehicle.esFMO) {
                                    handleInputChange("vehiculoParticular", assignedVehicle.placa || "");
                                    handleInputChange("vehiculoFMO", assignedVehicle.fmo);
                                  } else {
                                    handleInputChange("vehiculoParticular", assignedVehicle.placa);
                                    handleInputChange("vehiculoFMO", "");
                                  }
                                } else {
                                  handleInputChange("vehiculoId", null);
                                  handleInputChange("vehiculoParticular", "");
                                  handleInputChange("vehiculoFMO", "");
                                  setIsChangingVehicle(true);
                                }
                                if (assignedVehicle) {
                                  setIsChangingVehicle(false);
                                }
                                setOpenConductor(false);
                              }} className="py-3">
                                <Check className={cn("mr-2 h-4 w-4", formData.conductor === emp.nombre ? "opacity-100" : "opacity-0")} />
                                <div><div className="font-bold">{emp.nombre}</div><div className="text-xs text-muted-foreground">Ficha: {emp.ficha}</div></div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem onSelect={() => { openAddModal("empleado", "Conductor"); setOpenConductor(false); }} className="text-primary font-black py-3">
                              <Plus className="mr-2 h-5 w-5" /> AGREGAR NUEVO CONDUCTOR
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Input className={cn("h-11", readOnlyStyles)} value={formData.conductor} readOnly tabIndex={-1} />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">VEHÍCULO (MARCA / MODELO / PLACA)</Label>
                  <Popover open={openVehiculoParticular} onOpenChange={setOpenVehiculoParticular}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        role="combobox" 
                        className={cn("w-full h-12 justify-between text-lg", inputStyles)}
                        onKeyDown={(e) => { if (e.key === "Enter") setOpenVehiculoParticular(true); }}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Truck className="h-5 w-5 text-primary/70" />
                          {formData.vehiculoParticular || "Elegir vehículo..."}
                        </div>
                        <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar vehículo..." className="h-12" />
                        <CommandList>
                          <CommandEmpty className="p-4 text-center">No registrado.</CommandEmpty>
                          <CommandGroup heading="Vehículos">
                            {vehiculos.map((v) => (
                              <CommandItem key={v.id} value={v.placa || v.fmo} onSelect={() => {
                                handleInputChange("vehiculoId", v.id);
                                if (v.esFMO) {
                                  handleInputChange("vehiculoParticular", v.placa || "");
                                  handleInputChange("vehiculoFMO", v.fmo);
                                } else {
                                  handleInputChange("vehiculoParticular", v.placa);
                                  handleInputChange("vehiculoFMO", "");
                                }
                                setOpenVehiculoParticular(false);
                              }} className="py-3">
                                <Check className={cn("mr-2 h-4 w-4", formData.vehiculoParticular === v.placa ? "opacity-100" : "opacity-0")} />
                                <div><div className="font-bold">{v.placa}</div><div className="text-xs text-muted-foreground">{v.esFMO ? `FMO: ${v.fmo}` : "Particular"}</div></div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandGroup>
                            <CommandItem onSelect={() => { openAddModal("vehiculo"); setOpenVehiculoParticular(false); }} className="text-primary font-black py-3">
                              <Plus className="mr-2 h-5 w-5" /> AGREGAR NUEVO VEHÍCULO
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {(!formData.vehiculoParticular || isChangingVehicle) ? (
                    <Input className={cn("h-12 text-lg", inputStyles)} placeholder="Marca, Modelo o Placa..." value={formData.vehiculoParticular} onChange={(e) => handleInputChange("vehiculoParticular", e.target.value)} />
                  ) : (
                    <div className="flex gap-2">
                       <Input className={cn("h-12 text-lg flex-1", readOnlyStyles)} value={formData.vehiculoParticular} readOnly tabIndex={-1} />
                       <Button type="button" variant="outline" size="sm" className="h-12 px-3 border-primary text-primary font-bold hover:bg-primary/5" onClick={() => setIsChangingVehicle(true)}>
                          Cambiar
                       </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">FICHA O CÉDULA</Label>
                  <Input className={cn("h-12 text-lg", readOnlyStyles)} value={formData.fichaConductor} readOnly tabIndex={-1} />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">VEHÍCULO F.M.O.</Label>
                  <Input className={cn("h-12 text-lg", readOnlyStyles)} placeholder="Se llena automáticamente..." value={formData.vehiculoFMO} readOnly tabIndex={-1} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dispatch Info */}
          <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-2xl font-black flex items-center gap-2 text-foreground">
                <User className="h-7 w-7 text-primary" />
                MATERIAL DESPACHADO POR
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">NOMBRE</Label>
                <div className="flex flex-col gap-2">
                  <Popover open={openDespachador} onOpenChange={setOpenDespachador}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        role="combobox" 
                        className={cn("w-full h-12 justify-between text-lg", inputStyles)}
                        onKeyDown={(e) => { if (e.key === "Enter") setOpenDespachador(true); }}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Search className="h-5 w-5 text-primary/70" />
                          {formData.despachadoPor || "Seleccionar..."}
                        </div>
                        <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar por nombre o ficha..." className="h-12" />
                        <CommandList>
                          <CommandEmpty className="p-4 text-center">No se encontró.</CommandEmpty>
                          <CommandGroup heading="Personal de Despacho">
                            {empleados.filter(e => e.rol?.toLowerCase() === "despachador").map((emp) => (
                              <CommandItem key={emp.id} value={`${emp.nombre} ${emp.ficha}`} onSelect={() => {
                                handleInputChange("despachadoPor", emp.nombre);
                                handleInputChange("fichaDespachador", emp.ficha);
                                handleInputChange("cargoDespachador", emp.cargo);
                                handleInputChange("departamentoDespachador", emp.departamento);
                                setOpenDespachador(false);
                              }} className="py-3">
                                <Check className={cn("mr-2 h-4 w-4", formData.despachadoPor === emp.nombre ? "opacity-100" : "opacity-0")} />
                                <div><div className="font-bold">{emp.nombre}</div><div className="text-xs text-muted-foreground">Ficha: {emp.ficha} | {emp.cargo}</div></div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem onSelect={() => { openAddModal("empleado", "Despachador"); setOpenDespachador(false); }} className="text-primary font-black py-3">
                              <Plus className="mr-2 h-5 w-5" /> AGREGAR PERSONAL
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Input className={cn("h-11", readOnlyStyles)} value={formData.despachadoPor} readOnly tabIndex={-1} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">FICHA</Label>
                  <Input className={cn("h-12 text-lg", readOnlyStyles)} value={formData.fichaDespachador} readOnly tabIndex={-1} />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">CARGO</Label>
                  <Input className={cn("h-12 text-lg", readOnlyStyles)} value={formData.cargoDespachador} readOnly tabIndex={-1} />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">DEPARTAMENTO</Label>
                  <Input className={cn("h-12 text-lg", readOnlyStyles)} value={formData.departamentoDespachador} readOnly tabIndex={-1} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applicant Info */}
          <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-2xl font-black flex items-center gap-2 text-foreground">
                <UserCheck className="h-7 w-7 text-primary" />
                DATOS DEL SOLICITANTE
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">NOMBRE DEL SOLICITANTE</Label>
                <div className="flex flex-col gap-2">
                  <Popover open={openSolicitante} onOpenChange={setOpenSolicitante}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        role="combobox" 
                        className={cn("w-full h-12 justify-between text-lg", inputStyles)}
                        onKeyDown={(e) => { if (e.key === "Enter") setOpenSolicitante(true); }}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <UserCheck className="h-5 w-5 text-primary/70" />
                          {formData.solicitante || "Seleccionar..."}
                        </div>
                        <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar por nombre o ficha..." className="h-12" />
                        <CommandList>
                          <CommandEmpty className="p-4 text-center">No se encontró.</CommandEmpty>
                          <CommandGroup heading="Solicitantes">
                            {empleados.filter(e => e.rol?.toLowerCase() === "solicitante").map((emp) => (
                              <CommandItem key={emp.id} value={`${emp.nombre} ${emp.ficha}`} onSelect={() => {
                                handleInputChange("solicitante", emp.nombre);
                                handleInputChange("fichaSolicitante", emp.ficha);
                                handleInputChange("cargoSolicitante", emp.cargo);
                                handleInputChange("departamentoSolicitante", emp.departamento);
                                setOpenSolicitante(false);
                              }} className="py-3">
                                <Check className={cn("mr-2 h-4 w-4", formData.solicitante === emp.nombre ? "opacity-100" : "opacity-0")} />
                                <div><div className="font-bold">{emp.nombre}</div><div className="text-xs text-muted-foreground">F- {emp.ficha} | {emp.cargo}</div></div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem onSelect={() => { openAddModal("empleado", "Solicitante"); setOpenSolicitante(false); }} className="text-primary font-black py-3">
                              <Plus className="mr-2 h-5 w-5" /> AGREGAR SOLICITANTE
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Input className={cn("h-11", readOnlyStyles)} value={formData.solicitante} readOnly tabIndex={-1} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">FICHA</Label>
                  <Input className={cn("h-12 text-lg", readOnlyStyles)} value={formData.fichaSolicitante} readOnly tabIndex={-1} />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">CARGO</Label>
                  <Input className={cn("h-12 text-lg", readOnlyStyles)} value={formData.cargoSolicitante} readOnly tabIndex={-1} />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">DEPARTAMENTO</Label>
                  <Input className={cn("h-12 text-lg", readOnlyStyles)} value={formData.departamentoSolicitante} readOnly tabIndex={-1} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authorization - Static/Configured */}
          <Card className="bg-muted/10 border-border/50">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-2xl font-black flex items-center gap-2 text-foreground uppercase">
                <ShieldCheck className="h-7 w-7 text-primary" />
                AUTORIZACIÓN
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <Label className="text-sm font-black text-foreground font-black uppercase tracking-tight">AUTORIZADO POR</Label>
                <Input className={cn("h-11 text-lg font-black uppercase border-border/60 shadow-sm", readOnlyStyles)} value={formData.autorizadoPor} readOnly tabIndex={-1} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-black text-foreground font-black uppercase tracking-tight">CARGO</Label>
                <Input className={cn("h-11 text-base font-black uppercase border-border/60 shadow-sm", readOnlyStyles)} value={formData.cargoAutorizador} readOnly tabIndex={-1} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-black text-foreground font-black uppercase tracking-tight">FICHA</Label>
                <Input className={cn("h-11 text-lg font-black uppercase border-border/60 shadow-sm", readOnlyStyles)} value={formData.fichaAutorizador} readOnly tabIndex={-1} />
              </div>
            </CardContent>
          </Card>



          {/* Materials Table */}
          <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-2xl font-black flex items-center gap-2 text-foreground uppercase">
                <FileText className="h-7 w-7 text-primary" />
                DETALLE DE MATERIALES
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <MaterialsTable items={items} onItemsChange={setItems} />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pb-10">
            <Button type="button" onClick={handleReset} className="h-14 px-8 font-black text-xl shadow-lg hover:shadow-xl transition-all">
              <RotateCcw className="h-5 w-5 mr-3" /> LIMPIAR FORMULARIO
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-14 px-12 font-black text-xl shadow-lg hover:shadow-xl transition-all">
              {isSubmitting ? (
                <><span className="h-5 w-5 mr-3 animate-spin rounded-full border-3 border-current border-t-transparent" /> PROCESANDO...</>
              ) : (
                <><Send className="h-5 w-5 mr-3" /> REGISTRAR PASE</>
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
        vehiculosDisponibles={vehiculos}
      />

      {/* Custom Validation Modal */}
      <Dialog open={validationModal.isOpen} onOpenChange={(open) => setValidationModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-lg border-t-8 border-t-destructive">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-destructive font-black text-2xl uppercase">
              <AlertTriangle className="h-8 w-8" />
              {validationModal.title}
            </DialogTitle>
            <DialogDescription className="text-lg text-foreground font-black uppercase tracking-tight pt-4 font-bold">
              {validationModal.message}
            </DialogDescription>
          </DialogHeader>
          {validationModal.fields.length > 0 && (
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 mt-4">
              <ul className="grid grid-cols-1 gap-3">
                {validationModal.fields.map((field, i) => (
                  <li key={i} className="text-base font-black text-destructive flex items-center gap-3">
                    <div className="size-2 rounded-full bg-destructive shadow-sm" />
                    {field.toUpperCase()}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter className="pt-6">
            <Button type="button" variant="destructive" className="w-full h-12 font-black text-lg uppercase tracking-wider" onClick={() => setValidationModal(prev => ({ ...prev, isOpen: false }))}>
              ENTENDIDO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MaterialPassPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <MaterialPassForm />
    </Suspense>
  );
}
