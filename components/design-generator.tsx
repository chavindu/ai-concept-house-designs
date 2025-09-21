"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Wand2, Download, Share2, Lock, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useDesign } from "@/lib/design-context"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const architecturalStyles = [
  {
    id: "minimalist-tropical",
    name: "Minimalist Tropical",
    image: "/modern-house.png",
    description: "Clean lines with tropical adaptation",
  },
  {
    id: "bawa-tropical",
    name: "Bawa-Style Tropical",
    image: "/traditional-sri-lankan-house.jpg",
    description: "Indoor-outdoor living with courtyards",
  },
  {
    id: "scandinavian",
    name: "Contemporary Scandinavian",
    image: "/contemporary-house.png",
    description: "Nordic minimalism with pitched roofs",
  },
  {
    id: "colonial-hybrid",
    name: "Sri Lankan Colonial",
    image: "/colonial-house-architecture.jpg",
    description: "Colonial influences with verandas",
  },
  {
    id: "industrial",
    name: "Industrial Style",
    image: "/minimalist-house.png",
    description: "Raw materials with exposed structure",
  },
  {
    id: "tropical-modern",
    name: "Tropical Modern",
    image: "/tropical-house-design.jpg",
    description: "Contemporary tropical living",
  },
]

const buildingTypes = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "hospitality", label: "Hospitality" },
]

const landSizeUnits = [
  { value: "sqft", label: "Square Feet" },
  { value: "acres", label: "Acres" },
  { value: "hectares", label: "Hectares" },
  { value: "perches", label: "Perches" },
]

const roofTypes = [
  { value: "concrete-slab", label: "Concrete Slab" },
  { value: "pitched-roof", label: "Pitched Roof" },
  { value: "hybrid", label: "Hybrid" },
]

const perspectives = [
  { value: "front", label: "Front View" },
  { value: "front-left", label: "Front-Left" },
  { value: "front-right", label: "Front-Right" },
]

interface FloorConfig {
  id: string
  name: string
  bedrooms: number
  bathrooms: number
  livingRooms: number
  kitchens: number
  diningRooms: number
  carParks: number
}

export function DesignGenerator() {
  // Form state
  const [buildingType, setBuildingType] = useState("residential")
  const [selectedStyle, setSelectedStyle] = useState("")
  const [styleIndex, setStyleIndex] = useState(0)
  const [landSize, setLandSize] = useState(10)
  const [landUnit, setLandUnit] = useState("perches")

  const [floors, setFloors] = useState<FloorConfig[]>([
    {
      id: "ground",
      name: "Ground Floor",
      bedrooms: 2,
      bathrooms: 2,
      livingRooms: 1,
      kitchens: 1,
      diningRooms: 1,
      carParks: 1,
    },
  ])

  const [hasPool, setHasPool] = useState(false)
  const [hasBalcony, setHasBalcony] = useState(true)
  const [hasTerrace, setHasTerrace] = useState(false)
  const [roofType, setRoofType] = useState("concrete-slab")
  const [perspective, setPerspective] = useState("front")

  // App state
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use shared design context
  const { isGenerating, setIsGenerating, setGeneratedDesign } = useDesign()

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleStyleNavigation = (direction: "prev" | "next") => {
    if (direction === "prev") {
      const newIndex = styleIndex > 0 ? styleIndex - 1 : architecturalStyles.length - 1
      setStyleIndex(newIndex)
      setSelectedStyle(architecturalStyles[newIndex].id)
    } else {
      const newIndex = styleIndex < architecturalStyles.length - 1 ? styleIndex + 1 : 0
      setStyleIndex(newIndex)
      setSelectedStyle(architecturalStyles[newIndex].id)
    }
  }

  const addFloor = () => {
    if (floors.length >= 5) return

    const floorNumber = floors.length + 1
    const floorName =
      floorNumber === 2 ? "1st Floor" : floorNumber === 3 ? "2nd Floor" : floorNumber === 4 ? "3rd Floor" : "4th Floor"

    const newFloor: FloorConfig = {
      id: `floor-${floorNumber}`,
      name: floorName,
      bedrooms: 2,
      bathrooms: 1,
      livingRooms: 1,
      kitchens: 0,
      diningRooms: 0,
      carParks: 0, // Only ground floor typically has car parks
    }

    setFloors([...floors, newFloor])
  }

  const removeFloor = (floorId: string) => {
    if (floors.length <= 1) return // Keep at least ground floor
    setFloors(floors.filter((floor) => floor.id !== floorId))
  }

  const updateFloor = (floorId: string, field: keyof Omit<FloorConfig, "id" | "name">, value: number) => {
    setFloors(floors.map((floor) => (floor.id === floorId ? { ...floor, [field]: value } : floor)))
  }

  const handleGenerate = async () => {
    if (!selectedStyle) return

    if (!user) {
      router.push("/auth/login")
      return
    }

    setIsGenerating(true)

    const formData = {
      buildingType,
      style: selectedStyle,
      landSize,
      landUnit,
      floors: floors,
      hasPool,
      hasBalcony,
      hasTerrace,
      roofType,
      perspective,
    }

    try {
      console.log("🚀 Starting design generation...")
      console.log("Form data:", formData)
      setError(null) // Clear any previous errors

      // Get the session token
      console.log("🔍 Checking session...")
      const { data: { session } } = await supabase.auth.getSession()
      console.log("✅ Session check completed")
      console.log("Session exists:", !!session)
      console.log("Access token exists:", !!session?.access_token)
      console.log("Access token preview:", session?.access_token ? `${session.access_token.substring(0, 20)}...` : "NO TOKEN")
      
      if (!session?.access_token) {
        console.log("❌ No session found, redirecting to login")
        router.push("/auth/login")
        return
      }

      console.log("📤 Sending request to API...")
      
      // Create an AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.log("⏰ Request timed out after 120 seconds")
      }, 120000) // 2 minutes timeout
      
      console.log("📤 Making API call to /api/generate-design")
      console.log("🔑 Using token:", session.access_token.substring(0, 20) + "...")
      console.log("📋 Sending form data:", formData)
      
      const response = await fetch("/api/generate-design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
        signal: controller.signal,
      })
      
      // Clear the timeout if request completes
      clearTimeout(timeoutId)

      console.log("📥 Response received:", response.status, response.statusText)

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Success response:", result)
        
        // Update shared design context
        setGeneratedDesign({
          imageUrl: result.imageUrl || "/ai-generated-house-design-concept.jpg",
          thumbnailUrl: result.thumbnailUrl || "/ai-generated-house-design-concept.jpg",
          descriptionEn: result.descriptionEn || "A beautiful architectural design generated with AI",
          descriptionSi: result.descriptionSi || "AI භාවිතයෙන් ජනනය කරන ලද අලංකාර ගෘහ නිර්මාණයක්",
          isWatermarked: result.isWatermarked || false,
          prompt: result.prompt || "Mock prompt",
          designId: result.designId,
          remainingPoints: result.remainingPoints || 0,
        })
        
        // Auto-scroll to the canvas area
        setTimeout(() => {
          const canvasElement = document.getElementById('design-canvas')
          if (canvasElement) {
            canvasElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            })
          }
        }, 100)
      } else {
        const errorData = await response.json()
        console.error("❌ Error response:", errorData)
        setError(errorData.error || "Generation failed. Please try again.")
        // Auto-scroll to error message
        setTimeout(() => {
          const errorElement = document.getElementById('error-display')
          if (errorElement) {
            errorElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            })
          }
        }, 100)
      }
    } catch (error) {
      console.error("❌ Generation failed:", error)
      console.error("Error details:", error)
      console.error("Error message:", error instanceof Error ? error.message : String(error))
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
      
      if (error instanceof Error && error.name === 'AbortError') {
        setError("Generation timed out after 2 minutes. Please try again.")
      } else {
        setError(`Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
      // Auto-scroll to error message
      setTimeout(() => {
        const errorElement = document.getElementById('error-display')
        if (errorElement) {
          errorElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
        }
      }, 100)
    } finally {
      console.log("🏁 Design generation process completed")
      setIsGenerating(false)
    }
  }

  const currentStyle = architecturalStyles[styleIndex]

  return (
    <div className="space-y-8">
      {/* Building Type Selection */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Building Type</Label>
        <Select value={buildingType} onValueChange={setBuildingType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {buildingTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Style Selection Carousel */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Architectural Style</Label>
        <div className="relative">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="icon" onClick={() => handleStyleNavigation("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex-1 mx-4 text-center">
                <img
                  src={currentStyle.image || "/placeholder.svg"}
                  alt={currentStyle.name}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <h3 className="text-lg font-semibold">{currentStyle.name}</h3>
                <p className="text-sm text-muted-foreground">{currentStyle.description}</p>
              </div>

              <Button variant="outline" size="icon" onClick={() => handleStyleNavigation("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex justify-center space-x-2">
              {architecturalStyles.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === styleIndex ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Land Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Land Size</Label>
          <Input
            type="number"
            value={landSize}
            onChange={(e) => setLandSize(Number(e.target.value))}
            min="1"
            max="100"
          />
        </div>
        <div className="space-y-2">
          <Label>Unit</Label>
          <Select value={landUnit} onValueChange={setLandUnit}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {landSizeUnits.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Floor Configuration</Label>
          <Button variant="outline" size="sm" onClick={addFloor} disabled={floors.length >= 5}>
            <Plus className="h-4 w-4 mr-2" />
            Add Floor
          </Button>
        </div>

        {floors.map((floor, index) => (
          <Card key={floor.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{floor.name}</h3>
              {floors.length > 1 && (
                <Button variant="outline" size="sm" onClick={() => removeFloor(floor.id)}>
                  <Minus className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label>Bedrooms: {floor.bedrooms}</Label>
                <Slider
                  value={[floor.bedrooms]}
                  onValueChange={(value) => updateFloor(floor.id, "bedrooms", value[0])}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label>Bathrooms: {floor.bathrooms}</Label>
                <Slider
                  value={[floor.bathrooms]}
                  onValueChange={(value) => updateFloor(floor.id, "bathrooms", value[0])}
                  min={0}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label>Living Rooms: {floor.livingRooms}</Label>
                <Slider
                  value={[floor.livingRooms]}
                  onValueChange={(value) => updateFloor(floor.id, "livingRooms", value[0])}
                  min={0}
                  max={3}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label>Kitchens: {floor.kitchens}</Label>
                <Slider
                  value={[floor.kitchens]}
                  onValueChange={(value) => updateFloor(floor.id, "kitchens", value[0])}
                  min={0}
                  max={2}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label>Dining Rooms: {floor.diningRooms}</Label>
                <Slider
                  value={[floor.diningRooms]}
                  onValueChange={(value) => updateFloor(floor.id, "diningRooms", value[0])}
                  min={0}
                  max={2}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Car parks only for ground floor */}
              {index === 0 && (
                <div className="space-y-3">
                  <Label>Car Parks: {floor.carParks}</Label>
                  <Slider
                    value={[floor.carParks]}
                    onValueChange={(value) => updateFloor(floor.id, "carParks", value[0])}
                    min={0}
                    max={3}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Optional Features */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Optional Features</Label>
        <div className="flex flex-wrap gap-3">
          <Badge
            variant={hasPool ? "default" : "secondary"}
            className="cursor-pointer px-4 py-2"
            onClick={() => setHasPool(!hasPool)}
          >
            Swimming Pool
          </Badge>
          <Badge
            variant={hasBalcony ? "default" : "secondary"}
            className="cursor-pointer px-4 py-2"
            onClick={() => setHasBalcony(!hasBalcony)}
          >
            Balcony
          </Badge>
          <Badge
            variant={hasTerrace ? "default" : "secondary"}
            className="cursor-pointer px-4 py-2"
            onClick={() => setHasTerrace(!hasTerrace)}
          >
            Terrace/Roof Garden
          </Badge>
        </div>
      </div>

      {/* Roof Type & Perspective */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Roof Type</Label>
          <Select value={roofType} onValueChange={setRoofType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roofTypes.map((roof) => (
                <SelectItem key={roof.value} value={roof.value}>
                  {roof.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Perspective</Label>
          <Select value={perspective} onValueChange={setPerspective}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {perspectives.map((view) => (
                <SelectItem key={view.value} value={view.value}>
                  {view.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerate}
          disabled={!selectedStyle || isGenerating || loading}
          size="lg"
          className="px-8 py-3 text-lg"
        >
          {isGenerating ? (
            <>
              <Wand2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : !user && !loading ? (
            <>
              <Lock className="mr-2 h-5 w-5" />
              Login to Generate
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Design
            </>
          )}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card id="error-display" className="p-4 border-destructive bg-destructive/10">
          <div className="flex items-center gap-2 text-destructive">
            <div className="w-2 h-2 bg-destructive rounded-full"></div>
            <p className="text-sm font-medium">{error}</p>
          </div>
        </Card>
      )}

      {/* Login Prompt for Non-Authenticated Users */}
      {!user && !loading && (
        <Card className="p-6 text-center space-y-4 bg-muted/50">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Login Required</h3>
            <p className="text-muted-foreground mb-4">
              Create an account or sign in to generate AI-powered house designs
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.push("/auth/login")}>Sign In</Button>
              <Button variant="outline" onClick={() => router.push("/auth/register")}>
                Create Account
              </Button>
            </div>
          </div>
        </Card>
      )}

    </div>
  )
}
