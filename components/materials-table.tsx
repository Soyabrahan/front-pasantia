"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Package } from "lucide-react"

export interface MaterialItem {
  id: string
  equipo: string
  cantidad: string
  unidad: string
  descripcion: string
}

interface MaterialsTableProps {
  items: MaterialItem[]
  onItemsChange: (items: MaterialItem[]) => void
}

const UNIDADES = ["Pza", "Und", "Kit", "Mt", "Kg", "Lt", "Caja", "Rollo"]

export function MaterialsTable({ items, onItemsChange }: MaterialsTableProps) {
  const addItem = () => {
    const newItem: MaterialItem = {
      id: crypto.randomUUID(),
      equipo: "",
      cantidad: "",
      unidad: "Und",
      descripcion: "",
    }
    onItemsChange([...items, newItem])
  }

  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof MaterialItem, value: string) => {
    onItemsChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Detalle de Materiales</h2>
        </div>
        <Button
          type="button"
          onClick={addItem}
          size="sm"
          className="h-9 px-4"
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar Ítem
        </Button>
      </div>

      <div className="border-2 border-slate-400 rounded-lg overflow-hidden bg-card">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 p-3 bg-muted border-b-2 border-slate-400">
          <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Equipo
          </div>
          <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Cant.
          </div>
          <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Unidad
          </div>
          <div className="col-span-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Descripción (Marca/Serial)
          </div>
          <div className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
            
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y-2 divide-slate-400">
          {items.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay materiales registrados</p>
              <p className="text-xs mt-1">Haga clic en "Agregar Ítem" para comenzar</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-muted/50 transition-colors animate-slideInLeft"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
              >
                <div className="col-span-3">
                   <Input
                    placeholder="Nombre del equipo"
                    value={item.equipo}
                    onChange={(e) => updateItem(item.id, "equipo", e.target.value)}
                    className="h-9 border-slate-400"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="0"
                    value={item.cantidad}
                    onChange={(e) => updateItem(item.id, "cantidad", e.target.value)}
                    className="h-9 text-center border-slate-400"
                    min="0"
                  />
                </div>
                <div className="col-span-2">
                  <select
                    value={item.unidad}
                    onChange={(e) => updateItem(item.id, "unidad", e.target.value)}
                    className="w-full h-9 px-3 rounded-md border-2 border-slate-400 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {UNIDADES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-4">
                  <Input
                    placeholder="Marca, serial, detalles..."
                    value={item.descripcion}
                    onChange={(e) => updateItem(item.id, "descripcion", e.target.value)}
                    className="h-9 border-slate-400"
                  />
                </div>
                <div className="col-span-1 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar ítem {index + 1}</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Table Footer */}
        {items.length > 0 && (
          <div className="p-3 bg-muted/50 border-t-2 border-slate-400">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Total de ítems: <strong className="text-foreground">{items.length}</strong>
              </span>
              <span className="text-muted-foreground">
                Cantidad total:{" "}
                <strong className="text-foreground">
                  {items.reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0)}
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
