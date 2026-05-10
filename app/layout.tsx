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
    const isValidToken = !!token && token !== "null" && token !== "undefined"

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

