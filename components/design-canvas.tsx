"use client"

import { useDesign } from "@/lib/design-context"
import { Button } from "@/components/ui/button"
import { Download, Share2, RotateCcw } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export function DesignCanvas() {
  const { 
    generatedDesign, 
    isGenerating, 
    generatedPerspectives, 
    currentPerspective, 
    switchPerspective,
    addGeneratedPerspective,
    baseImageForEditing,
    originalFormData
  } = useDesign()
  const [isEditingPerspective, setIsEditingPerspective] = useState(false)
  const [timerText, setTimerText] = useState("0.00")
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  // High-resolution timer shown during generation or perspective editing
  useEffect(() => {
    const isActive = isGenerating || isEditingPerspective
    if (!isActive) {
      // Stop and reset when not active
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      startRef.current = null
      setTimerText("0.00")
      return
    }

    const tick = (now: number) => {
      if (startRef.current == null) startRef.current = now
      const elapsedMs = Math.max(0, now - startRef.current)
      const seconds = elapsedMs / 1000
      // Format as S.MS with two decimals
      setTimerText(seconds.toFixed(2))
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [isGenerating, isEditingPerspective])

  const handlePerspectiveClick = async (perspective: string) => {
    // If perspective is already generated, just switch to it
    if (generatedPerspectives[perspective as keyof typeof generatedPerspectives]) {
      switchPerspective(perspective)
      return
    }

    // If not generated, need to edit the base image
    if (!baseImageForEditing || !originalFormData) {
      console.error("Missing base image or form data for perspective editing")
      return
    }

    setIsEditingPerspective(true)

    try {
      // Get session token
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        console.error("No session found")
        return
      }

      const response = await fetch("/api/edit-design-perspective", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          baseImageUrl: baseImageForEditing,
          newPerspective: perspective,
          originalFormData: originalFormData
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Add the new perspective to cache
        addGeneratedPerspective(perspective, {
          imageUrl: result.imageUrl,
          thumbnailUrl: result.thumbnailUrl,
          designId: result.designId,
          isWatermarked: result.isWatermarked,
          prompt: originalFormData.perspective,
          remainingPoints: result.remainingPoints
        })

        // Switch to the new perspective
        switchPerspective(perspective)
      } else {
        const errorData = await response.json()
        console.error("Perspective editing failed:", errorData.error)
        // TODO: Show error message to user
      }
    } catch (error) {
      console.error("Perspective editing error:", error)
      // TODO: Show error message to user
    } finally {
      setIsEditingPerspective(false)
    }
  }

  if (isGenerating) {
    return (
      <div id="design-canvas" className="space-y-4">
        <div className="aspect-square rounded-lg overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
          <div className="text-center" role="status" aria-live="polite">
            <div className="text-sm text-muted-foreground mb-1">Generating…</div>
            <div className="text-5xl font-semibold tabular-nums">{timerText}</div>
          </div>
        </div>
        {/* Keep buttons consistently below the canvas while generating */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button 
            variant={currentPerspective === 'front-left' ? 'default' : 'outline'} 
            size="sm" 
            disabled={isEditingPerspective}
            onClick={() => handlePerspectiveClick('front-left')}
          >
            {generatedPerspectives['front-left'] ? 'Front-Left View (Generated)' : 'Front-Left View (1 Point)'}
          </Button>
          <Button 
            variant={currentPerspective === 'front' ? 'default' : 'outline'} 
            size="sm" 
            disabled={isEditingPerspective}
            onClick={() => handlePerspectiveClick('front')}
          >
            {generatedPerspectives['front'] ? 'Front View (Generated)' : 'Front View (1 Point)'}
          </Button>
          <Button 
            variant={currentPerspective === 'front-right' ? 'default' : 'outline'} 
            size="sm" 
            disabled={isEditingPerspective}
            onClick={() => handlePerspectiveClick('front-right')}
          >
            {generatedPerspectives['front-right'] ? 'Front-Right View (Generated)' : 'Front-Right View (1 Point)'}
          </Button>
        </div>
      </div>
    )
  }

  if (isEditingPerspective) {
    return (
      <div id="design-canvas" className="space-y-4">
        <div className="aspect-square rounded-lg overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
          <div className="text-center" role="status" aria-live="polite">
            <div className="text-sm text-muted-foreground mb-1">Editing…</div>
            <div className="text-5xl font-semibold tabular-nums">{timerText}</div>
          </div>
        </div>
        {/* Keep buttons consistently below the canvas while editing */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button 
            variant={currentPerspective === 'front-left' ? 'default' : 'outline'} 
            size="sm" 
            disabled={isEditingPerspective}
            onClick={() => handlePerspectiveClick('front-left')}
          >
            {generatedPerspectives['front-left'] ? 'Front-Left View (Generated)' : 'Front-Left View (1 Point)'}
          </Button>
          <Button 
            variant={currentPerspective === 'front' ? 'default' : 'outline'} 
            size="sm" 
            disabled={isEditingPerspective}
            onClick={() => handlePerspectiveClick('front')}
          >
            {generatedPerspectives['front'] ? 'Front View (Generated)' : 'Front View (1 Point)'}
          </Button>
          <Button 
            variant={currentPerspective === 'front-right' ? 'default' : 'outline'} 
            size="sm" 
            disabled={isEditingPerspective}
            onClick={() => handlePerspectiveClick('front-right')}
          >
            {generatedPerspectives['front-right'] ? 'Front-Right View (Generated)' : 'Front-Right View (1 Point)'}
          </Button>
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

        {/* Perspective Buttons under canvas */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button 
            variant={currentPerspective === 'front-left' ? 'default' : 'outline'} 
            size="sm" 
            disabled={isEditingPerspective}
            onClick={() => handlePerspectiveClick('front-left')}
          >
            {generatedPerspectives['front-left'] ? 'Front-Left View (Generated)' : 'Front-Left View (1 Point)'}
          </Button>
          <Button 
            variant={currentPerspective === 'front' ? 'default' : 'outline'} 
            size="sm" 
            disabled={isEditingPerspective}
            onClick={() => handlePerspectiveClick('front')}
          >
            {generatedPerspectives['front'] ? 'Front View (Generated)' : 'Front View (1 Point)'}
          </Button>
          <Button 
            variant={currentPerspective === 'front-right' ? 'default' : 'outline'} 
            size="sm" 
            disabled={isEditingPerspective}
            onClick={() => handlePerspectiveClick('front-right')}
          >
            {generatedPerspectives['front-right'] ? 'Front-Right View (Generated)' : 'Front-Right View (1 Point)'}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {!isTextContent && (
            <>
              <Button variant="outline" size="sm" onClick={() => {
                if (!generatedDesign?.imageUrl) return
                const link = document.createElement('a')
                const ts = new Date().toISOString().replace(/[:.]/g, '-')
                link.href = generatedDesign.imageUrl
                link.download = `design-${(generatedDesign.prompt || 'style').replace(/\s+/g,'-')}-${currentPerspective}-${ts}.png`
                document.body.appendChild(link)
                link.click()
                link.remove()
              }}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={async () => {
                if (!generatedDesign?.imageUrl) return
                try {
                  const shareUrl = generatedDesign.imageUrl
                  if (navigator.share) {
                    await navigator.share({ title: 'AI House Design', url: shareUrl })
                  } else {
                    await navigator.clipboard.writeText(shareUrl)
                  }
                } catch {}
              }}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </>
          )}
        </div>

        {/* Design Info */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Remaining points: {generatedDesign.remainingPoints}
          </p>
        </div>
      </div>
    )
  }

  // Default placeholder
  return (
    <div className="space-y-4">
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
      <div className="flex flex-wrap gap-2 justify-center">
        <Button 
          variant={currentPerspective === 'front-left' ? 'default' : 'outline'} 
          size="sm" 
          disabled={isEditingPerspective}
          onClick={() => handlePerspectiveClick('front-left')}
        >
          {generatedPerspectives['front-left'] ? 'Front-Left View (Generated)' : 'Front-Left View (1 Point)'}
        </Button>
        <Button 
          variant={currentPerspective === 'front' ? 'default' : 'outline'} 
          size="sm" 
          disabled={isEditingPerspective}
          onClick={() => handlePerspectiveClick('front')}
        >
          {generatedPerspectives['front'] ? 'Front View (Generated)' : 'Front View (1 Point)'}
        </Button>
        <Button 
          variant={currentPerspective === 'front-right' ? 'default' : 'outline'} 
          size="sm" 
          disabled={isEditingPerspective}
          onClick={() => handlePerspectiveClick('front-right')}
        >
          {generatedPerspectives['front-right'] ? 'Front-Right View (Generated)' : 'Front-Right View (1 Point)'}
        </Button>
      </div>
    </div>
  )
}
