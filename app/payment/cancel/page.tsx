"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, CreditCard } from "lucide-react"

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-red-600">Payment Cancelled</CardTitle>
              <CardDescription>Your payment was cancelled and no charges were made</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-sm text-muted-foreground">
                <p>Don't worry, you can try again anytime.</p>
                <p>No money has been deducted from your account.</p>
              </div>

              <div className="space-y-3">
                <Button className="w-full" onClick={() => router.push("/pricing")}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Try Again
                </Button>

                <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
