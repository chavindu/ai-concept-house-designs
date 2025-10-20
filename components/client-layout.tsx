"use client"

import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/lib/auth/auth-context"
import { DesignProvider } from "@/lib/design-context"
import { PricingModalProvider } from "@/lib/pricing-modal-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PricingModal } from "@/components/pricing-modal"
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
          <PricingModalProvider>
            <div className="min-h-screen bg-background flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <PricingModal />
            <Toaster />
            <Analytics />
          </PricingModalProvider>
        </DesignProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
