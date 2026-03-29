"use client"

import React from "react"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

interface HeaderProps {
    title: string
    subtitle?: string
    icon: React.ElementType
    rightElement?: React.ReactNode
    maxWidth?: string
}

export function Header({ 
    title, 
    subtitle, 
    icon: Icon, 
    rightElement,
    maxWidth = "max-w-5xl" 
}: HeaderProps) {
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"

    return (
        <header 
            className={cn(
                "bg-primary text-primary-foreground sticky top-0 z-50 shadow-lg mb-8 transition-all duration-200"
            )}
        >
            <div 
                className={cn(
                    "mx-auto px-4 py-4 flex items-center justify-between transition-all duration-200",
                    isCollapsed ? "max-w-full" : maxWidth
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center shrink-0">
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className="overflow-hidden">
                        <h1 className="text-lg font-bold tracking-tight truncate uppercase">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-xs text-primary-foreground/70 truncate">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {rightElement && (
                    <div className="flex items-center gap-2">
                        {rightElement}
                    </div>
                )}
            </div>
        </header>
    )
}
