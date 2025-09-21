import { Header } from "@/components/header"
import { DesignGenerator } from "@/components/design-generator"
import { CommunityGallery } from "@/components/community-gallery"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Main Design Interface */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Canvas Area */}
          <div className="order-2 lg:order-1 space-y-4">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-muted-foreground/10 rounded-lg mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-muted-foreground">Your generated design will appear here</p>
              </div>
            </div>

            {/* Perspective Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                Front (1 point)
              </button>
              <button className="px-4 py-2 bg-muted text-muted-foreground rounded-md text-sm font-medium hover:bg-muted/80">
                Front-left (1 point)
              </button>
              <button className="px-4 py-2 bg-muted text-muted-foreground rounded-md text-sm font-medium hover:bg-muted/80">
                Front-right (1 point)
              </button>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80">
                Regenerate (1 point)
              </button>
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
