"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Package, Check, ChevronsUpDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api-client"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export interface MaterialItem {
  id: string
  cantidad: string
  unidad: string
  marca: string
  producto: string
  tipoIdentificador: string
  identificadores: string
}

interface MaterialsTableProps {
  items: MaterialItem[]
  onItemsChange: (items: MaterialItem[]) => void
}

const UNIDADES = ["Pza", "Und", "Mt", "Kg", "Caja", "Rollo"]

export function MaterialsTable({ items, onItemsChange }: MaterialsTableProps) {
  const [openMarcaId, setOpenMarcaId] = useState<string | null>(null)
  const [addingMarcaId, setAddingMarcaId] = useState<string | null>(null)
  const [newMarcaName, setNewMarcaName] = useState("")
  const [marcas, setMarcas] = useState<{ id: number; nombre: string }[]>([])
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const newMarcaInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get<any[]>("/marcas")
      .then((data) => setMarcas(data || []))
      .catch(() => {})
  }, [])

  const addItem = () => {
    const newItem: MaterialItem = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      cantidad: "1",
      unidad: "Und",
      marca: "",
      producto: "",
      tipoIdentificador: "Serial",
      identificadores: "",
    }
    onItemsChange([...items, newItem])
  }

  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof MaterialItem, value: string) => {
    onItemsChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value.toUpperCase() } : item
      )
    )
  }

  const handleCantidadChange = (id: string, val: string) => {
    const digits = val.replace(/\D/g, "")
    if (digits === "0" || digits === "") {
      updateItem(id, "cantidad", "1")
    } else {
      updateItem(id, "cantidad", digits)
    }
  }

  const handleSelectMarca = (itemId: string, marcaNombre: string) => {
    updateItem(itemId, "marca", marcaNombre)
    setOpenMarcaId(null)
    setAddingMarcaId(null)
  }

  const handleAddNewMarca = async (itemId: string) => {
    if (!newMarcaName.trim()) return
    try {
      const saved = await api.post<{ id: number; nombre: string }>("/marcas", {
        nombre: newMarcaName.trim().toUpperCase(),
      })
      setMarcas((prev) => [...prev, saved])
      updateItem(itemId, "marca", saved.nombre)
      setAddingMarcaId(null)
      setNewMarcaName("")
      setOpenMarcaId(null)
    } catch {
      updateItem(itemId, "marca", newMarcaName.trim().toUpperCase())
      setAddingMarcaId(null)
      setNewMarcaName("")
      setOpenMarcaId(null)
    }
  }

  const startAddMarca = (itemId: string) => {
    setAddingMarcaId(itemId)
    setNewMarcaName("")
    setTimeout(() => newMarcaInputRef.current?.focus(), 100)
  }

  const inputStyles = "h-9 border-border bg-background text-foreground focus-visible:ring-ring/50 focus-visible:border-ring"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-black text-foreground uppercase">Detalle de Materiales</h2>
        </div>
        <Button type="button" onClick={addItem} size="sm" className="h-10 px-6 font-bold">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Ítem
        </Button>
      </div>
      <div className="border-2 border-border rounded-xl overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="grid grid-cols-12 gap-2 p-4 bg-muted/40 border-b-2 border-border">
          <div className="col-span-1 text-xs font-black text-foreground/80 uppercase tracking-tighter text-center">Cant. *</div>
          <div className="col-span-2 text-xs font-black text-foreground/80 uppercase tracking-tighter">Unidad *</div>
          <div className="col-span-2 text-xs font-black text-foreground/80 uppercase tracking-tighter">Marca *</div>
          <div className="col-span-2 text-xs font-black text-foreground/80 uppercase tracking-tighter">Producto *</div>
          <div className="col-span-2 text-xs font-black text-foreground/80 uppercase tracking-tighter">ID Por *</div>
          <div className="col-span-2 text-xs font-black text-foreground/80 uppercase tracking-tighter flex items-center gap-1">
            Valores *
            <button
              type="button"
              onClick={() => setInfoModalOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="¿Cómo separar valores?"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="col-span-1" />
        </div>
        <div className="divide-y-2 divide-border/60">
          {items.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground bg-muted/10">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-bold">No hay materiales registrados</p>
              <p className="text-sm mt-1">Haga clic en el botón superior para añadir materiales al pase.</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-muted/20 transition-colors animate-fadeIn">
                <div className="col-span-1">
                  <Input
                    type="text"
                    placeholder="1"
                    value={item.cantidad}
                    onChange={(e) => handleCantidadChange(item.id, e.target.value)}
                    className={cn("text-center font-bold", inputStyles)}
                  />
                </div>
                <div className="col-span-2">
                  <select
                    value={item.unidad}
                    onChange={(e) => updateItem(item.id, "unidad", e.target.value)}
                    className="w-full h-9 px-2 rounded-md border border-border bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring/50"
                  >
                    {UNIDADES.map((u) => (<option key={u} value={u}>{u}</option>))}
                  </select>
                </div>
                <div className="col-span-2">
                  {addingMarcaId === item.id ? (
                    <div className="flex gap-1">
                      <Input
                        ref={newMarcaInputRef}
                        placeholder="NOMBRE MARCA"
                        value={newMarcaName}
                        onChange={(e) => setNewMarcaName(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddNewMarca(item.id)
                          if (e.key === "Escape") { setAddingMarcaId(null); setNewMarcaName("") }
                        }}
                        className={cn("h-9 text-xs uppercase flex-1", inputStyles)}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 shrink-0 text-green-600"
                        onClick={() => handleAddNewMarca(item.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Popover
                      open={openMarcaId === item.id}
                      onOpenChange={(open) => {
                        setOpenMarcaId(open ? item.id : null)
                        if (!open) setAddingMarcaId(null)
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          className={cn("w-full h-9 justify-between text-xs font-medium", inputStyles)}
                        >
                          <span className="truncate">{item.marca || "Seleccionar..."}</span>
                          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[220px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar marca..." className="h-9 text-xs" />
                          <CommandList>
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => startAddMarca(item.id)}
                                className="text-primary font-black py-2 text-xs"
                              >
                                <Plus className="mr-2 h-4 w-4" /> AGREGAR NUEVA MARCA
                              </CommandItem>
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandEmpty className="p-3 text-center text-xs">
                              <p className="mb-2">No se encontró la marca.</p>
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="w-full text-xs"
                                onClick={() => startAddMarca(item.id)}
                              >
                                <Plus className="mr-1 h-3 w-3" /> Agregar "{item.marca || "nueva"}"
                              </Button>
                            </CommandEmpty>
                            <CommandGroup heading="Marcas">
                              {marcas.map((m) => (
                                <CommandItem
                                  key={m.id}
                                  value={m.nombre}
                                  onSelect={() => handleSelectMarca(item.id, m.nombre)}
                                  className="py-2 text-xs"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-3 w-3",
                                      item.marca === m.nombre ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {m.nombre}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Ej. TECLADO"
                    value={item.producto}
                    onChange={(e) => updateItem(item.id, "producto", e.target.value)}
                    className={cn("font-medium uppercase", inputStyles)}
                  />
                </div>
                <div className="col-span-2">
                  <select
                    value={item.tipoIdentificador}
                    onChange={(e) => updateItem(item.id, "tipoIdentificador", e.target.value)}
                    className="w-full h-9 px-2 rounded-md border border-border bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring/50"
                  >
                    <option value="Serial">Serial</option>
                    <option value="FMO">FMO</option>
                    <option value="S/N">S/N</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Valores..."
                    value={item.identificadores}
                    onChange={(e) => {
                      let val = e.target.value
                      if (item.tipoIdentificador === "FMO") {
                        val = val.replace(/[^0-9, ]/g, "")
                      }
                      updateItem(item.id, "identificadores", val)
                    }}
                    className={cn("font-mono text-xs uppercase", inputStyles)}
                    disabled={item.tipoIdentificador === "S/N"}
                  />
                </div>
                <div className="col-span-1 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="h-9 w-9 p-0 text-destructive hover:text-red-400 hover:bg-red-950/30 rounded-full transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Eliminar ítem</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="p-4 bg-muted/30 border-t-2 border-border">
            <div className="flex justify-between items-center text-sm font-black uppercase">
              <span className="text-foreground/80">Total ítems: <strong className="text-primary text-lg">{items.length}</strong></span>
              <span className="text-foreground/80">Cantidad total: <strong className="text-primary text-lg">
                {items.reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0)}</strong></span>
            </div>
          </div>
        )}
      </div>

      <Dialog open={infoModalOpen} onOpenChange={setInfoModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-primary" />
              Formato de Valores
            </DialogTitle>
            <DialogDescription className="text-base pt-3 leading-relaxed">
              Separe los seriales o números FMO por comas.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 p-4 rounded-lg border text-sm font-mono">
            <span className="font-bold text-foreground">Ejemplo:</span>
            <br />
            ABC123, DEF456, GHI789
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="default"
              className="w-full"
              onClick={() => setInfoModalOpen(false)}
            >
              ENTENDIDO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
