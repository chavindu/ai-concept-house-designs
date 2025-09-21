"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AuthDebugger() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const testAuth = async () => {
    setLoading(true)
    try {
      // Get the session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setResult({ error: "No session found" })
        return
      }

      const response = await fetch("/api/test-auth", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Auth Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testAuth} disabled={loading}>
          {loading ? "Testing..." : "Test Authentication"}
        </Button>
        
        {result && (
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
