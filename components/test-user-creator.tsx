"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function TestUserCreator() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const createTestUser = async () => {
    if (!email || !password || !fullName) {
      setError("Please fill in all fields")
      return
    }

    setIsCreating(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/create-test-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, fullName }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
        setEmail("")
        setPassword("")
        setFullName("")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create user")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Test User</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Email</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="test@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="test-password">Password</Label>
          <Input
            id="test-password"
            type="password"
            placeholder="password123"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="test-name">Full Name</Label>
          <Input
            id="test-name"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <Button 
          onClick={createTestUser} 
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? "Creating..." : "Create Test User"}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">
              User created successfully! You can now log in with these credentials.
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>This creates a user in both auth.users and profiles tables.</p>
          <p>Only works in development mode.</p>
        </div>
      </CardContent>
    </Card>
  )
}
