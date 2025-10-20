import type React from "react"
import { usePricingModal } from "@/lib/pricing-modal-context"

export function Footer(): React.ReactElement {
  const { openModal: openPricingModal } = usePricingModal()
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Architecture.lk</span>
        <div className="flex items-center gap-4">
          <button onClick={openPricingModal} className="hover:text-foreground transition-colors">Pricing</button>
          <a href="/gallery" className="hover:text-foreground transition-colors">Gallery</a>
        </div>
      </div>
    </footer>
  )
}


