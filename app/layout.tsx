import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { DesignProvider } from "@/lib/design-context"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Architecture.lk - AI-Powered House Design Platform",
  description:
    "Generate stunning concept house designs with AI. Professional architectural visualization for Sri Lankan homes.",
  generator: "Architecture.lk",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body 
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
        suppressHydrationWarning={true}
      >
        <DesignProvider>
          <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
              <Suspense fallback={null}>{children}</Suspense>
            </main>
            <Footer />
          </div>
        </DesignProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
