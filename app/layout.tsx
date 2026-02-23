"use client"

import React, { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from "sonner"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const router = useRouter()
  const isAuthPage = pathname === "/login" || pathname === "/register"

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token && !isAuthPage) {
      router.push("/login")
    }
  }, [isAuthPage, pathname, router])

  return (
    <html lang="en">
      <body className={`font-sans antialiased text-white bg-[#0A0A0A]`}>
        {isAuthPage ? (
          <main>{children}</main>
        ) : (
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-[#0A0A0A] border-l border-white/5">
              {children}
            </SidebarInset>
          </SidebarProvider>
        )}
        <Toaster position="top-right" richColors theme="dark" />
        <Analytics />
      </body>
    </html>
  )
}
