"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Coins, ArrowRight, Home } from "lucide-react"

export default function PaymentSuccessPage() {
  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("order_id")

  useEffect(() => {
    if (orderId) {
      fetchPaymentDetails()
    } else {
      setLoading(false)
    }
  }, [orderId])

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/payment?order_id=${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setPayment(data)
      } else {
        console.error("Failed to fetch payment details")
      }
    } catch (error) {
      console.error("Error fetching payment details:", error)
    } finally {
      setLoading(false)
    }
  }

  // Check if this is a design package (no points) or points package
  const isDesignPackage = payment && payment.points === 0 && payment.payment_method === "payhere"

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
              <CardDescription>
                {isDesignPackage 
                  ? "Thank you for purchasing the Basic Design Package. One of our team members will get in touch with you shortly."
                  : "Your points have been added to your account"
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {payment && (
                <div className="bg-muted/50 rounded-lg p-4">
                  {isDesignPackage ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-lg font-semibold">Basic Design Package</span>
                      </div>
                      <p className="text-sm text-muted-foreground">LKR {payment.amount.toLocaleString()}</p>
                      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                        <p>Order ID: {payment.id}</p>
                        <p>Payment ID: {payment.payment_id}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Coins className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">{payment.points} Points</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <Button className="w-full" onClick={() => router.push("/")}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {isDesignPackage ? "Back to Home" : "Start Generating Designs"}
                </Button>

                <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/dashboard")}>
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                {isDesignPackage ? (
                  <>
                    <p>Thank you for your purchase!</p>
                    <p>We'll contact you within 24 hours.</p>
                  </>
                ) : (
                  <>
                    <p>Thank you for your purchase!</p>
                    <p>Your points are ready to use immediately.</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
