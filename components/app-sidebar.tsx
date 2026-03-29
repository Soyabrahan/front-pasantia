"use client"

import React, { useEffect, useState } from "react"
import { Calendar, Home, Inbox, Search, Settings, Truck, History, LogOut, FileText } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

const items = [
    {
        title: "Pases",
        url: "/", 
        icon: FileText,
    },
    {
        title: "Configuración",
        url: "/configuracion",
        icon: Settings,
    },
    {
        title: "Reportes",
        url: "/historial", 
        icon: History,
    },
]

export function AppSidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const [userName, setUserName] = useState("Usuario")
    const { setOpen } = useSidebar()

    useEffect(() => {
        const token = localStorage.getItem("auth_token")
        if (token) {
            try {
                const tokenParts = token.split('.');
                if (tokenParts.length < 2) {
                    throw new Error("Formato de token inválido");
                }
                let base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
                const pad = base64.length % 4;
                if (pad) {
                    base64 += '='.repeat(4 - pad);
                }
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
                    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                ).join(''));
                const payload = JSON.parse(jsonPayload);
                setUserName(payload.nombre || payload.username || payload.ficha || payload.sub || "Usuario")
            } catch (e) {
                console.error("Error decoding token", e)
            }
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("auth_token")
        router.push("/login")
    }

    // Colors:
    // Muestra: Sidebar background is dark red, Active is bright red.
    const sidebarBg = "bg-[#8A1538]" 
    const activeBg = "bg-[#B11739]" 

    return (
        <Sidebar 
            collapsible="icon" 
            className={`border-r-0 ${sidebarBg} text-white`}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <SidebarHeader className="h-20 flex items-center justify-center pt-6 pb-2">
                <div className="flex w-full items-center justify-center gap-2 overflow-hidden">
                    <div className="flex aspect-square size-[3rem] items-center justify-center shrink-0">
                        <img src="/ferro.png" alt="Ferrominera Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="truncate font-bold text-2xl tracking-widest group-data-[collapsible=icon]:hidden ml-2">
                        FMOPASES
                    </span>
                </div>
            </SidebarHeader>
            <SidebarContent className="mt-6">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2">
                            {items.map((item) => {
                                const isActive = pathname === item.url
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton 
                                            asChild 
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className={`relative h-12 hover:bg-white/10 hover:text-white transition-colors group-data-[collapsible=icon]:h-14
                                                ${isActive 
                                                    ? `${activeBg} text-white font-medium hover:${activeBg}` 
                                                    : 'text-white/80'}`
                                            }
                                        >
                                            <Link href={item.url}>
                                                {isActive && (
                                                    <div className="absolute left-0 top-0 w-1 h-full bg-[#00529b]" />
                                                )}
                                                <item.icon className={`size-5 group-data-[collapsible=icon]:size-7 ${isActive ? "text-white" : "text-white/80"}`} />
                                                <span className="text-base ml-1">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t border-white/10 mt-auto">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center px-1 overflow-hidden group-data-[collapsible=icon]:hidden justify-between">
                        <span className="truncate text-[15px] font-medium text-white/90" style={{ fontFamily: "Arial, sans-serif" }}>
                            Usuario: {userName}
                        </span>
                        <Settings className="size-[18px] shrink-0 text-white/70 cursor-pointer hover:text-white transition-colors" />
                    </div>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton 
                                onClick={handleLogout}
                                tooltip="Cerrar Sesión"
                                className="bg-[#E5E5E5] text-[#333333] hover:bg-white hover:text-black transition-colors rounded-md h-10 font-bold justify-center
                                    group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:aspect-square group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-12"
                            >
                                <LogOut className="size-5 shrink-0 group-data-[collapsible=icon]:size-6" />
                                <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
