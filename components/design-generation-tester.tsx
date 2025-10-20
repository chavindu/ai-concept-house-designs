"use client"

import { useState } from "react"
// Removed Supabase import - using API routes instead
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDesign } from "@/lib/design-context"

export function DesignGenerationTester() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { setIsGenerating, setGeneratedDesign } = useDesign()

  const testGeneration = async () => {
    setIsGenerating(true)
    setResult(null)
    setError(null)
    
    try {
      console.log("🧪 Starting design generation test...")
      
      // Authentication will be handled by the API route
      console.log("🧪 Testing design generation...")

      const formData = {
        buildingType: "residential",
        style: "minimalist-tropical",
        landSize: 10,
        landUnit: "perches",
        floors: [{
          id: "ground",
          name: "Ground Floor",
          bedrooms: 2,
          bathrooms: 2,
          livingRooms: 1,
          kitchens: 1,
          diningRooms: 1,
          carParks: 1,
        }],
        hasPool: false,
        hasBalcony: true,
        hasTerrace: false,
        roofType: "concrete-slab",
        perspective: "front",
      }

      console.log("📤 Sending request to API...")
      
      const response = await fetch("/api/generate-design-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      })

      console.log("📥 Response received:", response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Success response:", data)
        setResult(data)
        
        // Also update the main canvas
        setGeneratedDesign({
          imageUrl: data.imageUrl || "/ai-generated-house-design-concept.jpg",
          thumbnailUrl: data.thumbnailUrl || "/ai-generated-house-design-concept.jpg",
          isWatermarked: data.isWatermarked || false,
          prompt: data.prompt || "Mock prompt",
          designId: data.designId,
          remainingPoints: data.remainingPoints || 0,
        })
      } else {
        const errorData = await response.json()
        console.log("❌ Error response:", errorData)
        setError(`API Error: ${errorData.error || "Unknown error"}`)
      }
    } catch (err) {
      console.error("❌ Test failed:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Design Generation Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testGeneration} 
          disabled={false}
          className="w-full"
        >
          Test Design Generation
        </Button>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Success:</h3>
            <pre className="text-xs overflow-auto text-green-700">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>Check the browser console (F12) for detailed logs.</p>
          <p>This will test the simplified API endpoint.</p>
        </div>
      </CardContent>
    </Card>
  )
}
