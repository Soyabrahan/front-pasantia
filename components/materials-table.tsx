"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Package } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const addItem = () => {
    const newItem: MaterialItem = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      cantidad: "",
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
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const inputStyles = "h-9 border-border bg-background text-foreground focus-visible:ring-ring/50 focus-visible:border-ring";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-black text-foreground uppercase">Detalle de Materiales</h2>
        </div>
        <Button
          type="button"
          onClick={addItem}
          size="sm"
          className="h-10 px-6 font-bold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Ítem
        </Button>
      </div>

      <div className="border-2 border-border rounded-xl overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 p-4 bg-muted/40 border-b-2 border-border">
          <div className="col-span-1 text-xs font-black text-foreground/80 uppercase tracking-tighter text-center">
            Cant.
          </div>
          <div className="col-span-2 text-xs font-black text-foreground/80 uppercase tracking-tighter">
            Unidad
          </div>
          <div className="col-span-2 text-xs font-black text-foreground/80 uppercase tracking-tighter">
            Marca
          </div>
          <div className="col-span-2 text-xs font-black text-foreground/80 uppercase tracking-tighter">
            Producto
          </div>
          <div className="col-span-2 text-xs font-black text-foreground/80 uppercase tracking-tighter">
            ID Por
          </div>
          <div className="col-span-2 text-xs font-black text-foreground/80 uppercase tracking-tighter">
            Valores
          </div>
          <div className="col-span-1 text-xs font-black text-foreground/80 uppercase tracking-tighter text-center">
            
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y-2 divide-border/60">
          {items.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground bg-muted/10">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-bold">No hay materiales registrados</p>
              <p className="text-sm mt-1">Haga clic en el botón superior para añadir materiales al pase.</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-muted/20 transition-colors animate-fadeIn"
              >
                <div className="col-span-1">
                  <Input
                    type="text"
                    placeholder="0"
                    value={item.cantidad}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      updateItem(item.id, "cantidad", val);
                    }}
                    className={cn("text-center font-bold", inputStyles)}
                  />
                </div>
                <div className="col-span-2">
                  <select
                    value={item.unidad}
                    onChange={(e) => updateItem(item.id, "unidad", e.target.value)}
                    className="w-full h-9 px-2 rounded-md border border-border bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring/50"
                  >
                    {UNIDADES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Ej. Lenovo"
                    value={item.marca}
                    onChange={(e) => updateItem(item.id, "marca", e.target.value)}
                    className={cn("font-medium", inputStyles)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Ej. Teclado"
                    value={item.producto}
                    onChange={(e) => updateItem(item.id, "producto", e.target.value)}
                    className={cn("font-medium", inputStyles)}
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
                  </select>
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Valores..."
                    value={item.identificadores}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (item.tipoIdentificador === "FMO") {
                        val = val.replace(/[^0-9, ]/g, "");
                      }
                      updateItem(item.id, "identificadores", val);
                    }}
                    className={cn("font-mono text-xs", inputStyles)}
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

        {/* Table Footer */}
        {items.length > 0 && (
          <div className="p-4 bg-muted/30 border-t-2 border-border">
            <div className="flex justify-between items-center text-sm font-black uppercase">
              <span className="text-foreground/80">
                Total ítems: <strong className="text-primary text-lg">{items.length}</strong>
              </span>
              <span className="text-foreground/80">
                Cantidad total:{" "}
                <strong className="text-primary text-lg">
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
