"use client";

import React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  MaterialsTable,
  type MaterialItem,
} from "@/components/materials-table";
import { SignaturePad } from "@/components/signature-pad";
import {
  FileText,
  User,
  Users,
  Calendar,
  Clock,
  Hash,
  Send,
  RotateCcw,
  CheckCircle2,
  Building2,
  Truck,
} from "lucide-react";

export default function MaterialPassPage() {
  const [formData, setFormData] = useState({
    folio: `PM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    concepto: "",
    emisor: "",
    receptor: "",
    observaciones: "",
  });

  const [items, setItems] = useState<MaterialItem[]>([
    {
      id: "1",
      cantidad: "2",
      unidad: "Und",
      descripcion: "Laptop HP ProBook 450 G8 - S/N: 5CD1234ABC",
    },
    {
      id: "2",
      cantidad: "1",
      unidad: "Und",
      descripcion: 'Monitor Dell P2419H 24" - S/N: CN-0P2419H-FCC00',
    },
    {
      id: "3",
      cantidad: "3",
      unidad: "Pza",
      descripcion: "Cable HDMI 2.0 - 1.8m",
    },
  ]);

  const [signature, setSignature] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
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
      concepto: "",
      emisor: "",
      receptor: "",
      observaciones: "",
    });
    setItems([]);
    setSignature(null);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-lg animate-slideInDown">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  SoporteFerrominerito
                </h1>
                <p className="text-xs text-primary-foreground/70">
                  Sistema de Gestión de Pases
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

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Header Card */}
          <Card className="border-t-4 border-t-primary animate-slideInUp">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Pase de Materiales
                </h2>
                <span className="ml-auto px-3 py-1 bg-primary/10 text-primary text-sm font-mono rounded-md flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {formData.folio}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Concepto */}
                <div className="md:col-span-3 space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Concepto
                  </label>
                  <Input
                    placeholder="Ej: Traslado de equipos para mantenimiento preventivo"
                    value={formData.concepto}
                    onChange={(e) =>
                      handleInputChange("concepto", e.target.value)
                    }
                    className="h-11"
                    required
                  />
                </div>

                {/* Emisor */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Emisor (Origen)
                  </label>
                  <Input
                    placeholder="Departamento / Área"
                    value={formData.emisor}
                    onChange={(e) =>
                      handleInputChange("emisor", e.target.value)
                    }
                    className="h-11"
                    required
                  />
                </div>

                {/* Receptor */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Receptor (Destino)
                  </label>
                  <Input
                    placeholder="Departamento / Área"
                    value={formData.receptor}
                    onChange={(e) =>
                      handleInputChange("receptor", e.target.value)
                    }
                    className="h-11"
                    required
                  />
                </div>

                {/* Responsable */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Responsable
                  </label>
                  <Input
                    placeholder="Nombre del responsable"
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Materials Table Card */}
          <Card
            className="animate-slideInUp"
            style={{ animationDelay: "0.1s", animationFillMode: "both" }}
          >
            <CardContent className="pt-6">
              <MaterialsTable items={items} onItemsChange={setItems} />
            </CardContent>
          </Card>

          {/* Observations & Signature Card */}
          <Card
            className="animate-slideInUp"
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          >
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Observations */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Observaciones
                  </label>
                  <Textarea
                    placeholder="Notas adicionales, condiciones especiales, instrucciones de manejo..."
                    value={formData.observaciones}
                    onChange={(e) =>
                      handleInputChange("observaciones", e.target.value)
                    }
                    className="min-h-[128px] resize-none"
                  />
                </div>

                {/* Signature */}
                <div>
                  <SignaturePad onSignatureChange={setSignature} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-3 justify-end pb-6 animate-slideInUp"
            style={{ animationDelay: "0.3s", animationFillMode: "both" }}
          >
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
              disabled={isSubmitting || items.length === 0}
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

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
            <span>
              TechSupport Pro - Sistema de Gestión de Soporte Técnico Industrial
            </span>
            <span>v1.0.0 | Todos los derechos reservados</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
