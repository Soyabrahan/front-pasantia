"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Truck, User, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/api-client"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response: any = await api.post("/auth/login", {
        ficha: formData.username,
        contrasena: formData.password
      })
      
      if (response.access_token) {
        localStorage.setItem("auth_token", response.access_token)
        toast.success("Bienvenido al sistema")
        router.push("/")
      }
    } catch (error: any) {
      toast.error(error.message || "Credenciales inválidas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 bg-[grid-white-fade]">
      <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-[#121212] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
          {/* Header Rojo */}
          <div className="bg-[#CC1414] p-10 flex flex-col items-center text-center space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <Truck className="h-10 w-10 text-[#CC1414]" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase">FMO</h1>
              <p className="text-white/80 text-xs font-bold uppercase tracking-[0.2em]">Sistema de Gestión de Pases</p>
            </div>
          </div>

          {/* Formulario */}
          <div className="p-10 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white tracking-tight">Bienvenido</h2>
              <p className="text-zinc-500 text-sm">Ingrese sus credenciales para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                {/* Usuario */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Ficha o Nombre de Usuario
                    </Label>
                  </div>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-[#CC1414] transition-colors" />
                    <Input
                      id="username"
                      placeholder="Nombre de usuario o ID"
                      className="bg-zinc-900/50 border-zinc-800/50 border-2 focus:border-[#CC1414] focus:ring-0 pl-12 h-14 text-white rounded-2xl transition-all"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Contraseña
                    </Label>
                    <Link href="#" className="text-[10px] font-bold text-[#CC1414] hover:underline uppercase tracking-widest">
                      ¿Olvidó su contraseña?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-[#CC1414] transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="bg-zinc-900/50 border-zinc-800/50 border-2 focus:border-[#CC1414] focus:ring-0 pl-12 pr-12 h-14 text-white rounded-2xl transition-all"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 px-1">
                <Checkbox id="remember" className="rounded-md border-zinc-700 data-[state=checked]:bg-[#CC1414] data-[state=checked]:border-[#CC1414]" />
                <label
                  htmlFor="remember"
                  className="text-xs font-medium text-zinc-400 leading-none cursor-pointer"
                >
                  Recordarme en este equipo
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#CC1414] hover:bg-[#A11010] text-white font-black h-14 rounded-2xl transition-all shadow-lg shadow-red-900/20 active:scale-[0.98] disabled:opacity-50"
                disabled={loading}
              >
                <div className="flex items-center justify-center gap-2">
                  {loading ? "VERIFICANDO..." : "ENTRAR"}
                  {!loading && <ArrowRight className="h-5 w-5" />}
                </div>
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-zinc-500">
                ¿No tiene una cuenta?{" "}
                <Link href="/register" className="text-[#CC1414] font-bold hover:underline">
                  Solicitar Acceso
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 flex flex-col items-center space-y-6 opacity-40">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              <ShieldCheck className="h-4 w-4" />
              ACESSO SEGURO
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              <Truck className="h-4 w-4" />
              CVG FERROMINERA ORINOCO
            </div>
          </div>
          <p className="text-[9px] text-white font-medium uppercase tracking-[0.3em]">
            © 2026 FMO - Gestión de Materiales y Misceláneos
          </p>
        </div>
      </div>
    </div>
  )
}
