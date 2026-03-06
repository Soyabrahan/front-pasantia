"use client"

import React, { useState } from "react"
import {
    User,
    Truck,
    MapPin,
    Plus,
    Pencil,
    Trash2,
    Search,
    Users as UsersIcon,
    ShieldCheck,
    Truck as TruckHeaderIcon,
    Save,
    X,
    CheckCircle,
    Key,
    MoreHorizontal,
    Edit
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { SidebarTrigger } from "@/components/ui/sidebar"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { api } from "@/lib/api-client"

export default function ConfigurationPage() {
    const [activeTab, setActiveTab] = useState("usuarios")
    const [usuarios, setUsuarios] = useState<any[]>([])
    const [vehiculos, setVehiculos] = useState<any[]>([])
    const [destinos, setDestinos] = useState<any[]>([])
    const [empleados, setEmpleados] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [isEditingProfile, setIsEditingProfile] = useState(false)

    // Estados para filas de "Agregar"
    const [isAddingUsuario, setIsAddingUsuario] = useState(false)
    const [isAddingVehiculo, setIsAddingVehiculo] = useState(false)
    const [isAddingDestino, setIsAddingDestino] = useState(false)
    const [isAddingEmpleado, setIsAddingEmpleado] = useState(false)

    const [newUsuario, setNewUsuario] = useState({ ficha: "", nombre: "", rol: "Administrador", contrasena: "admin" })
    const [newVehiculo, setNewVehiculo] = useState({ placa: "", modelo: "", tipo: "", esFMO: false, fmo: "" })
    const [newDestino, setNewDestino] = useState({ nombre: "", direccion: "", telefono: "" })
    const [newEmpleado, setNewEmpleado] = useState({ ficha: "", nombre: "", departamento: "", cargo: "" })

    // Estados para Edición
    const [editingVehiculoId, setEditingVehiculoId] = useState<number | null>(null)
    const [editVehiculo, setEditVehiculo] = useState<any>(null)
    const [editingDestinoId, setEditingDestinoId] = useState<number | null>(null)
    const [editDestino, setEditDestino] = useState<any>(null)
    const [editingEmpleadoId, setEditingEmpleadoId] = useState<number | null>(null)
    const [editEmpleado, setEditEmpleado] = useState<any>(null)

    // Estados para Cambio de Contraseña
    const [isPassModalOpen, setIsPassModalOpen] = useState(false)
    const [selectedUserForPass, setSelectedUserForPass] = useState<any>(null)
    const [passData, setPassData] = useState({ currentPass: "", newPass: "" })

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [u, v, d, e] = await Promise.all([
                api.get<any[]>("/usuarios/all").catch(() => []), 
                api.get<any[]>("/vehiculos"),
                api.get<any[]>("/destinos"),
                api.get<any[]>("/empleados").catch(() => []),
            ])
            setUsuarios(u)
            setVehiculos(v)
            setDestinos(d)
            setEmpleados(e)
        } catch (error) {
            console.error("Error loading config data:", error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        setMounted(true)
        const init = async () => {
            try {
                const profile = await api.get<any>("/auth/profile")
                setCurrentUser(profile)
            } catch (error) {
                console.error("Error fetching profile:", error)
            }
            fetchAll()
        }
        init()
    }, [])

    const handleSaveUsuario = async () => {
        try {
            const saved = await api.post<any>("/usuarios", newUsuario)
            setUsuarios([...usuarios, saved])
            setIsAddingUsuario(false)
            setNewUsuario({ ficha: "", nombre: "", rol: "Administrador", contrasena: "admin" })
        } catch (error: any) {
            if (error.status === 409) {
                alert("Error: Esta ficha ya tiene una cuenta de sistema asignada.")
            } else {
                alert("Error al guardar usuario")
            }
        }
    }

    const handleSaveVehiculo = async () => {
        try {
            const saved = await api.post<any>("/vehiculos", newVehiculo)
            setVehiculos([...vehiculos, saved])
            setIsAddingVehiculo(false)
            setNewVehiculo({ placa: "", modelo: "", tipo: "", esFMO: false, fmo: "" })
        } catch (error) {
            alert("Error al guardar vehículo")
        }
    }

    const handleSaveDestino = async () => {
        try {
            const saved = await api.post<any>("/destinos", newDestino)
            setDestinos([...destinos, saved])
            setIsAddingDestino(false)
            setNewDestino({ nombre: "", direccion: "", telefono: "" })
        } catch (error) {
            alert("Error al guardar destino")
        }
    }

    const handleSaveEmpleado = async () => {
        try {
            const saved = await api.post<any>("/empleados", newEmpleado)
            setEmpleados([...empleados, saved])
            setIsAddingEmpleado(false)
            setNewEmpleado({ ficha: "", nombre: "", departamento: "", cargo: "" })
        } catch (error) {
            alert("Error al guardar empleado")
        }
    }

    const handleUpdateVehiculo = async (id: number) => {
        try {
            const updated = await api.patch<any>(`/vehiculos/${id}`, editVehiculo)
            setVehiculos(vehiculos.map(v => v.id === id ? updated : v))
            setEditingVehiculoId(null)
        } catch (error) {
            alert("Error al actualizar vehículo")
        }
    }

    const handleUpdateDestino = async (id: number) => {
        try {
            const updated = await api.patch<any>(`/destinos/${id}`, editDestino)
            setDestinos(destinos.map(d => d.id === id ? updated : d))
            setEditingDestinoId(null)
        } catch (error) {
            alert("Error al actualizar destino")
        }
    }

    const handleUpdateEmpleado = async (id: number) => {
        try {
            const updated = await api.patch<any>(`/empleados/${id}`, editEmpleado)
            setEmpleados(empleados.map(e => e.id === id ? updated : e))
            setEditingEmpleadoId(null)
        } catch (error) {
            alert("Error al actualizar empleado")
        }
    }

    const handleDeleteVehiculo = async (id: number) => {
        if (!confirm("¿Borrar vehículo?")) return
        try {
            await api.delete(`/vehiculos/${id}`)
            setVehiculos(vehiculos.filter(v => v.id !== id))
        } catch (error) {
            alert("Error al borrar")
        }
    }

    const handleDeleteDestino = async (id: number) => {
        if (!confirm("¿Borrar destino?")) return
        try {
            await api.delete(`/destinos/${id}`)
            setDestinos(destinos.filter(d => d.id !== id))
        } catch (error) {
            alert("Error al borrar")
        }
    }

    const handleDeleteEmpleado = async (id: number) => {
        if (!confirm("¿Borrar empleado?")) return
        try {
            await api.delete(`/empleados/${id}`)
            setEmpleados(empleados.filter(e => e.id !== id))
        } catch (error) {
            alert("Error al borrar")
        }
    }

    const handleDeleteUsuario = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar este usuario?")) return
        try {
            await api.delete(`/usuarios/${id}`)
            setUsuarios(usuarios.filter(u => u.id !== id))
        } catch (error) {
            alert("Error al eliminar usuario")
        }
    }

    const handleUpdateCurrentUser = async (data: any) => {
        try {
            const updated = await api.patch<any>(`/usuarios/${currentUser.id}`, data)
            setCurrentUser(updated)
            setIsEditingProfile(false)
            alert("Perfil actualizado correctamente")
        } catch (error) {
            alert("Error al actualizar perfil")
        }
    }

    const handleUpdateUserRole = async (userId: number, newRole: string) => {
        try {
            await api.patch<any>(`/usuarios/${userId}`, { rol: newRole })
            setUsuarios(usuarios.map(u => u.id === userId ? { ...u, rol: newRole } : u))
        } catch (error) {
            alert("Error al actualizar el rol del usuario")
        }
    }

    const handleAssignRoleToEmpleado = async (empleado: any, role: string) => {
        try {
            // Actualizar rol en el empleado
            await api.patch(`/empleados/${empleado.id}`, { rol: role });
            setEmpleados(empleados.map(e => e.id === empleado.id ? { ...e, rol: role } : e));
            
            alert(`Rol ${role} asignado correctamente a ${empleado.nombre}`);
        } catch (error) {
            console.error("Error al asignar rol:", error);
            alert("Error al procesar la asignación de rol");
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("auth_token")
        window.location.href = "/login"
    }

    const handleChangePassword = async () => {
        if (!selectedUserForPass) return
        try {
            const res = await api.patch<any>(`/usuarios/change-password/${selectedUserForPass.id}`, passData)
            if (res.success) {
                alert("Contraseña actualizada con éxito")
                setIsPassModalOpen(false)
                setPassData({ currentPass: "", newPass: "" })
            } else {
                alert(res.message || "Error al actualizar la contraseña")
            }
        } catch (error) {
            alert("Error de conexión al cambiar contraseña")
        }
    }

    if (!mounted) return null

    const isAdmin = currentUser?.rol === "Administrador"

    return (
        <div className="min-h-screen bg-background">
            {/* Header / Letterhead */}
            <header className="bg-primary text-primary-foreground shadow-lg mb-8">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
                    <SidebarTrigger className="text-primary-foreground hover:bg-primary-foreground/10" />
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                            <UsersIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">GESTIÓN DE DATOS MAESTROS</h1>
                            <p className="text-xs text-primary-foreground/70">Configuración del Sistema FMO</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-6 space-y-6 max-w-6xl mx-auto animate-fadeIn">

                <Tabs defaultValue="usuarios" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4 md:w-[500px] mb-4">
                        <TabsTrigger value="usuarios" className="flex gap-2 text-xs md:text-sm">
                            <UsersIcon className="h-4 w-4" />
                            Usuarios
                        </TabsTrigger>
                        <TabsTrigger value="vehiculos" className="flex gap-2 text-xs md:text-sm">
                            <Truck className="h-4 w-4" />
                            Vehículos
                        </TabsTrigger>
                        <TabsTrigger value="destinos" className="flex gap-2 text-xs md:text-sm">
                            <MapPin className="h-4 w-4" />
                            Destinos
                        </TabsTrigger>
                        <TabsTrigger value="empleados" className="flex gap-2 text-xs md:text-sm">
                            <User className="h-4 w-4" />
                            Empleados
                        </TabsTrigger>
                    </TabsList>

                    {/* USUARIOS TAB */}
                    <TabsContent value="usuarios">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle>{isAdmin ? "Perfiles de Usuario" : "Configuración de mi Perfil"}</CardTitle>
                                    <CardDescription>
                                        {isAdmin 
                                            ? "Listado de personas con permiso para entrar al sistema (Administradores y Emisores)." 
                                            : "Gestiona tu información personal y seguridad de tu cuenta."}
                                    </CardDescription>
                                </div>
                                {isAdmin && (
                                    <Button 
                                        size="sm" 
                                        className="gap-2"
                                        onClick={() => {
                                            setIsAddingUsuario(true)
                                            setNewUsuario({...newUsuario, rol: 'Administrador'})
                                        }}
                                        disabled={isAddingUsuario}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Dar Acceso al Sistema
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {isAdmin && (
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Buscar por ficha o nombre..."
                                                className="pl-8 border-slate-300"
                                            />
                                        </div>
                                    </div>
                                )}

                                {!isAdmin ? (
                                    <div className="space-y-6 max-w-2xl">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold">Nombre Completo</label>
                                                {isEditingProfile ? (
                                                    <Input 
                                                        value={currentUser?.nombre} 
                                                        onChange={e => setCurrentUser({...currentUser, nombre: e.target.value})}
                                                    />
                                                ) : (
                                                    <div className="p-2 bg-muted/20 rounded border border-transparent">{currentUser?.nombre}</div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold">Ficha</label>
                                                <div className="p-2 bg-muted/40 rounded border italic text-muted-foreground">{currentUser?.ficha}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3 pt-4 border-t">
                                            {isEditingProfile ? (
                                                <>
                                                    <Button className="gap-2" onClick={() => handleUpdateCurrentUser(currentUser)}>
                                                        <Save className="h-4 w-4" />
                                                        Guardar Cambios
                                                    </Button>
                                                    <Button variant="ghost" className="gap-2" onClick={() => {
                                                        setIsEditingProfile(false)
                                                        // Opcional: recargar el perfil original si se desea descartar cambios locales
                                                        api.get<any>("/auth/profile").then(p => setCurrentUser(p))
                                                    }}>
                                                        Cancelar
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button className="gap-2" onClick={() => setIsEditingProfile(true)}>
                                                    <Pencil className="h-4 w-4" />
                                                    Editar Perfil
                                                </Button>
                                            )}
                                            
                                            <Button variant="outline" className="gap-2 text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100" onClick={() => {
                                                setSelectedUserForPass(currentUser)
                                                setIsPassModalOpen(true)
                                            }}>
                                                <Key className="h-4 w-4" />
                                                Cambiar Contraseña
                                            </Button>
                                            <Button variant="ghost" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => {
                                                if(confirm("¿Estás seguro de que deseas borrar tu cuenta? Esta acción no se puede deshacer.")) {
                                                    handleDeleteUsuario(currentUser.id).then(() => handleLogout())
                                                }
                                            }}>
                                                <Trash2 className="h-4 w-4" />
                                                Borrar Cuenta
                                            </Button>
                                            <Button variant="secondary" className="gap-2" onClick={handleLogout}>
                                                <X className="h-4 w-4" />
                                                Cerrar Sesión
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-md border border-slate-200 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-muted/50">
                                                    <TableRow className="bg-muted/50">
                                                        <TableHead className="w-[120px]">Ficha</TableHead>
                                                        <TableHead>Nombre Completo</TableHead>
                                                        <TableHead>Rol en Sistema</TableHead>
                                                        <TableHead className="text-right">Acciones</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {isAddingUsuario && (
                                                        <TableRow className="bg-primary/5">
                                                            <TableCell>
                                                                <Select onValueChange={(val) => {
                                                                    const emp = empleados.find(e => e.ficha === val)
                                                                    if (emp) {
                                                                        setNewUsuario({
                                                                            ...newUsuario,
                                                                            ficha: emp.ficha,
                                                                            nombre: emp.nombre,
                                                                            rol: "Usuario",
                                                                            contrasena: "0000"
                                                                        })
                                                                    }
                                                                }}>
                                                                    <SelectTrigger className="h-8 text-xs">
                                                                        <SelectValue placeholder="Elegir empleado..." />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {empleados.filter(e => !usuarios.some(u => u.ficha === e.ficha)).map(e => (
                                                                            <SelectItem key={e.id} value={e.ficha}>{e.nombre} ({e.ficha})</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                {newUsuario.ficha && (
                                                                    <div className="mt-2 p-2 bg-background/50 rounded border border-transparent">
                                                                        <div className="text-[10px] font-bold text-primary">{newUsuario.nombre}</div>
                                                                        <div className="text-[10px] text-muted-foreground italic">Ficha: {newUsuario.ficha}</div>
                                                                        <div className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-tighter">
                                                                            Contraseña: {newUsuario.rol === 'Administrador' ? 'admin' : '0000'} (Predefinida)
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="text-sm font-medium">
                                                                    {empleados.find(e => e.ficha === newUsuario.ficha)?.nombre || "---"}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
                                                                    <ShieldCheck className="h-3 w-3" />
                                                                    Administrador
                                                                </div>
                                                            </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSaveUsuario} disabled={!newUsuario.ficha}>
                                                                    <Save className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => {
                                                                    setIsAddingUsuario(false)
                                                                    setNewUsuario({ ficha: "", nombre: "", rol: "Administrador", contrasena: "admin" })
                                                                }}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                {loading ? (
                                                    <TableRow><TableCell colSpan={5} className="text-center">Cargando usuarios...</TableCell></TableRow>
                                                ) : usuarios.length === 0 ? (
                                                    <TableRow><TableCell colSpan={5} className="text-center">No hay usuarios registrados.</TableCell></TableRow>
                                                ) : usuarios.filter(u => u.rol && u.rol !== "Ninguno").map((user) => (
                                                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                                                        <TableCell className="font-mono font-medium">{user.ficha}</TableCell>
                                                        <TableCell className="font-medium">
                                                            {user.nombre}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={user.rol === "Administrador" ? "default" : "secondary"}>
                                                                {user.rol}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDeleteUsuario(user.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}

                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* VEHICULOS TAB */}
                    <TabsContent value="vehiculos">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle>Flota de Vehículos</CardTitle>
                                    <CardDescription>
                                        Vehículos propios (FMO) y externos registrados con frecuencia.
                                    </CardDescription>
                                </div>
                                <Button 
                                    size="sm" 
                                    className="gap-2"
                                    onClick={() => setIsAddingVehiculo(true)}
                                    disabled={isAddingVehiculo}
                                >
                                    <Plus className="h-4 w-4" />
                                    Registrar Vehículo
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border border-slate-200 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead>Placa</TableHead>
                                                <TableHead>Pertenece a</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isAddingVehiculo && (
                                                <TableRow className="bg-primary/5">
                                                    <TableCell><Input placeholder="Placa" className="h-8 uppercase" value={newVehiculo.placa} onChange={e => setNewVehiculo({...newVehiculo, placa: e.target.value})} /></TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <input type="checkbox" checked={newVehiculo.esFMO} onChange={e => setNewVehiculo({...newVehiculo, esFMO: e.target.checked})} />
                                                            <span className="text-xs">FMO</span>
                                                            {newVehiculo.esFMO && <Input placeholder="N° FMO" className="h-7 w-20 text-xs" value={newVehiculo.fmo} onChange={e => setNewVehiculo({...newVehiculo, fmo: e.target.value})} />}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSaveVehiculo}>
                                                                <Save className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setIsAddingVehiculo(false)}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {loading ? (
                                                <TableRow><TableCell colSpan={3} className="text-center">Cargando vehículos...</TableCell></TableRow>
                                            ) : vehiculos.length === 0 ? (
                                                <TableRow><TableCell colSpan={3} className="text-center">No hay vehículos registrados.</TableCell></TableRow>
                                            ) : vehiculos.map((v) => (
                                                <TableRow key={v.id} className="hover:bg-muted/30 transition-colors">
                                                    {editingVehiculoId === v.id ? (
                                                        <>
                                                            <TableCell><Input className="h-8 uppercase" value={editVehiculo.placa} onChange={e => setEditVehiculo({...editVehiculo, placa: e.target.value})} /></TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <input type="checkbox" checked={editVehiculo.esFMO} onChange={e => setEditVehiculo({...editVehiculo, esFMO: e.target.checked})} />
                                                                    <span className="text-xs">FMO</span>
                                                                    {editVehiculo.esFMO && <Input className="h-7 w-20 text-xs" value={editVehiculo.fmo} onChange={e => setEditVehiculo({...editVehiculo, fmo: e.target.value})} />}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleUpdateVehiculo(v.id)}><Save className="h-4 w-4" /></Button>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setEditingVehiculoId(null)}><X className="h-4 w-4" /></Button>
                                                                </div>
                                                            </TableCell>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TableCell className="font-bold tracking-widest uppercase">{v.placa}</TableCell>
                                                            <TableCell>{v.modelo}</TableCell>
                                                            <TableCell>{v.tipo}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={v.esFMO ? "default" : "outline"} className={v.esFMO ? "bg-orange-600 hover:bg-orange-700" : ""}>
                                                                    {v.esFMO ? "FMO Interno" : "Particular"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => { setEditingVehiculoId(v.id); setEditVehiculo({...v}); }}>
                                                                            <Edit className="h-4 w-4 mr-2" /> Editar
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteVehiculo(v.id)}>
                                                                            <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </>
                                                    )}
                                                </TableRow>
                                            ))}

                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* DESTINOS TAB */}
                    <TabsContent value="destinos">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle>Destinos Frecuentes</CardTitle>
                                    <CardDescription>
                                        Empresas, almacenes o talleres para autocompletar envíos.
                                    </CardDescription>
                                </div>
                                <Button 
                                    size="sm" 
                                    className="gap-2"
                                    onClick={() => setIsAddingDestino(true)}
                                    disabled={isAddingDestino}
                                >
                                    <Plus className="h-4 w-4" />
                                    Nuevo Destino
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border border-slate-200 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead>Nombre / Empresa</TableHead>
                                                <TableHead>Dirección</TableHead>
                                                <TableHead>Teléfono</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isAddingDestino && (
                                                <TableRow className="bg-primary/5">
                                                    <TableCell><Input placeholder="Nombre / Empresa" className="h-8" value={newDestino.nombre} onChange={e => setNewDestino({...newDestino, nombre: e.target.value})} /></TableCell>
                                                    <TableCell><Input placeholder="Dirección" className="h-8" value={newDestino.direccion} onChange={e => setNewDestino({...newDestino, direccion: e.target.value})} /></TableCell>
                                                    <TableCell><Input placeholder="Teléfono" className="h-8" value={newDestino.telefono} onChange={e => setNewDestino({...newDestino, telefono: e.target.value})} /></TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSaveDestino}>
                                                                <Save className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setIsAddingDestino(false)}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {loading ? (
                                                <TableRow><TableCell colSpan={4} className="text-center">Cargando destinos...</TableCell></TableRow>
                                            ) : destinos.length === 0 ? (
                                                <TableRow><TableCell colSpan={4} className="text-center">No hay destinos registrados.</TableCell></TableRow>
                                            ) : destinos.map((d) => (
                                                <TableRow key={d.id} className="hover:bg-muted/30 transition-colors">
                                                    {editingDestinoId === d.id ? (
                                                        <>
                                                            <TableCell><Input className="h-8" value={editDestino.nombre} onChange={e => setEditDestino({...editDestino, nombre: e.target.value})} /></TableCell>
                                                            <TableCell><Input className="h-8" value={editDestino.direccion} onChange={e => setEditDestino({...editDestino, direccion: e.target.value})} /></TableCell>
                                                            <TableCell><Input className="h-8" value={editDestino.telefono} onChange={e => setEditDestino({...editDestino, telefono: e.target.value})} /></TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleUpdateDestino(d.id)}><Save className="h-4 w-4" /></Button>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setEditingDestinoId(null)}><X className="h-4 w-4" /></Button>
                                                                </div>
                                                            </TableCell>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TableCell className="font-semibold">{d.nombre}</TableCell>
                                                            <TableCell className="max-w-xs truncate">{d.direccion}</TableCell>
                                                            <TableCell>{d.telefono}</TableCell>
                                                            <TableCell className="text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => { setEditingDestinoId(d.id); setEditDestino({...d}); }}>
                                                                            <Edit className="h-4 w-4 mr-2" /> Editar
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteDestino(d.id)}>
                                                                            <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </>
                                                    )}
                                                </TableRow>
                                            ))}

                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* EMPLEADOS TAB */}
                    <TabsContent value="empleados">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle>Listado de Empleados</CardTitle>
                                    <CardDescription>
                                        Personal para autocompletar firmas y despachos (sin acceso al sistema).
                                    </CardDescription>
                                </div>
                                <Button 
                                    size="sm" 
                                    className="gap-2"
                                    onClick={() => setIsAddingEmpleado(true)}
                                    disabled={isAddingEmpleado}
                                >
                                    <Plus className="h-4 w-4" />
                                    Registrar Empleado
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border border-slate-200 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead>Ficha</TableHead>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>Cargo</TableHead>
                                                <TableHead>Departamento</TableHead>
                                                <TableHead>Rol de Sistema</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isAddingEmpleado && (
                                                <TableRow className="bg-primary/5">
                                                    <TableCell><Input placeholder="Ficha" className="h-8" value={newEmpleado.ficha} onChange={e => setNewEmpleado({...newEmpleado, ficha: e.target.value})} /></TableCell>
                                                    <TableCell><Input placeholder="Nombre" className="h-8" value={newEmpleado.nombre} onChange={e => setNewEmpleado({...newEmpleado, nombre: e.target.value})} /></TableCell>
                                                    <TableCell><Input placeholder="Cargo" className="h-8" value={newEmpleado.cargo} onChange={e => setNewEmpleado({...newEmpleado, cargo: e.target.value})} /></TableCell>
                                                    <TableCell><Input placeholder="Departamento" className="h-8" value={newEmpleado.departamento} onChange={e => setNewEmpleado({...newEmpleado, departamento: e.target.value})} /></TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSaveEmpleado}>
                                                                <Save className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setIsAddingEmpleado(false)}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {loading ? (
                                                <TableRow><TableCell colSpan={5} className="text-center">Cargando empleados...</TableCell></TableRow>
                                            ) : empleados.length === 0 ? (
                                                <TableRow><TableCell colSpan={5} className="text-center">No hay empleados registrados.</TableCell></TableRow>
                                            ) : empleados.map((e) => (
                                                <TableRow key={e.id} className="hover:bg-muted/30 transition-colors">
                                                    {editingEmpleadoId === e.id ? (
                                                        <>
                                                            <TableCell><Input className="h-8" value={editEmpleado.ficha} onChange={e => setEditEmpleado({...editEmpleado, ficha: e.target.value})} /></TableCell>
                                                            <TableCell><Input className="h-8" value={editEmpleado.nombre} onChange={e => setEditEmpleado({...editEmpleado, nombre: e.target.value})} /></TableCell>
                                                            <TableCell><Input className="h-8" value={editEmpleado.cargo} onChange={e => setEditEmpleado({...editEmpleado, cargo: e.target.value})} /></TableCell>
                                                            <TableCell><Input className="h-8" value={editEmpleado.departamento} onChange={e => setEditEmpleado({...editEmpleado, departamento: e.target.value})} /></TableCell>
                                                            <TableCell colSpan={2} className="text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleUpdateEmpleado(e.id)}><Save className="h-4 w-4" /></Button>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setEditingEmpleadoId(null)}><X className="h-4 w-4" /></Button>
                                                                </div>
                                                            </TableCell>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TableCell className="font-mono">{e.ficha}</TableCell>
                                                            <TableCell className="font-medium">{e.nombre}</TableCell>
                                                            <TableCell>{e.cargo}</TableCell>
                                                            <TableCell>{e.departamento}</TableCell>
                                                            <TableCell>
                                                                <Select 
                                                                    value={e.rol || "Ninguno"} 
                                                                    onValueChange={(val) => handleAssignRoleToEmpleado(e, val)}
                                                                >
                                                                    <SelectTrigger className="h-8 text-xs w-[140px]">
                                                                        <SelectValue placeholder="Sin acceso" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="Ninguno">Sin Acceso</SelectItem>
                                                                        <SelectItem value="Solicitante">Solicitante</SelectItem>
                                                                        <SelectItem value="Conductor">Conductor</SelectItem>
                                                                        <SelectItem value="Despachador">Despachador</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => { setEditingEmpleadoId(e.id); setEditEmpleado({...e}); }}>
                                                                            <Edit className="h-4 w-4 mr-2" /> Editar
                                                                        </DropdownMenuItem>
                                                                        {isAdmin && (
                                                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteEmpleado(e.id)}>
                                                                                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* FOOTER INFO */}
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <p className="text-sm text-primary/80">
                            Los datos aquí registrados estarán disponibles en el formulario de <strong>Nuevo Pase</strong> para agilizar el proceso de llenado.
                        </p>
                    </CardContent>
                </Card>
            </main>

            {/* Password Change Dialog */}
            <Dialog open={isPassModalOpen} onOpenChange={setIsPassModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Seguridad de Usuario</DialogTitle>
                        <DialogDescription>
                            Cambiar la contraseña de <strong>{selectedUserForPass?.nombre}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contraseña Actual</label>
                            <Input 
                                type="password" 
                                placeholder="Escribe la contraseña actual..."
                                value={passData.currentPass} 
                                onChange={e => setPassData({...passData, currentPass: e.target.value})} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nueva Contraseña</label>
                            <Input 
                                type="password" 
                                placeholder="Escribe la nueva contraseña..."
                                value={passData.newPass} 
                                onChange={e => setPassData({...passData, newPass: e.target.value})} 
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">
                            * Se validará la contraseña actual antes de aplicar el cambio.
                        </p>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <Button variant="ghost" onClick={() => setIsPassModalOpen(false)}>Cancelar</Button>
                        <Button variant="default" onClick={handleChangePassword} disabled={!passData.currentPass || !passData.newPass}>
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
