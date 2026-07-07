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
import { Header } from "@/components/header";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { AddEntityModal } from "@/components/add-entity-modal";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Destino {
  id: number;
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
    conductorId: null as number | null,
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
      // 1. Check if there's a manual override in sessionStorage (clears on refresh)
      const sessionFolio = sessionStorage.getItem("fmo_folio_override");
      
      // 2. Check localStorage for initial setting from Configuration view
      const savedAjustes = localStorage.getItem("fmo_pases_settings");
      let startFolio = sessionFolio;

      if (savedAjustes) {
        const settings = JSON.parse(savedAjustes);
        if (settings.ultimoFolio) {
          startFolio = settings.ultimoFolio;
          // Move from localStorage to sessionStorage so it persists for this session
          sessionStorage.setItem("fmo_folio_override", startFolio as string);
          // Clear from localStorage so it's not reused after a hard refresh/re-entry
          settings.ultimoFolio = "";
          localStorage.setItem("fmo_pases_settings", JSON.stringify(settings));
        }
      }

      if (startFolio) {
        setFormData(prev => ({ ...prev, folio: startFolio }));
        return;
      }

      // 3. API call with internal fallback for 500/errors
      try {
        const data = await api.get<{ numeroPase: string }>("/pases/ultimo-numero");
        if (data && data.numeroPase) {
          const currentNum = parseInt(data.numeroPase.replace(/\D/g, ""));
          if (!isNaN(currentNum)) {
            const nextNum = (currentNum + 1).toString().padStart(data.numeroPase.length, "0");
            setFormData(prev => ({ ...prev, folio: nextNum }));
            return;
          }
        }
      } catch (e) {
        console.warn("No se pudo obtener el último pase desde /ultimo-numero, buscando en el historial...", e);
        try {
          // Fallback: Fetch all pases and get LAST record's number + 1
          const pases = await api.get<any[]>("/pases");
          if (pases && pases.length > 0) {
            const lastPase = pases[pases.length - 1];
            const lastNum = parseInt(String(lastPase.numeroPase).replace(/\D/g, ""));
            
            if (!isNaN(lastNum)) {
              const nextNum = (lastNum + 1).toString().padStart(5, "0");
              setFormData(prev => ({ ...prev, folio: nextNum }));
              return;
            }
          }
        } catch (historyError) {
          console.error("Error al buscar en el historial:", historyError);
        }
      }

      setFormData(prev => ({ ...prev, folio: "00001" }));
    } catch (error) {
      console.error("Error al obtener el último número:", error);
      setFormData(prev => ({ ...prev, folio: "00001" }));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const assignConductorToVehicle = async (conductorId: number, newVehicleId: number) => {
    try {
      const currentVehiculos = await api.get<any[]>("/vehiculos");
      const oldVehicle = currentVehiculos.find(v =>
        v.conductores?.some((c: any) => c.id === conductorId)
      );
      if (oldVehicle && oldVehicle.id !== newVehicleId) {
        await api.patch(`/vehiculos/${oldVehicle.id}`, { conductores: [] });
      }
      await api.patch(`/vehiculos/${newVehicleId}`, { conductores: [{ id: conductorId }] });
      const updatedVehiculos = await api.get<any[]>("/vehiculos");
      setVehiculos(updatedVehiculos);
    } catch (error) {
      console.error("Error al actualizar asignación del vehículo:", error);
    }
  };

  const [items, setItems] = useState<MaterialItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [openDestino, setOpenDestino] = useState(false);
  const [openConductor, setOpenConductor] = useState(false);
  const [openVehiculo, setOpenVehiculo] = useState(false);
  const [openDespachador, setOpenDespachador] = useState(false);
  const [isLibre, setIsLibre] = useState(false);
  const [openSolicitante, setOpenSolicitante] = useState(false);
  const [isChangingVehicle, setIsChangingVehicle] = useState(false);

  const [modalType, setModalType] = useState<"destino" | "empleado" | "vehiculo" | null>(null);
  const [modalRole, setModalRole] = useState<string | null>(null);

  const openAddModal = (type: "destino" | "empleado" | "vehiculo", role?: string) => {
    setModalType(type);
    setModalRole(role || null);
  };

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const formattedTime = today.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setFormData((prev) => ({
      ...prev,
      fecha: formattedDate,
      hora: formattedTime,
    }));

    if (!editId) {
      fetchUltimoNumero();
    }
  }, []);

  useEffect(() => {
    if (editId) {
      loadEditData(editId);
    } else {
      setIsEditing(false);
      const savedAjustes = localStorage.getItem("fmo_pases_settings");
      if (savedAjustes) {
        const settings = JSON.parse(savedAjustes);
        setFormData(prev => ({
          ...prev,
          autorizadoPor: settings.gerenteNombre || "Carmen Marquez",
          cargoAutorizador: settings.gerenteCargo || "Gerente de Telemática (e)",
          fichaAutorizador: settings.gerenteFicha || "15508",
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

      // Removed redundant fetchUltimoNumero() to preserve manual override
    }
  }, [editId]);

  const [originalIds, setOriginalIds] = useState<any>({});

  const loadEditData = async (id: string) => {
    try {
      const pase = await api.get<any>(`/pases/${id}`);
      setIsEditing(true);

      const d = new Date(pase.fecha_emision);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, -1);

      setOriginalIds({
        solicitadorId: pase.solicitador?.id,
        conductorId: pase.conductor?.id,
        despachadorId: pase.despachador?.id,
        autorizadorId: pase.autorizador?.id,
        destinoId: pase.destino?.id,
        vehiculoId: pase.vehiculo?.id,
        solicitud: pase.solicitud,
      });
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
        conductorId: pase.conductor?.id || null,
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
        observaciones: pase.observaciones || "",
        solicitante: pase.solicitador?.nombre || "",
        fichaSolicitante: pase.solicitador?.ficha || "",
        cargoSolicitante: pase.solicitador?.cargo || "",
        departamentoSolicitante: pase.solicitador?.departamento || "",
      }));

      if (pase.observaciones && !pase.solicitador) {
        setIsLibre(true);
      }

      if (pase.equiposPases && pase.equiposPases.length > 0) {
        const loadedItems = pase.equiposPases.map((ep: any) => ({
          id: ep.equipo?.id || Math.random().toString(),
          cantidad: ep.cantidad,
          unidad: ep.equipo?.unidad || "UND",
          producto: ep.equipo?.nombre || "",
          marca: ep.equipo?.marca || "",
          tipoIdentificador: ep.equipo?.fmo ? "FMO" : (ep.equipo?.serial ? "Serial" : "S/N"),
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = [
      { field: 'folio', name: 'N° Pase' },
      { field: 'conceptoOpcion', name: 'Tipo de Movimiento' },

      { field: 'embargueseA', name: 'Embárguese a' },
      { field: 'direccion', name: 'Dirección' },
      { field: 'telefono', name: 'Teléfono' },
      { field: 'conductor', name: 'Conductor' },
      { field: 'fichaConductor', name: 'Ficha Conductor' },
      { field: 'despachadoPor', name: 'Material Despachado Por' },
      { field: 'fichaDespachador', name: 'Ficha Despachador' },
      ...(!isLibre ? [{ field: 'solicitante' as const, name: 'Solicitante' }] : []),
    ];
    const missingFields = requiredFields.filter(rf => !formData[rf.field as keyof typeof formData]);
    
    // Check if any material item has missing mandatory fields (except brand)
    const hasInvalidItems = items.some(item => 
      !item.cantidad || !item.unidad || !item.producto || (item.tipoIdentificador !== "S/N" && !item.identificadores)
    );

    if (hasInvalidItems) {
      missingFields.push({ field: 'items_fields', name: 'Detalles de Materiales (Cant., Unidad, Producto y Valores son obligatorios)' });
    }

    if (!formData.vehiculoFMO && !formData.vehiculoParticular) {
      missingFields.push({ field: 'vehiculo', name: 'Vehículo (FMO o Particular)' });
    }
    if (items.length === 0) {
      missingFields.push({ field: 'items', name: 'Materiales (al menos 1)' });
    }
    if (missingFields.length > 0) {
      setValidationModal({
        isOpen: true,
        title: "Campos Requeridos",
        message: "Por favor complete los siguientes campos obligatorios:",
        fields: missingFields.map(f => f.name)
      });
      return;
    }
    setIsSubmitting(true);
    const getEmpleadoId = (ficha: string, role?: string, originalId?: number | null) => {
      const emp = empleados.find((e) => 
        e.ficha === ficha && 
        (!role || e.rol?.toLowerCase() === role.toLowerCase())
      );
      
      // Fallback para el Autorizador (Gerente) que puede no tener rol en el frontend pero sí en la BD
      if (!emp && ficha === formData.fichaAutorizador) {
        const gerente = empleados.find(e => e.ficha === ficha);
        if (gerente) return gerente.id;
      }

      if (emp) return emp.id;
      return originalId || null;
    };
    const paseBody = {
      numeroPase: formData.folio,
      concepto: formData.conceptoOpcion,
      destinoId: destinos.find((d) => d.nombre === formData.embargueseA)?.id || originalIds.destinoId || null,
      numero_compra: formData.ordenCompra,
      tipo_pago: formData.tipoPago,
      solicitadorId: getEmpleadoId(formData.fichaSolicitante, "Solicitante", originalIds.solicitadorId),
      conductorId: getEmpleadoId(formData.fichaConductor, "Conductor", originalIds.conductorId),
      despachadorId: getEmpleadoId(formData.fichaDespachador, "Despachador", originalIds.despachadorId),
      autorizadorId: getEmpleadoId(formData.fichaAutorizador, "autorizador", originalIds.autorizadorId),
      observaciones: formData.observaciones,
      tiempo_estimado: formData.tiempoEstimado,
      equipos: items.map((item) => {
        const rawValues = item.identificadores ? item.identificadores.split(',').map(f => f.trim()).filter(f => f !== "") : [];
        const isFMO = item.tipoIdentificador === "FMO";
        const isSerial = item.tipoIdentificador === "Serial";
        let cantidad = typeof item.cantidad === "string" ? parseInt(item.cantidad) : item.cantidad;
        if (isNaN(cantidad)) cantidad = 1;
        
        return {
          id: !isNaN(Number(item.id)) ? Number(item.id) : undefined,
          marca: item.marca,
          descripcion: item.producto,
          cantidad: cantidad,
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
      if (!isEditing) {
        // Clear session override
        sessionStorage.removeItem("fmo_folio_override");

        const savedAjustes = localStorage.getItem("fmo_pases_settings");
        if (savedAjustes) {
          const settings = JSON.parse(savedAjustes);
          // Clear permanent override after use
          if (settings.ultimoFolio) {
            settings.ultimoFolio = "";
            localStorage.setItem("fmo_pases_settings", JSON.stringify(settings));
          }
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
        dirigidoA: "", // Fixed: destination was duplicated here
        solicitud: formData.conceptoOpcion,
        conceptoNombre: formData.conceptoOpcion,
        autorizadoPor: formData.autorizadoPor,
        cargoAutorizador: formData.cargoAutorizador,
        fichaAutorizador: formData.fichaAutorizador,
        solicitante: formData.solicitante,
        fichaSolicitante: formData.fichaSolicitante,
        cargoSolicitante: formData.cargoSolicitante,
        departamentoSolicitante: formData.departamentoSolicitante,
        observaciones: formData.observaciones,
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
      conceptoOpcion: "",
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
      conductorId: null,
      solicitud: "",
      observaciones: "",
      solicitante: "",
      fichaSolicitante: "",
      cargoSolicitante: "",
      departamentoSolicitante: "",
    }));
    setIsLibre(false);
    fetchUltimoNumero();
    setItems([]);
    setOriginalIds({});
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
                          <CommandGroup>
                            <CommandItem onSelect={() => { openAddModal("destino"); setOpenDestino(false); }} className="text-primary font-black py-3">
                              <Plus className="mr-2 h-5 w-5" /> AGREGAR NUEVO DESTINO
                            </CommandItem>
                          </CommandGroup>
                          <CommandSeparator />
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
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Input className={cn("h-11", readOnlyStyles)} value={formData.embargueseA} readOnly tabIndex={-1} />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">TELÉFONO</Label>
                <Input type="tel" className={cn("h-12 text-lg", readOnlyStyles)} value={formData.telefono} readOnly tabIndex={-1} />
              </div>
              <div className="space-y-3 md:col-span-2">
                <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">DIRECCIÓN</Label>
                <Input className={cn("h-12 text-lg", readOnlyStyles)} value={formData.direccion} readOnly tabIndex={-1} />
              </div>
            </CardContent>
          </Card>

          {formData.conceptoOpcion === "VENDIDO" && (
            <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-2xl font-black flex items-center gap-2 text-foreground">
                  <CreditCard className="h-7 w-7 text-primary" />
                  DATOS DE PAGO
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">N° ORDEN DE COMPRA</Label>
                  <Input className={cn("h-12 text-lg", inputStyles)} value={formData.ordenCompra} onChange={(e) => handleInputChange("ordenCompra", e.target.value)} />
                </div>
                <div className="space-y-3 pt-1">
                  <Label className="block mb-4 text-base font-black text-foreground font-black uppercase tracking-tight">MÉTODO DE PAGO</Label>
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
          )}

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
                          <CommandGroup>
                            <CommandItem onSelect={() => { openAddModal("empleado", "Conductor"); setOpenConductor(false); }} className="text-primary font-black py-3">
                              <Plus className="mr-2 h-5 w-5" /> AGREGAR NUEVO CONDUCTOR
                            </CommandItem>
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandEmpty className="p-4 text-center">No se encontró el conductor.</CommandEmpty>
                          <CommandGroup heading="Conductores">
                            {empleados.filter((e) => e.rol?.toLowerCase() === "conductor").map((emp) => (
                              <CommandItem key={emp.id} value={`${emp.nombre} ${emp.ficha}`} onSelect={() => {
                                handleInputChange("conductor", emp.nombre);
                                handleInputChange("fichaConductor", emp.ficha);
                                handleInputChange("conductorId", emp.id);
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
                                }
                                setOpenConductor(false);
                              }} className="py-3">
                                <Check className={cn("mr-2 h-4 w-4", formData.fichaConductor === emp.ficha ? "opacity-100" : "opacity-0")} />
                                <div className="flex flex-col">
                                  <span className="font-bold">{emp.nombre}</span>
                                  <span className="text-xs text-muted-foreground">Ficha: {emp.ficha}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Input className={cn("h-11", readOnlyStyles)} value={formData.fichaConductor} readOnly placeholder="Ficha / C.I." tabIndex={-1} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">IDENTIFICACIÓN DEL VEHÍCULO</Label>
                    {!isChangingVehicle && (formData.vehiculoFMO || formData.vehiculoParticular) && (
                      <Button variant="ghost" size="sm" onClick={() => setIsChangingVehicle(true)} className="h-6 text-xs text-primary font-black">
                        CAMBIAR
                      </Button>
                    )}
                  </div>

                  {(isChangingVehicle || (!formData.vehiculoFMO && !formData.vehiculoParticular)) ? (
                    <Popover open={openVehiculo} onOpenChange={setOpenVehiculo}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          role="combobox" 
                          className={cn("w-full h-12 justify-between text-lg", inputStyles)}
                          onKeyDown={(e) => { if (e.key === "Enter") setOpenVehiculo(true); }}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Truck className="h-5 w-5 text-primary/70" />
                            Seleccionar vehículo...
                          </div>
                          <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar por placa o FMO..." className="h-12" />
                          <CommandList>
                            <CommandGroup>
                              <CommandItem onSelect={() => { openAddModal("vehiculo"); setOpenVehiculo(false); }} className="text-primary font-black py-3">
                                <Plus className="mr-2 h-5 w-5" /> AGREGAR NUEVO VEHÍCULO
                              </CommandItem>
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandEmpty className="p-4 text-center">No se encontró el vehículo.</CommandEmpty>
                            <CommandGroup heading="Vehículos de la Empresa (FMO)">
                              {vehiculos.filter(v => v.esFMO).map((veh) => (
                                <CommandItem key={veh.id} value={`${veh.fmo} ${veh.placa}`} onSelect={() => {
                                  handleInputChange("vehiculoId", veh.id);
                                  handleInputChange("vehiculoFMO", veh.fmo);
                                  handleInputChange("vehiculoParticular", veh.placa || "");
                                  setOpenVehiculo(false);
                                  setIsChangingVehicle(false);
                                  if (formData.conductorId) {
                                    assignConductorToVehicle(formData.conductorId, veh.id);
                                  }
                                }} className="py-3">
                                  <div className="flex flex-col">
                                    <span className="font-bold">FMO: {veh.fmo}</span>
                                    <span className="text-xs text-muted-foreground">Placa: {veh.placa || "N/A"}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup heading="Vehículos Particulares">
                              {vehiculos.filter(v => !v.esFMO).map((veh) => (
                                <CommandItem key={veh.id} value={veh.placa} onSelect={() => {
                                  handleInputChange("vehiculoId", veh.id);
                                  handleInputChange("vehiculoFMO", "");
                                  handleInputChange("vehiculoParticular", veh.placa);
                                  setOpenVehiculo(false);
                                  setIsChangingVehicle(false);
                                  if (formData.conductorId) {
                                    assignConductorToVehicle(formData.conductorId, veh.id);
                                  }
                                }} className="py-3">
                                  <span className="font-bold">Placa: {veh.placa}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">VEHÍCULO F.M.O.</span>
                        <Input className={cn("h-11", readOnlyStyles)} value={formData.vehiculoFMO || "N/A"} readOnly tabIndex={-1} />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">PLACA / PARTICULAR</span>
                        <Input className={cn("h-11", readOnlyStyles)} value={formData.vehiculoParticular || "N/A"} readOnly tabIndex={-1} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-2xl font-black flex items-center gap-2 text-foreground uppercase">
                <UserCheck className="h-7 w-7 text-primary" />
                DESPACHO
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">MATERIAL DESPACHADO POR</Label>
                  <Popover open={openDespachador} onOpenChange={setOpenDespachador}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        role="combobox" 
                        className={cn("w-full h-12 justify-between text-lg", inputStyles)}
                        onKeyDown={(e) => { if (e.key === "Enter") setOpenDespachador(true); }}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <User className="h-5 w-5 text-primary/70" />
                          {formData.despachadoPor || "Seleccionar despachador..."}
                        </div>
                        <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar despachador..." className="h-12" />
                        <CommandList>
                          <CommandGroup>
                            <CommandItem onSelect={() => { openAddModal("empleado", "Despachador"); setOpenDespachador(false); }} className="text-primary font-black py-3">
                              <Plus className="mr-2 h-5 w-5" /> AGREGAR NUEVO DESPACHADOR
                            </CommandItem>
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandEmpty className="p-4 text-center">No se encontró el empleado.</CommandEmpty>
                          <CommandGroup heading="Despachadores">
                            {empleados
                              .filter((e) => e.rol?.toLowerCase() === "despachador")
                              .map((emp) => (
                                <CommandItem key={emp.id} value={`${emp.nombre} ${emp.ficha}`} onSelect={() => {
                                  handleInputChange("despachadoPor", emp.nombre);
                                  handleInputChange("fichaDespachador", emp.ficha);
                                  handleInputChange("cargoDespachador", emp.cargo || "");
                                  handleInputChange("departamentoDespachador", emp.departamento || "");
                                  setOpenDespachador(false);
                                }} className="py-3">
                                  <Check className={cn("mr-2 h-4 w-4", formData.fichaDespachador === emp.ficha ? "opacity-100" : "opacity-0")} />
                                  <div className="flex flex-col">
                                    <span className="font-bold">{emp.nombre}</span>
                                    <span className="text-xs text-muted-foreground">Ficha: {emp.ficha} • {emp.cargo}</span>
                                  </div>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">FICHA</span>
                    <Input className={cn("h-11", readOnlyStyles)} value={formData.fichaDespachador} readOnly tabIndex={-1} />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">CARGO</span>
                    <Input className={cn("h-11", readOnlyStyles)} value={formData.cargoDespachador} readOnly tabIndex={-1} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-2xl font-black flex items-center gap-2 text-foreground uppercase">
                <UserCheck className="h-7 w-7 text-primary" />
                SOLICITANTE
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex gap-2 mb-6">
                <Button
                  type="button"
                  variant={!isLibre ? "default" : "outline"}
                  size="sm"
                  className="flex-1 h-12 text-lg font-black"
                  onClick={() => {
                    setIsLibre(false);
                  }}
                >
                  <User className="h-5 w-5 mr-2" />
                  SOLICITANTE
                </Button>
                <Button
                  type="button"
                  variant={isLibre ? "default" : "outline"}
                  size="sm"
                  className="flex-1 h-12 text-lg font-black"
                  onClick={() => {
                    setIsLibre(true);
                    handleInputChange("solicitante", "");
                    handleInputChange("fichaSolicitante", "");
                    handleInputChange("cargoSolicitante", "");
                    handleInputChange("departamentoSolicitante", "");
                    setOpenSolicitante(false);
                  }}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  LIBRE
                </Button>
              </div>
              {!isLibre ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">SOLICITANTE</Label>
                    <Popover open={openSolicitante} onOpenChange={setOpenSolicitante}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          role="combobox" 
                          className={cn("w-full h-12 justify-between text-lg", inputStyles)}
                          onKeyDown={(e) => { if (e.key === "Enter") setOpenSolicitante(true); }}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <User className="h-5 w-5 text-primary/70" />
                            {formData.solicitante || "Seleccionar solicitante..."}
                          </div>
                          <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar solicitante..." className="h-12" />
                          <CommandList>
                            <CommandGroup>
                              <CommandItem onSelect={() => { openAddModal("empleado", "Solicitante"); setOpenSolicitante(false); }} className="text-primary font-black py-3">
                                <Plus className="mr-2 h-5 w-5" /> AGREGAR NUEVO SOLICITANTE
                              </CommandItem>
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandEmpty className="p-4 text-center">No se encontró el empleado.</CommandEmpty>
                            <CommandGroup heading="Solicitantes">
                              {empleados
                                .filter((e) => e.rol?.toLowerCase() === "solicitante")
                                .map((emp) => (
                                  <CommandItem key={emp.id} value={`${emp.nombre} ${emp.ficha}`} onSelect={() => {
                                    handleInputChange("solicitante", emp.nombre);
                                    handleInputChange("fichaSolicitante", emp.ficha);
                                    handleInputChange("cargoSolicitante", emp.cargo || "");
                                    handleInputChange("departamentoSolicitante", emp.departamento || "");
                                    setOpenSolicitante(false);
                                  }} className="py-3">
                                    <Check className={cn("mr-2 h-4 w-4", formData.fichaSolicitante === emp.ficha ? "opacity-100" : "opacity-0")} />
                                    <div className="flex flex-col">
                                      <span className="font-bold">{emp.nombre}</span>
                                      <span className="text-xs text-muted-foreground">Ficha: {emp.ficha} • {emp.cargo}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">FICHA</span>
                      <Input className={cn("h-11", readOnlyStyles)} value={formData.fichaSolicitante} readOnly tabIndex={-1} />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">CARGO</span>
                      <Input className={cn("h-11", readOnlyStyles)} value={formData.cargoSolicitante} readOnly tabIndex={-1} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label className="text-base font-black text-foreground font-black uppercase tracking-tight">OBSERVACIÓN / COMENTARIO</Label>
                  <Textarea
                    className={cn("min-h-[120px] text-base", inputStyles)}
                    placeholder="Escriba cualquier observación o comentario..."
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange("observaciones", e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-2xl font-black flex items-center gap-2 text-foreground">
                <Monitor className="h-7 w-7 text-primary" />
                MATERIALES / EQUIPOS
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <MaterialsTable items={items} onItemsChange={setItems} />
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" size="lg" className="flex-1 h-16 text-xl font-black border-2 border-border/50 hover:bg-muted/50" onClick={handleReset} disabled={isSubmitting}>
              <RotateCcw className="h-6 w-6 mr-3" />
              LIMPIAR FORMULARIO
            </Button>
            <Button type="submit" size="lg" className="flex-[2] h-16 text-xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-100" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full" />
                  PROCESANDO...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Send className="h-6 w-6 mr-1" />
                  {isEditing ? "GUARDAR CAMBIOS" : "REGISTRAR Y GENERAR PDF"}
                </div>
              )}
            </Button>
          </div>
        </form>
      </main>

      <AddEntityModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        type={modalType || "empleado"}
        role={modalRole || undefined}
        onSuccess={async (result?: any) => {
          if (modalType === "destino") {
            const data = await api.get<Destino[]>("/destinos");
            setDestinos(data);
          } else if (modalType === "empleado") {
            const data = await api.get<any[]>("/empleados");
            setEmpleados(data);
          } else if (modalType === "vehiculo") {
            const data = await api.get<any[]>("/vehiculos");
            setVehiculos(data);
            if (formData.conductorId && result?.id) {
              await assignConductorToVehicle(formData.conductorId, result.id);
            }
          }
          setModalType(null);
        }}
      />

      <Dialog open={validationModal.isOpen} onOpenChange={(open) => setValidationModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-md border-destructive/20 shadow-2xl">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-foreground">
              {validationModal.title}
            </DialogTitle>
            <DialogDescription className="text-center text-base font-medium pt-2">
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MaterialPassPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <MaterialPassForm />
    </Suspense>
  );
}
