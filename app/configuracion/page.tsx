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
    Truck as TruckHeaderIcon
} from "lucide-react"

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

// Mock Data
const MOCK_USERS = [
    { id: 1, ficha: "15508", nombre: "Carmen Marquez", cargo: "Gerente de Telemática (e)", depto: "Telemática", rol: "Autorizador" },
    { id: 2, ficha: "12197", nombre: "Leida Ayala", cargo: "Analista de Sistemas", depto: "Soporte Técnico", rol: "Solicitante" },
]

const MOCK_VEHICLES = [
    { id: 1, placa: "AB123CD", modelo: "Toyota Hilux", tipo: "Pickup", esFMO: true },
    { id: 2, placa: "XY789ZW", modelo: "Ford Ranger", tipo: "Pickup", esFMO: false },
]

const MOCK_DESTINOS = [
    { id: 1, nombre: "Almacén Central", direccion: "Av. Caracas, Galpón 4", telefono: "0286-9234455" },
    { id: 2, nombre: "Taller Externo", direccion: "Zona Industrial Matanzas", telefono: "0414-8889900" },
]

export default function ConfigurationPage() {
    const [activeTab, setActiveTab] = useState("usuarios")

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
                    <TabsList className="grid w-full grid-cols-3 md:w-[400px] mb-4">
                        <TabsTrigger value="usuarios" className="flex gap-2">
                            <UsersIcon className="h-4 w-4" />
                            Usuarios
                        </TabsTrigger>
                        <TabsTrigger value="vehiculos" className="flex gap-2">
                            <Truck className="h-4 w-4" />
                            Vehículos
                        </TabsTrigger>
                        <TabsTrigger value="destinos" className="flex gap-2">
                            <MapPin className="h-4 w-4" />
                            Destinos
                        </TabsTrigger>
                    </TabsList>

                    {/* USUARIOS TAB */}
                    <TabsContent value="usuarios">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle>Perfiles de Usuario</CardTitle>
                                    <CardDescription>
                                        Listado de empleados registrados para emitir o autorizar pases.
                                    </CardDescription>
                                </div>
                                <Button size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Agregar Usuario
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por ficha o nombre..."
                                            className="pl-8 border-slate-300"
                                        />
                                    </div>
                                </div>
                                <div className="rounded-md border border-slate-200 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead className="w-[100px]">Ficha</TableHead>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>Departamento</TableHead>
                                                <TableHead>Rol</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {MOCK_USERS.map((user) => (
                                                <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="font-mono font-medium">{user.ficha}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{user.nombre}</div>
                                                            <div className="text-xs text-muted-foreground">{user.cargo}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{user.depto}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.rol === "Autorizador" ? "default" : "secondary"}>
                                                            {user.rol}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
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
                                <Button size="sm" className="gap-2">
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
                                                <TableHead>Modelo</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Pertenece a</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {MOCK_VEHICLES.map((v) => (
                                                <TableRow key={v.id} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="font-bold tracking-widest uppercase">{v.placa}</TableCell>
                                                    <TableCell>{v.modelo}</TableCell>
                                                    <TableCell>{v.tipo}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={v.esFMO ? "default" : "outline"} className={v.esFMO ? "bg-orange-600 hover:bg-orange-700" : ""}>
                                                            {v.esFMO ? "FMO Interno" : "Particular"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
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
                                <Button size="sm" className="gap-2">
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
                                            {MOCK_DESTINOS.map((d) => (
                                                <TableRow key={d.id} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="font-semibold">{d.nombre}</TableCell>
                                                    <TableCell className="max-w-xs truncate">{d.direccion}</TableCell>
                                                    <TableCell>{d.telefono}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
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
        </div>
    )
}
