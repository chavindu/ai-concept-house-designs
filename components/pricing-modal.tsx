"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Coins, CreditCard, Sparkles, Zap, Crown, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth/auth-context"
import { usePricingModal } from "@/lib/pricing-modal-context"
import { useToast } from "@/components/ui/use-toast"

interface PricingPlan {
  id: string
  name: string
  description: string
  points: number
  price: number
  originalPrice?: number
  popular?: boolean
  icon: React.ReactNode
  features: string[]
}

const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter Pack",
    description: "Perfect for trying out AI design generation",
    points: 5,
    price: 300,
    icon: <Sparkles className="h-6 w-6" />,
    features: [
      "5 AI design generations",
      "Basic architectural styles",
      "Standard resolution images",
      "Community gallery access",
      "Email support",
    ],
  },
  {
    id: "popular",
    name: "Popular Pack",
    description: "Most popular choice for regular users",
    points: 10,
    price: 500,
    popular: true,
    icon: <Zap className="h-6 w-6" />,
    features: [
      "10 AI design generations",
      "All architectural styles",
      "High resolution images",
      "Priority generation queue",
      "Community gallery access",
      "Architect consultation discount",
      "Priority email support",
    ],
  },
  {
    id: "professional",
    name: "Professional Pack",
    description: "For architects and design professionals",
    points: 25,
    price: 1000,
    icon: <Crown className="h-6 w-6" />,
    features: [
      "25 AI design generations",
      "All architectural styles + Premium",
      "Ultra-high resolution images",
      "Instant generation (no queue)",
      "Commercial usage rights",
      "Free architect consultations (2x)",
      "Priority phone support",
      "Custom style training (coming soon)",
    ],
  },
]

export function PricingModal() {
  const { isOpen, closeModal } = usePricingModal()
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const handlePurchase = async (plan: PricingPlan) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase points",
        variant: "destructive",
      })
      closeModal()
      return
    }

    setProcessingPayment(plan.id)

    try {
      // Create payment record in database
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          package: plan.id,
          amount: plan.price,
          userId: user.id,
          userEmail: user.email,
          userName: user.full_name || user.email?.split('@')[0],
          userPhone: user.phone || "",
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment')
      }

      const paymentData = await response.json()

      // Initialize PayHere payment
      const payherePayment = {
        sandbox: true, // Set to false in production
        merchant_id: paymentData.merchantId,
        return_url: undefined, // Important: set to undefined for popup mode
        cancel_url: undefined, // Important: set to undefined for popup mode
        notify_url: `${window.location.origin}/api/payment/webhook`,
        order_id: paymentData.orderId,
        items: plan.name,
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
        custom_2: plan.points.toString(),
      }

      // Load PayHere script if not already loaded
      if (!window.payhere) {
        const script = document.createElement("script")
        script.src = "https://www.payhere.lk/lib/payhere.js"
        script.onload = () => {
          initiatePayment(payherePayment)
        }
        document.head.appendChild(script)
      } else {
        initiatePayment(payherePayment)
      }
    } catch (error) {
      console.error("Payment initiation error:", error)
      toast({
        title: "Payment Failed",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingPayment(null)
    }
  }

  const initiatePayment = (paymentData: any) => {
    window.payhere.startPayment(paymentData)

    window.payhere.onCompleted = (orderId: string) => {
      console.log("Payment completed. OrderID:" + orderId)
      toast({
        title: "Payment Successful!",
        description: "Your points have been added to your account.",
      })
      closeModal()
      // Refresh the page to update points balance
      window.location.reload()
    }

    window.payhere.onDismissed = () => {
      console.log("Payment dismissed")
      setProcessingPayment(null)
    }

    window.payhere.onError = (error: string) => {
      console.log("Error:" + error)
      toast({
        title: "Payment Failed",
        description: "Payment failed: " + error,
        variant: "destructive",
      })
      setProcessingPayment(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Buy Points</DialogTitle>
          <DialogDescription className="text-center">
            Get points to generate amazing house designs with AI
          </DialogDescription>
        </DialogHeader>

        {/* Points Info */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
          <Coins className="h-4 w-4" />
          <span>1 point = 1 AI design generation</span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">{plan.icon}</div>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl font-bold">LKR {plan.price.toLocaleString()}</span>
                    {plan.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        LKR {plan.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-primary font-semibold">
                    <Coins className="h-4 w-4" />
                    <span>{plan.points.toLocaleString()} points</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      Save LKR {(plan.originalPrice - plan.price).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Purchase Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handlePurchase(plan)}
                  disabled={processingPayment === plan.id}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {processingPayment === plan.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Purchase Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-center mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">How do points work?</h4>
                <p className="text-sm text-muted-foreground">
                  Each AI design generation costs 1 point. Points never expire and can be used anytime.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit/debit cards, online banking, and mobile payments through PayHere.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Can I get a refund?</h4>
                <p className="text-sm text-muted-foreground">
                  Unused points can be refunded within 30 days of purchase. Contact support for assistance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
