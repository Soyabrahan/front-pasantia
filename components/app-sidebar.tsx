"use client"

import { Calendar, Home, Inbox, Search, Settings, Truck, History, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
    {
        title: "Nuevo Pase",
        url: "/",
        icon: Home,
    },
    {
        title: "Historial",
        url: "/historial",
        icon: History,
    },
    {
        title: "Configuración",
        url: "/configuracion",
        icon: Settings,
    },
]

export function AppSidebar() {
    const router = useRouter()

    const handleLogout = () => {
        localStorage.removeItem("auth_token")
        router.push("/login")
    }

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Gestión de Pases</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            onClick={handleLogout}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut />
                            <span>Cerrar Sesión</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
