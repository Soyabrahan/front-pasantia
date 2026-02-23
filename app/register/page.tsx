"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Truck, User, Mail, Lock, Building, ArrowRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api-client"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    ficha: "",
    contrasena: "",
    rol: "Usuario", // Default system role
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post("/auth/register", formData)
      toast.success("Cuenta creada exitosamente")
      router.push("/login")
    } catch (error: any) {
      if (error.status === 409) {
        toast.error("Esta ficha ya está registrada. Si olvidó su contraseña, contacte a soporte.")
      } else {
        toast.error(error.message || "Error al crear la cuenta")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-white overflow-hidden">
      {/* Columna Izquierda - Banner Rojo */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#CC1414] p-12 flex-col justify-between relative overflow-hidden">
        {/* Adornos de fondo */}
        <div className="absolute top-[-10%] right-[-10%] opacity-10">
          <Truck size={600} className="rotate-[-10deg]" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
              <Truck className="text-white h-8 w-8" />
            </div>
            <span className="font-bold text-xl tracking-tighter uppercase max-w-[200px] leading-tight text-white/90">
              Pase para Materiales y Misceláneos
            </span>
          </div>

          <h1 className="text-6xl font-black mb-8 leading-tight">
            Únete al Sistema de <br />
            <span className="text-white/80">Control FMO</span>
          </h1>

          <p className="text-xl text-white/70 max-w-md leading-relaxed">
            Gestione el movimiento de equipos industriales, herramientas y materiales con total trazabilidad y seguridad corporativa.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
            <ShieldCheck className="h-4 w-4" />
            Acceso Restringido a Personal Autorizado
          </div>
          <div className="h-px bg-white/20 w-full" />
          <p className="text-xs text-white/40">
            © 2024 Corporativo Industrial - Sistema ERP v4.2
          </p>
        </div>
      </div>

      {/* Columna Derecha - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0A0A0A]">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight text-white">
              CREAR CUENTA
            </h2>
            <p className="text-zinc-500">
              Ingrese sus credenciales de empleado para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Nombre Completo */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Nombre Completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    id="nombre"
                    placeholder="Ej. Juan Pérez"
                    className="bg-zinc-900 border-zinc-800 border-2 focus:border-[#CC1414] focus:ring-0 pl-10 h-12 text-white placeholder:text-zinc-600 transition-all"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
              </div>
              {/* Ficha Empleado */}
              <div className="space-y-2">
                <Label htmlFor="ficha" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Ficha Empleado (FMO)
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    id="ficha"
                    placeholder="86467"
                    className="bg-zinc-900 border-zinc-800 border-2 focus:border-[#CC1414] focus:ring-0 pl-10 h-12 text-white placeholder:text-zinc-600 transition-all"
                    required
                    value={formData.ficha}
                    onChange={(e) => setFormData({ ...formData, ficha: e.target.value })}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="contrasena" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    id="contrasena"
                    type="password"
                    placeholder="••••••••"
                    className="bg-zinc-900 border-zinc-800 border-2 focus:border-[#CC1414] focus:ring-0 pl-10 h-12 text-white placeholder:text-zinc-600 transition-all"
                    required
                    value={formData.contrasena}
                    onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                  />
                </div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                  Mínimo 8 caracteres, incluir mayúsculas y números.
                </p>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#CC1414] hover:bg-[#A11010] text-white font-bold h-14 rounded-xl transition-all group overflow-hidden relative"
              disabled={loading}
            >
              <div className="flex items-center justify-center gap-2 group-hover:translate-x-1 transition-transform">
                {loading ? "CREANDO CUENTA..." : "REGISTRARSE"}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </div>
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-zinc-500">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-[#CC1414] font-bold hover:underline transition-all">
                INICIAR SESIÓN
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
