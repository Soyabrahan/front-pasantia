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
import { Loader2, UserPlus, MapPinPlus, Save, Building2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "empleado" | "destino" | "vehiculo";
  role?: string; // Specific for empleado
  onSuccess: (data: any) => void;
  vehiculosDisponibles?: any[]; // Prop opcional para asignar al crear conductor
}

export function AddEntityModal({
  isOpen,
  onClose,
  type,
  role,
  onSuccess,
  vehiculosDisponibles = [],
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
  
  const [vehiculoData, setVehiculoData] = useState({
    placa: "",
    marca: "",
    modelo: "",
    esFMO: false,
    fmo: "",
    conductorId: "", // Para asignación inversa si se desea
  });

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setEmpleadoData({ ficha: "", nombre: "", departamento: "", cargo: role === "Conductor" ? "CONDUCTOR" : "" });
      setDestinoData({ nombre: "", direccion: "", telefono: "" });
      setVehiculoData({ placa: "", marca: "", modelo: "", esFMO: false, fmo: "", conductorId: "" });
    }
  }, [isOpen]);

  const [showVehicleFields, setShowVehicleFields] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [showNewDeptInput, setShowNewDeptInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get<any[]>("/departamentos").then(setDepartamentos).catch(() => {});
    }
  }, [isOpen]);

  const handleEmpleadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "ficha") {
      const numericVal = value.replace(/\D/g, "");
      setEmpleadoData((prev) => ({ ...prev, [name]: numericVal }));
    } else {
      setEmpleadoData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDestinoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestinoData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleVehiculoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (name === "fmo") {
      const numericVal = value.replace(/\D/g, "");
      setVehiculoData((prev) => ({ ...prev, [name]: numericVal }));
    } else {
      setVehiculoData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result: any;
      if (type === "empleado") {
        if (!empleadoData.ficha || !empleadoData.nombre || !empleadoData.departamento || (role !== "Conductor" && !empleadoData.cargo)) {
          throw new Error("Todos los campos del empleado son obligatorios");
        }

        // Si el departamento no existe, crearlo primero
        const existingDept = departamentos.find(d => d.nombre === empleadoData.departamento);
        if (!existingDept) {
          await api.post("/departamentos", { nombre: empleadoData.departamento });
          const updatedDepts = await api.get<any[]>("/departamentos").catch(() => []);
          setDepartamentos(updatedDepts);
        }

        result = await api.post<{ id: string | number }>("/empleados", { ...empleadoData, rol: role });
        
        // Si es conductor y se seleccionó/creó vehículo, asignar
        if (role === "Conductor") {
           if (showVehicleFields) {
              if (!vehiculoData.placa || !vehiculoData.marca || !vehiculoData.modelo || (vehiculoData.esFMO && !vehiculoData.fmo)) {
                throw new Error("Todos los campos del vehículo son obligatorios");
              }
           }

           const vehicleToAssign = showVehicleFields 
             ? await api.post<{ id: string | number }>("/vehiculos", vehiculoData) 
             : (selectedVehicleId ? { id: parseInt(selectedVehicleId) } : null);
           
           if (vehicleToAssign) {
              await api.patch(`/vehiculos/${vehicleToAssign.id}`, { conductores: [{ id: result.id }] });
           }
        }
      } else if (type === "destino") {
        if (!destinoData.nombre || !destinoData.direccion || !destinoData.telefono) {
          throw new Error("Todos los campos del destino son obligatorios");
        }
        result = await api.post("/destinos", destinoData);
      } else if (type === "vehiculo") {
        if (!vehiculoData.placa || !vehiculoData.marca || !vehiculoData.modelo || (vehiculoData.esFMO && !vehiculoData.fmo)) {
          throw new Error("Todos los campos del vehículo son obligatorios");
        }
        result = await api.post("/vehiculos", vehiculoData);
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 transition-all";
  const labelClass = "text-sm font-semibold text-foreground uppercase tracking-tight";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
        <div className="bg-primary p-6 text-primary-foreground flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            {type === "empleado" ? <UserPlus className="h-6 w-6" /> : type === "destino" ? <MapPinPlus className="h-6 w-6" /> : <Truck className="h-6 w-6" />}
          </div>
          <div>
            <DialogTitle className="text-xl font-bold">
              {type === "empleado" ? `Nuevo ${role}` : type === "destino" ? "Nuevo Destino" : "Registrar Vehículo"}
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80 text-xs mt-1">
              Los datos se guardarán como respuestas rápidas para futuros pases.
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4 bg-background max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            {type === "empleado" ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ficha" className={labelClass}>
                    Ficha <span className="text-destructive">*</span>
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
                    Nombre <span className="text-destructive">*</span>
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
                  <Label className={labelClass}>
                    Depto. <span className="text-destructive">*</span>
                  </Label>
                  <div className="col-span-3">
                    {showNewDeptInput ? (
                      <div className="flex items-center gap-2">
                        <Input
                          name="departamento"
                          placeholder="Nuevo departamento..."
                          value={empleadoData.departamento}
                          onChange={handleEmpleadoChange}
                          className={cn(inputClass, "flex-1")}
                          required
                        />
                        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 shrink-0" onClick={() => { setShowNewDeptInput(false); setEmpleadoData(prev => ({...prev, departamento: ""})); }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Select 
                        value={empleadoData.departamento}
                        onValueChange={(val) => {
                          if (val === "__new__") {
                            setShowNewDeptInput(true);
                            setEmpleadoData(prev => ({...prev, departamento: ""}));
                          } else {
                            setEmpleadoData(prev => ({...prev, departamento: val}));
                          }
                        }}
                      >
                        <SelectTrigger className={cn(inputClass, "w-full")}>
                          <SelectValue placeholder="Seleccionar departamento..." />
                        </SelectTrigger>
                        <SelectContent>
                          {departamentos.map(d => (
                            <SelectItem key={d.id} value={d.nombre}>{d.nombre}</SelectItem>
                          ))}
                          <SelectItem value="__new__">+ Crear nuevo departamento</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                {role !== "Conductor" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cargo" className={labelClass}>
                      Cargo <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cargo"
                      name="cargo"
                      placeholder="Ej. Analista"
                      value={empleadoData.cargo}
                      onChange={handleEmpleadoChange}
                      className={cn("col-span-3", inputClass)}
                      required
                    />
                  </div>
                )}

                {role === "Conductor" && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className={labelClass}>Vehículo Asignado</Label>
                      <Button 
                        type="button" 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 text-[10px]"
                        onClick={() => setShowVehicleFields(!showVehicleFields)}
                      >
                        {showVehicleFields ? "Seleccionar Existente" : "Crear Nuevo Vehículo"}
                      </Button>
                    </div>

                    {!showVehicleFields ? (
                      <select 
                        className={cn("w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", inputClass)}
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                      >
                        <option value="">Sin vehículo</option>
                        {vehiculosDisponibles.map(v => (
                          <option key={v.id} value={v.id}>{v.placa} {v.esFMO ? `(FMO: ${v.fmo})` : '(Particular)'}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-3 p-3 bg-muted rounded-lg border border-dashed border-border animate-in slide-in-from-top-2">
                        <Input name="placa" placeholder="Placa (ABC-123) *" value={vehiculoData.placa} onChange={handleVehiculoChange} className={inputClass} required />
                        <div className="grid grid-cols-2 gap-2">
                          <Input name="marca" placeholder="Marca *" value={vehiculoData.marca} onChange={handleVehiculoChange} className={inputClass} required />
                          <Input name="modelo" placeholder="Modelo *" value={vehiculoData.modelo} onChange={handleVehiculoChange} className={inputClass} required />
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="esFMO_modal" name="esFMO" checked={vehiculoData.esFMO} onChange={handleVehiculoChange} />
                          <Label htmlFor="esFMO_modal" className="text-xs">¿Es Vehículo FMO?</Label>
                          {vehiculoData.esFMO && <Input name="fmo" placeholder="N° FMO *" value={vehiculoData.fmo} onChange={handleVehiculoChange} className={cn("h-7 w-24 text-[10px]", inputClass)} required />}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : type === "destino" ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre_dest" className={labelClass}>
                    Nombre <span className="text-destructive">*</span>
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
                    Ubicación <span className="text-destructive">*</span>
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
                    Teléfono <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    placeholder="Ej. +58..."
                    value={destinoData.telefono}
                    onChange={handleDestinoChange}
                    className={cn("col-span-3", inputClass)}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="placa_v" className={labelClass}>Placa <span className="text-destructive">*</span></Label>
                  <Input id="placa_v" name="placa" placeholder="Placa" value={vehiculoData.placa} onChange={handleVehiculoChange} className={cn("col-span-3 uppercase", inputClass)} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="marca_v" className={labelClass}>Marca <span className="text-destructive">*</span></Label>
                  <Input id="marca_v" name="marca" placeholder="Ej. Toyota" value={vehiculoData.marca} onChange={handleVehiculoChange} className={cn("col-span-3", inputClass)} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="modelo_v" className={labelClass}>Modelo <span className="text-destructive">*</span></Label>
                  <Input id="modelo_v" name="modelo" placeholder="Ej. Hilux" value={vehiculoData.modelo} onChange={handleVehiculoChange} className={cn("col-span-3", inputClass)} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className={labelClass}>Tipo</Label>
                  <div className="col-span-3 flex items-center gap-4 py-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="esFMO_only" name="esFMO" checked={vehiculoData.esFMO} onChange={handleVehiculoChange} />
                      <Label htmlFor="esFMO_only" className="text-xs">FMO</Label>
                    </div>
                    {vehiculoData.esFMO && <Input name="fmo" placeholder="N° FMO *" value={vehiculoData.fmo} onChange={handleVehiculoChange} className={cn("h-8 w-24 text-xs", inputClass)} required />}
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium animate-shake text-center">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-6 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="text-muted-foreground hover:bg-muted"
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
              {loading ? "Guardando..." : "Guardar Registro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { Truck } from "lucide-react";
