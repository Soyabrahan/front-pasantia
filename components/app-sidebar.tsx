"use client"

import React, { useEffect, useState } from "react"
import { Calendar, Home, Inbox, Search, Settings, Truck, History, LogOut, FileText, Moon, Sun, ShieldCheck, LayoutDashboard } from "lucide-react"
import { useTheme } from "next-themes"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { decodeToken, getToken, getTokenRole } from "@/lib/auth-utils"

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

const baseItems = [
    {
        title: "Pases",
        url: "/", 
        icon: FileText,
    },
    {
        title: "Dashboard",
        url: "/dashboard", 
        icon: LayoutDashboard,
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

import { ServerStatus } from "@/components/server-status"

export function AppSidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const [userName, setUserName] = useState("Usuario")
    const [userRole, setUserRole] = useState("")
    const { setOpen, state } = useSidebar()
    const isCollapsed = state === "collapsed"
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark"
        
        // Check if browser supports startViewTransition
        if (!document.startViewTransition) {
            setTheme(nextTheme)
            return
        }

        document.startViewTransition(() => {
            setTheme(nextTheme)
        })
    }

    useEffect(() => {
        const token = getToken()
        if (token) {
            const payload = decodeToken(token)
            if (payload) {
                setUserName(payload.nombre || payload.username || payload.ficha || payload.sub || "Usuario")
                setUserRole(getTokenRole(payload))
            }
        }
    }, [])

    const handleLogout = async () => {
        try {
            const { api } = await import("@/lib/api-client");
            await api.post("/auth/logout", {});
        } catch (e) {
            console.error("Error al notificar logout", e);
        }
        localStorage.removeItem("auth_token")
        router.push("/login")
    }

    const items = [...baseItems];
    if (userRole === "admin" || userRole === "ADMIN" || userRole.toLowerCase() === "administrador") {
        items.push({
            title: "Auditoría",
            url: "/auditoria",
            icon: ShieldCheck,
        });
    }

    // Colors:
    // Sidebar background is the primary red, Active is a slightly lighter transition
    const sidebarBg = "bg-primary" 
    const activeBg = "bg-primary/80" 

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
                        <img src="/ferro.ico" alt="Ferrominera Logo" className="w-full h-full object-contain" />
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
                                            className={`relative h-12 transition-all duration-200 group-data-[collapsible=icon]:h-14 overflow-hidden group/sidebar-item
                                                ${isActive 
                                                    ? `${activeBg} text-white font-medium hover:${activeBg}` 
                                                    : 'text-white/80 hover:bg-white/10 hover:text-white'}`
                                            }
                                        >
                                            <Link href={item.url} className="flex items-center w-full">
                                                {isActive && (
                                                    <div className="absolute left-0 top-0 w-1 h-full bg-[#00529b]" />
                                                )}
                                                <item.icon className={`size-5 transition-transform duration-300 ease-out group-hover/sidebar-item:scale-110 group-active/sidebar-item:scale-95 group-data-[collapsible=icon]:size-7 ${isActive ? "text-white scale-110" : "text-white/80"}`} />
                                                <span className="text-base ml-2 transition-transform duration-300 group-hover/sidebar-item:translate-x-1">{item.title}</span>
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
                    <ServerStatus 
                        hideText={isCollapsed} 
                        className={isCollapsed ? "items-center" : ""} 
                    />
                    <div className="flex items-center px-1 overflow-hidden group-data-[collapsible=icon]:hidden justify-between">

                        <span className="truncate text-[15px] font-medium text-white/90" style={{ fontFamily: "Arial, sans-serif" }}>
                            Usuario: {userName}
                        </span>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={toggleTheme}
                                className="size-[18px] shrink-0 text-white/70 cursor-pointer hover:text-white transition-colors focus:outline-none"
                                title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                            >
                                {theme === "dark" ? <Sun className="size-full" /> : <Moon className="size-full" />}
                            </button>
                            <Link href="/configuracion">
                                <Settings className="size-[18px] shrink-0 text-white/70 cursor-pointer hover:text-white transition-colors" />
                            </Link>
                        </div>
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
