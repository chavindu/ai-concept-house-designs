import { Header } from "@/components/header"
import { DesignGenerator } from "@/components/design-generator"
import { CommunityGallery } from "@/components/community-gallery"
import { DesignCanvas } from "@/components/design-canvas"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Main Design Interface */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Canvas Area - Sticky */}
          <div className="order-2 lg:order-1">
            <div className="sticky top-6">
              <DesignCanvas />
            </div>
          </div>

          {/* Right: Input Parameters */}
          <div className="order-1 lg:order-2">
            <DesignGenerator />
          </div>
        </div>

        {/* Community Gallery */}
        <CommunityGallery />
      </main>
    </div>
  )
}
