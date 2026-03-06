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

  const [isMounted, setIsMounted] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  useEffect(() => {
    setIsMounted(true)
    const token = localStorage.getItem("auth_token")
    // Validar que el token no sea solo nulo o "null"/"undefined" como string
    const isValidToken = !!token && token !== "null" && token !== "undefined"

    if (!isValidToken && !isAuthPage) {
      router.push("/login")
    } else if (isValidToken && isAuthPage) {
      router.push("/")
    } else {
      setIsLoading(false)
    }
  }, [isAuthPage, pathname, router])

  return (
    <html lang="en">
      <body className="font-sans antialiased text-white bg-[#0A0A0A]">
        {(!isMounted || (isLoading && !isAuthPage)) ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </body>
    </html>
  )
}
