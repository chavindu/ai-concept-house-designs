"use client"

import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/lib/auth/auth-context"
import { DesignProvider } from "@/lib/design-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        <DesignProvider>
          <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
          <Analytics />
        </DesignProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
