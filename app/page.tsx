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
} from "lucide-react";

export default function MaterialPassPage() {
  const [formData, setFormData] = useState({
    folio: `PM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    
    // Concept Options
    conceptoOpcion: "PRESTAMO",
    
    // Shipping / General Info
    tiempoEstimado: "",
    embargueseA: "",
    ordenCompra: "",
    direccion: "",
    telefono: "",
    tipoPago: "CONTADO", // Contado or Credito
    
    // Driver Info
    conductor: "",
    fichaConductor: "",
    vehiculoFMO: "",
    vehiculoParticular: "",
    
    // Dispatch Info
    despachadoPor: "",
    fichaDespachador: "",
    cargoDespachador: "",
    departamentoDespachador: "",
    
    // Observations / Request
    observaciones: "",
    dirigidoA: "",
    solicitud: "", // Example: LEIDA AYALA F-12197 /CPU FMO-1195848
  });

  const [items, setItems] = useState<MaterialItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      folio: `PM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
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
      tipoPago: "CONTADO",
      conductor: "",
      fichaConductor: "",
      vehiculoFMO: "",
      vehiculoParticular: "",
      despachadoPor: "",
      fichaDespachador: "",
      cargoDespachador: "",
      departamentoDespachador: "",
      observaciones: "",
      dirigidoA: "",
      solicitud: "",
    });
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

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-lg mb-8">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  PASE PARA MATERIALES Y MISCELÁNEOS
                </h1>
                <p className="text-xs text-primary-foreground/70">
                  Sistema de Gestión de Pases FMO
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Calendar className="h-4 w-4" />
                <span>{formData.fecha}</span>
                <Clock className="h-4 w-4 ml-2" />
                <span>{formData.hora}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Concept Options */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Concepto del Pase
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
               <RadioGroup 
                  value={formData.conceptoOpcion} 
                  onValueChange={(val) => handleInputChange("conceptoOpcion", val)}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {["DONACION", "DEVOLUCION", "PRESTAMO", "REPARACION", "REVISION", "VENDIDO", "FORANEO"].map((opcion) => (
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
                      <span className="font-medium text-base text-foreground">{opcion}</span>
                    </label>
                  ))}
               </RadioGroup>
               <div className="mt-4 pt-4 border-t border-slate-300">
                  <Label>Tiempo Estimado de Regreso a la Empresa</Label>
                  <Input 
                    className="mt-2 border-slate-600"
                    placeholder="Ej. 3 días, 1 semana, Indefinido..." 
                    value={formData.tiempoEstimado}
                    onChange={(e) => handleInputChange("tiempoEstimado", e.target.value)}
                  />
               </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card className="border-slate-300">
            <CardHeader className="pb-3 border-b border-slate-300">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Datos de Envío y Destino
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2 md:col-span-2">
                  <Label>Embárguese a (Nombre / Empresa)</Label>
                  <Input 
                    className="border-slate-400"
                    value={formData.embargueseA}
                    onChange={(e) => handleInputChange("embargueseA", e.target.value)}
                  />
               </div>
               <div className="space-y-2">
                  <Label>N° Orden de Compra</Label>
                  <Input 
                    className="border-slate-400"
                    value={formData.ordenCompra}
                    onChange={(e) => handleInputChange("ordenCompra", e.target.value)}
                  />
               </div>
               <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input 
                     type="tel"
                     className="border-slate-400"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange("telefono", e.target.value)}
                  />
               </div>
               <div className="space-y-2 md:col-span-2">
                  <Label>Dirección</Label>
                  <Input 
                    className="border-slate-400"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange("direccion", e.target.value)}
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
                      <RadioGroupItem value="CONTADO" id="contado" className="border-slate-500 w-5 h-5 transition-none duration-0"/>
                      <span className="text-base font-medium">Contado</span>
                    </label>
                    <label 
                      className="flex items-center space-x-2 cursor-pointer"
                      htmlFor="credito"
                    >
                      <RadioGroupItem value="CREDITO" id="credito" className="border-slate-500 w-5 h-5 transition-none duration-0"/>
                      <span className="text-base font-medium">Crédito</span>
                    </label>
                  </RadioGroup>
               </div>
            </CardContent>
          </Card>

          {/* Driver & Vehicle */}
          <Card className="border-slate-300">
            <CardHeader className="pb-3 border-b border-slate-300">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Conductor y Vehículo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre del Conductor</Label>
                <Input 
                  className="border-slate-400"
                  value={formData.conductor}
                  onChange={(e) => handleInputChange("conductor", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ficha o C.I.</Label>
                <Input 
                  className="border-slate-400"
                  value={formData.fichaConductor}
                  onChange={(e) => handleInputChange("fichaConductor", e.target.value)}
                />
              </div>
              <div className="md:col-span-2 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vehículo F.M.O</Label>
                  <Input 
                    className="border-slate-400"
                    placeholder="Serial del vehículo"
                    value={formData.vehiculoFMO as string}
                    onChange={(e) => handleInputChange("vehiculoFMO", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vehículo Particular</Label>
                  <Input 
                    className="border-slate-400"
                    placeholder="Marca y Modelo"
                    value={formData.vehiculoParticular as string}
                    onChange={(e) => handleInputChange("vehiculoParticular", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

           {/* Dispatch Info */}
           <Card className="border-slate-300">
            <CardHeader className="pb-3 border-b border-slate-300">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Material Despachado Por
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Nombre</Label>
                <Input 
                  className="border-slate-400"
                  value={formData.despachadoPor}
                  onChange={(e) => handleInputChange("despachadoPor", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ficha</Label>
                <Input 
                  className="border-slate-400"
                  value={formData.fichaDespachador}
                  onChange={(e) => handleInputChange("fichaDespachador", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input 
                  className="border-slate-400"
                  value={formData.cargoDespachador}
                  onChange={(e) => handleInputChange("cargoDespachador", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Departamento</Label>
                <Input 
                  className="border-slate-400"
                  value={formData.departamentoDespachador}
                  onChange={(e) => handleInputChange("departamentoDespachador", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Observations & Others */}
          <Card className="border-slate-300">
            <CardHeader className="pb-3 border-b border-slate-300">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Detalles Adicionales
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               <div className="space-y-2">
                <Label>Observaciones</Label>
                <Textarea 
                  className="min-h-[100px] border-slate-400"
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange("observaciones", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dirigido a</Label>
                  <Input 
                    className="border-slate-400"
                    value={formData.dirigidoA}
                    onChange={(e) => handleInputChange("dirigidoA", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Solicitud (Ej: Nombre / Ficha / Dpto)</Label>
                  <Input 
                    className="border-slate-400"
                     placeholder="Ej: LEIDA AYALA F-12197 /CPU"
                    value={formData.solicitud}
                    onChange={(e) => handleInputChange("solicitud", e.target.value)}
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
                 <Label className="text-xs text-muted-foreground uppercase">Autorizado Por</Label>
                 <div className="font-medium text-lg">Carmen Marquez</div>
               </div>
               <div className="space-y-1">
                 <Label className="text-xs text-muted-foreground uppercase">Cargo</Label>
                 <div className="font-medium">Gerente de Telemática (e)</div>
               </div>
               <div className="space-y-1">
                 <Label className="text-xs text-muted-foreground uppercase">Ficha</Label>
                 <div className="font-medium">15508</div>
               </div>
               <div className="md:col-span-3 pt-6 border-t mt-2">
                 <div className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-muted-foreground bg-white">
                    Espacio para Firma y Sello Físico
                 </div>
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
              className="h-11 px-6 bg-transparent"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpiar Formulario
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-8"
            >
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
    </div>
  );
}
