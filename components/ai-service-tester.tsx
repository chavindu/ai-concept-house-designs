"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function AIServiceTester() {
  const [isTesting, setIsTesting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testAIService = async () => {
    setIsTesting(true)
    setError(null)
    setResult(null)

    try {
      console.log("🧪 Testing AI Service...")
      
      const response = await fetch("/api/generate-design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // You'll need to add a valid auth token here for testing
        },
        body: JSON.stringify({
          buildingType: "residential",
          style: "colonial-hybrid",
          landSize: 50,
          landUnit: "perches",
          floors: [
            {
              id: "ground",
              name: "Ground Floor",
              bedrooms: 2,
              bathrooms: 2,
              livingRooms: 1,
              kitchens: 1,
              diningRooms: 1,
              carParks: 1
            },
            {
              id: "floor-2",
              name: "1st Floor",
              bedrooms: 2,
              bathrooms: 1,
              livingRooms: 1,
              kitchens: 0,
              diningRooms: 0,
              carParks: 0
            }
          ],
          hasPool: true,
          hasBalcony: true,
          hasTerrace: true,
          roofType: "concrete-slab",
          perspective: "front"
        })
      })

      console.log("📥 Response status:", response.status)
      console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Success:", data)
        setResult(data)
      } else {
        const errorData = await response.json()
        console.error("❌ Error:", errorData)
        setError(`HTTP ${response.status}: ${errorData.error || "Unknown error"}`)
      }
    } catch (err) {
      console.error("❌ Test failed:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    }

    setIsTesting(false)
  }

  const testDirectAIService = async () => {
    setIsTesting(true)
    setError(null)
    setResult(null)

    try {
      console.log("🧪 Testing AI Service directly...")
      
      // Test the AI service directly without authentication
      const response = await fetch("/api/test-ai-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "Test prompt for colonial hybrid residential design"
        })
      })

      console.log("📥 Direct test response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Direct test success:", data)
        setResult(data)
      } else {
        const errorData = await response.json()
        console.error("❌ Direct test error:", errorData)
        setError(`HTTP ${response.status}: ${errorData.error || "Unknown error"}`)
      }
    } catch (err) {
      console.error("❌ Direct test failed:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    }

    setIsTesting(false)
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">AI Service Tester</h3>
      
      <div className="space-x-2">
        <Button 
          onClick={testAIService} 
          disabled={isTesting}
          variant="default"
        >
          {isTesting ? "Testing..." : "Test Full API"}
        </Button>
        
        <Button 
          onClick={testDirectAIService} 
          disabled={isTesting}
          variant="outline"
        >
          {isTesting ? "Testing..." : "Test AI Service Direct"}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h4 className="font-medium text-red-800">Error:</h4>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h4 className="font-medium text-green-800">Result:</h4>
          <pre className="text-sm text-green-700 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  )
}
