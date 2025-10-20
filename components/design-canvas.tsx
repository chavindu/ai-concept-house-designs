"use client"

import { useDesign } from "@/lib/design-context"
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Download, Share2, RotateCcw, CreditCard, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"

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
  const { user } = useAuth()
  const router = useRouter()
  const [isEditingPerspective, setIsEditingPerspective] = useState(false)
  const [timerText, setTimerText] = useState("0.00")
  const [processingPayment, setProcessingPayment] = useState(false)
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false)
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
      // Check authentication (handled by API route)
      console.log("Starting perspective edit...")

      const response = await fetch("/api/edit-design-perspective", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
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

  const handlePurchaseBasicPackage = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setProcessingPayment(true)
    setIsPackageModalOpen(false) // Close the package modal

    try {
      // Create payment record and get hash from server
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          package: "basic-design",
          amount: 10000,
          userId: user.id,
          designId: generatedDesign?.designId,
          userEmail: user.email,
          userName: user.user_metadata?.full_name,
          userPhone: user.user_metadata?.phone
        })
      })

      if (!response.ok) {
        throw new Error("Failed to create payment")
      }

      const paymentData = await response.json()

      // Initialize PayHere payment using official SDK
      const payment = {
        sandbox: true, // Set to false in production
        merchant_id: paymentData.merchantId,
        return_url: undefined, // Important: set to undefined for popup mode
        cancel_url: undefined, // Important: set to undefined for popup mode
        notify_url: `${window.location.origin}/api/payment/webhook`,
        order_id: paymentData.orderId,
        items: "Basic Design Package - Detailed Floor Plans & Elevations",
        amount: paymentData.amount,
        currency: paymentData.currency,
        hash: paymentData.hash, // Server-generated hash for security
        first_name: paymentData.firstName,
        last_name: paymentData.lastName,
        email: paymentData.email,
        phone: paymentData.phone,
        address: "",
        city: "Colombo",
        country: "Sri Lanka",
        delivery_address: "",
        delivery_city: "Colombo",
        delivery_country: "Sri Lanka",
        custom_1: user.id,
        custom_2: "0", // No points for design packages
        custom_3: generatedDesign?.designId || "",
      }

      // Load PayHere script if not already loaded
      if (!window.payhere) {
        const script = document.createElement("script")
        script.src = "https://www.payhere.lk/lib/payhere.js"
        script.onload = () => {
          initiatePayment(payment)
        }
        document.head.appendChild(script)
      } else {
        initiatePayment(payment)
      }
    } catch (error) {
      console.error("Payment initiation error:", error)
      alert("Failed to initiate payment. Please try again.")
    } finally {
      setProcessingPayment(false)
    }
  }

  const initiatePayment = (payment: any) => {
    // Set up PayHere event handlers
    window.payhere.onCompleted = function onCompleted(orderId: string) {
      console.log("Payment completed. OrderID:", orderId)
      // Redirect to success page
      window.location.href = `/payment/success?order_id=${orderId}`
    }

    window.payhere.onDismissed = function onDismissed() {
      console.log("Payment dismissed")
      // Payment window was closed by user
      setIsPackageModalOpen(false) // Ensure modal stays closed
    }

    window.payhere.onError = function onError(error: string) {
      console.log("Payment error:", error)
      alert("Payment failed. Please try again.")
      setIsPackageModalOpen(false) // Ensure modal stays closed
    }

    // Start the payment
    window.payhere.startPayment(payment)

    // Increase z-index of PayHere popup after it's created
    setTimeout(() => {
      // Close any open modals
      setIsPackageModalOpen(false)
      
      // Find and modify PayHere elements
      const payhereIframe = document.querySelector('iframe[src*="payhere"]') as HTMLIFrameElement
      if (payhereIframe) {
        payhereIframe.style.zIndex = '999999'
        payhereIframe.style.position = 'fixed'
        payhereIframe.style.top = '0'
        payhereIframe.style.left = '0'
        payhereIframe.style.width = '100%'
        payhereIframe.style.height = '100%'
        payhereIframe.style.pointerEvents = 'auto'
      }
      
      // Also check for PayHere modal/overlay elements
      const payhereModal = document.querySelector('[class*="payhere"], [id*="payhere"]') as HTMLElement
      if (payhereModal) {
        payhereModal.style.zIndex = '999999'
        payhereModal.style.pointerEvents = 'auto'
      }

      // Disable pointer events on all other modals
      const allModals = document.querySelectorAll('[data-radix-portal], [role="dialog"]')
      allModals.forEach(modal => {
        if (!modal.querySelector('iframe[src*="payhere"]')) {
          modal.style.pointerEvents = 'none'
          modal.style.zIndex = '1'
        }
      })
    }, 100)
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

			{/* Make it real CTA */}
			{!isTextContent && (
				<div className="flex justify-center">
					<Dialog open={isPackageModalOpen} onOpenChange={setIsPackageModalOpen}>
						<DialogTrigger asChild>
							<Button size="lg" className="mt-2">
								Make your dream house real
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-6xl" style={{ zIndex: 1000 }}>
							<DialogHeader>
								<DialogTitle>Make your dream house real</DialogTitle>
								<DialogDescription>
									Choose a path to move from concept to construction with vetted professionals and packages.
								</DialogDescription>
							</DialogHeader>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{/* Package 1: Direct Payment */}
								<Card>
									<CardHeader>
										<CardTitle>Basic Design Package</CardTitle>
										<CardDescription>Get detailed floor plans and elevations for your design concept.</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											<div className="text-2xl font-bold text-primary">LKR 10,000</div>
											<ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
												<li>Detailed floor plans</li>
												<li>Front and side elevations</li>
												<li>Basic structural guidance</li>
												<li>Digital delivery within 7 days</li>
											</ul>
										</div>
									</CardContent>
									<CardFooter>
										<Button 
											className="w-full" 
											onClick={handlePurchaseBasicPackage}
											disabled={processingPayment}
										>
											{processingPayment ? (
												<>
													<Loader2 className="h-4 w-4 mr-2 animate-spin" />
													Processing...
												</>
											) : (
												<>
													<CreditCard className="h-4 w-4 mr-2" />
													Purchase
												</>
											)}
										</Button>
									</CardFooter>
								</Card>

								{/* Package 2: Calendly Consultation */}
								<Card>
									<CardHeader>
										<CardTitle>Architect Consultation</CardTitle>
										<CardDescription>Book a 1-hour consultation with a licensed architect to discuss your project.</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											<div className="text-lg font-semibold text-muted-foreground">Starting from LKR 5,000</div>
											<ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
												<li>1-hour video consultation</li>
												<li>Project feasibility review</li>
												<li>Budget and timeline guidance</li>
												<li>Next steps recommendations</li>
											</ul>
										</div>
									</CardContent>
									<CardFooter>
										<Button asChild variant="secondary" className="w-full">
											<a href="https://calendly.com/your-architect" target="_blank" rel="noopener noreferrer" aria-label="Book architect consultation">
												Book Consultation
											</a>
										</Button>
									</CardFooter>
								</Card>

								{/* Package 3: Calendly Full Service */}
								<Card>
									<CardHeader>
										<CardTitle>Full Design Service</CardTitle>
										<CardDescription>Complete architectural design service from concept to construction drawings.</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											<div className="text-lg font-semibold text-muted-foreground">Custom Pricing</div>
											<ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
												<li>Initial consultation call</li>
												<li>Complete architectural drawings</li>
												<li>Structural engineering coordination</li>
												<li>Construction support</li>
											</ul>
										</div>
									</CardContent>
									<CardFooter>
										<Button asChild variant="outline" className="w-full">
											<a href="https://calendly.com/your-architect-full-service" target="_blank" rel="noopener noreferrer" aria-label="Book full design service consultation">
												Book Consultation
											</a>
										</Button>
									</CardFooter>
								</Card>
							</div>
							<DialogFooter>
								<Button variant="ghost">Close</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			)}

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
