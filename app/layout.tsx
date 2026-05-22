"use client"

import React, { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from "sonner"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"

const outfit = localFont({ 
  src: '../public/fonts/Outfit-VariableFont_wght.ttf',
  variable: '--font-outfit',
  display: 'swap',
})

const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return true
    
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = base64.length % 4
    if (pad) {
      base64 += '='.repeat(4 - pad)
    }
    
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const payload = JSON.parse(jsonPayload)
    const expiry = payload.exp * 1000
    return Date.now() >= expiry
  } catch (e) {
    return true
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const router = useRouter()
  
  // Handle trailing slashes for auth pages
  const isAuthPage = pathname === "/login" || pathname === "/login/" || pathname === "/register" || pathname === "/register/"

  const [isMounted, setIsMounted] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  useEffect(() => {
    setIsMounted(true)
    const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null
    const isValidToken = !!token && token !== "null" && token !== "undefined" && !isTokenExpired(token)

    if (token && isTokenExpired(token)) {
      localStorage.removeItem("auth_token")
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }

    if (!isValidToken && !isAuthPage) {
      setIsLoading(true) 
      router.push("/login")
    } else if (isValidToken && isAuthPage) {
      setIsLoading(true)
      router.push("/")
    } else {
      setIsLoading(false)
    }
  }, [isAuthPage, pathname, router])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased text-foreground bg-background ${outfit.variable}`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {(!isMounted || (isLoading && !isAuthPage)) ? (
            <div className="flex items-center justify-center min-h-screen bg-background">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {isAuthPage ? (
                <main>{children}</main>
              ) : (
                <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset className="bg-background">
                    {children}
                  </SidebarInset>
                </SidebarProvider>
              )}
              <Toaster position="top-right" richColors theme="dark" />
              <Analytics />
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}

