"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { Loader2, UserPlus, MapPinPlus, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "empleado" | "destino";
  role?: string; // Specific for empleado
  onSuccess: (data: any) => void;
}

export function AddEntityModal({
  isOpen,
  onClose,
  type,
  role,
  onSuccess,
}: AddEntityModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [empleadoData, setEmpleadoData] = useState({
    ficha: "",
    nombre: "",
    departamento: "",
    cargo: "",
  });

  const [destinoData, setDestinoData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
  });

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setEmpleadoData({ ficha: "", nombre: "", departamento: "", cargo: "" });
      setDestinoData({ nombre: "", direccion: "", telefono: "" });
    }
  }, [isOpen]);

  const handleEmpleadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmpleadoData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDestinoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestinoData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (type === "empleado") {
        if (!empleadoData.ficha || !empleadoData.nombre) {
          throw new Error("La Ficha y el Nombre son obligatorios");
        }
        result = await api.post("/empleados", { ...empleadoData, rol: role });
      } else {
        if (!destinoData.nombre || !destinoData.direccion) {
          throw new Error("El Nombre y la Dirección son obligatorios");
        }
        result = await api.post("/destinos", destinoData);
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "bg-slate-50 border-slate-300 text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary h-10 transition-all";
  const labelClass = "text-sm font-semibold text-slate-700 uppercase tracking-tight";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
        <div className="bg-primary p-6 text-primary-foreground flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            {type === "empleado" ? <UserPlus className="h-6 w-6" /> : <MapPinPlus className="h-6 w-6" />}
          </div>
          <div>
            <DialogTitle className="text-xl font-bold">
              {type === "empleado" ? `Nuevo ${role}` : "Nuevo Destino"}
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80 text-xs mt-1">
              Los datos se guardarán como respuestas rápidas para futuros pases.
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-5 bg-white">
          <div className="space-y-4">
            {type === "empleado" ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ficha" className={labelClass}>
                    Ficha
                  </Label>
                  <Input
                    id="ficha"
                    name="ficha"
                    placeholder="Ej. 15508"
                    value={empleadoData.ficha}
                    onChange={handleEmpleadoChange}
                    className={cn("col-span-3 font-mono", inputClass)}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre" className={labelClass}>
                    Nombre
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    placeholder="Nombre completo"
                    value={empleadoData.nombre}
                    onChange={handleEmpleadoChange}
                    className={cn("col-span-3", inputClass)}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="departamento" className={cn(labelClass, "text-[10px]")}>
                    Depto.
                  </Label>
                  <Input
                    id="departamento"
                    name="departamento"
                    placeholder="Ej. Telemática"
                    value={empleadoData.departamento}
                    onChange={handleEmpleadoChange}
                    className={cn("col-span-3", inputClass)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cargo" className={labelClass}>
                    Cargo
                  </Label>
                  <Input
                    id="cargo"
                    name="cargo"
                    placeholder="Ej. Analista"
                    value={empleadoData.cargo}
                    onChange={handleEmpleadoChange}
                    className={cn("col-span-3", inputClass)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre_dest" className={labelClass}>
                    Nombre
                  </Label>
                  <Input
                    id="nombre_dest"
                    name="nombre"
                    placeholder="Nombre del destino"
                    value={destinoData.nombre}
                    onChange={handleDestinoChange}
                    className={cn("col-span-3", inputClass)}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="direccion" className={labelClass}>
                    Ubicación
                  </Label>
                  <Input
                    id="direccion"
                    name="direccion"
                    placeholder="Dirección exacta"
                    value={destinoData.direccion}
                    onChange={handleDestinoChange}
                    className={cn("col-span-3", inputClass)}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="telefono" className={labelClass}>
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    placeholder="Ej. +58..."
                    value={destinoData.telefono}
                    onChange={handleDestinoChange}
                    className={cn("col-span-3", inputClass)}
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium animate-shake text-center">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-6 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="text-slate-500 hover:bg-slate-100"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar Registro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
