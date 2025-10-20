"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Coins, CreditCard, Sparkles, Zap, Crown } from "lucide-react"
import { useRouter } from "next/navigation"

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

export default function PricingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const router = useRouter()
  // const supabase = createClient()

  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  const handlePurchase = async (plan: PricingPlan) => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setProcessingPayment(plan.id)

    try {
      // Create payment record in database
      const { data: payment, error } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          amount: plan.price,
          points: plan.points,
          status: "pending",
          payment_method: "payhere",
        })
        .select()
        .single()

      if (error) throw error

      // Initialize PayHere payment
      const paymentData = {
        sandbox: true, // Set to false in production
        merchant_id: "1221149", // Replace with your PayHere merchant ID
        return_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/payment/cancel`,
        notify_url: `${window.location.origin}/api/payment/webhook`,
        order_id: payment.id,
        items: plan.name,
        amount: (plan.price / 100).toFixed(2), // Convert cents to LKR
        currency: "LKR",
        first_name: user.user_metadata?.full_name?.split(" ")[0] || "User",
        last_name: user.user_metadata?.full_name?.split(" ")[1] || "",
        email: user.email,
        phone: user.user_metadata?.phone || "",
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
          initiatePayment(paymentData)
        }
        document.head.appendChild(script)
      } else {
        initiatePayment(paymentData)
      }
    } catch (error) {
      console.error("Payment initiation error:", error)
      alert("Failed to initiate payment. Please try again.")
    } finally {
      setProcessingPayment(null)
    }
  }

  const initiatePayment = (paymentData: any) => {
    window.payhere.startPayment(paymentData)

    window.payhere.onCompleted = (orderId: string) => {
      console.log("Payment completed. OrderID:" + orderId)
      router.push("/payment/success?order_id=" + orderId)
    }

    window.payhere.onDismissed = () => {
      console.log("Payment dismissed")
      setProcessingPayment(null)
    }

    window.payhere.onError = (error: string) => {
      console.log("Error:" + error)
      alert("Payment failed: " + error)
      setProcessingPayment(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="relative">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-muted animate-pulse rounded" />
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
                    <div className="space-y-2">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="h-3 bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground mb-6">Get points to generate amazing house designs with AI</p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4" />
            <span>1 point = 1 AI design generation</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold">LKR {plan.price.toLocaleString()}</span>
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
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How do points work?</h3>
                <p className="text-muted-foreground">
                  Each AI design generation costs 1 point. Points never expire and can be used anytime.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit/debit cards, online banking, and mobile payments through PayHere.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I get a refund?</h3>
                <p className="text-muted-foreground">
                  Unused points can be refunded within 30 days of purchase. Contact support for assistance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
