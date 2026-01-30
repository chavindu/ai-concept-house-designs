"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const { verifyEmail } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      handleVerification(tokenParam)
    }
  }, [searchParams])

  const handleVerification = async (verificationToken: string) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await verifyEmail(verificationToken)
      
      if (result.success) {
        setSuccess("Email verified successfully! Redirecting to dashboard...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError(result.error || "Email verification failed")
      }
    } catch (error: unknown) {
      console.error("Email verification failed:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualVerification = async () => {
    if (!token) {
      setError("No verification token available")
      return
    }
    await handleVerification(token)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
            <CardDescription>
              {token ? "Verifying your email address..." : "Please check your email for a verification link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Verifying...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center space-y-4">
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</div>
                {token && (
                  <Button onClick={handleManualVerification} disabled={isLoading}>
                    Try Again
                  </Button>
                )}
              </div>
            )}
            
            {success && (
              <div className="text-center">
                <div className="text-sm text-green-500 bg-green-50 p-3 rounded-md">{success}</div>
              </div>
            )}
            
            {!token && !error && !success && (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
                </p>
                <p className="text-sm text-muted-foreground">
                  If you don't see the email, check your spam folder.
                </p>
              </div>
            )}
            
            <div className="mt-6 text-center text-sm">
              <Link href="/" className="text-primary hover:underline">
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
