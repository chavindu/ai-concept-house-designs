"use client"

import { useDesign } from "@/lib/design-context"
import { Button } from "@/components/ui/button"
import { Download, Share2, RotateCcw } from "lucide-react"

export function DesignCanvas() {
  const { generatedDesign, isGenerating } = useDesign()

  if (isGenerating) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <p className="text-lg font-medium">Generating your design...</p>
            <p className="text-sm text-muted-foreground">This may take a few moments</p>
          </div>
        </div>
      </div>
    )
  }

  if (generatedDesign) {
    const isTextContent = generatedDesign.imageUrl.startsWith('data:text/')
    
    return (
      <div id="design-canvas" className="space-y-4">
        <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-border">
          {isTextContent ? (
            <div className="w-full h-full p-4 flex items-center justify-center bg-background">
              <div className="text-center space-y-2 max-w-full">
                <div className="text-lg font-medium text-destructive mb-2">
                  Image Generation Issue
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {(() => {
                    try {
                      const base64Data = generatedDesign.imageUrl.split(',')[1]
                      const textContent = atob(base64Data)
                      return textContent
                    } catch (error) {
                      return "Unable to display error message"
                    }
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <img
              src={generatedDesign.imageUrl}
              alt="Generated house design"
              className="w-full h-full object-cover"
            />
          )}
          {generatedDesign.isWatermarked && !isTextContent && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Architecture.lk
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {!isTextContent && (
            <>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </>
          )}
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            {isTextContent ? "Try Again" : "Regenerate"}
          </Button>
        </div>

        {/* Design Info */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {generatedDesign.descriptionEn}
          </p>
          <p className="text-xs text-muted-foreground">
            Remaining points: {generatedDesign.remainingPoints}
          </p>
        </div>
      </div>
    )
  }

  // Default placeholder
  return (
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
  )
}
