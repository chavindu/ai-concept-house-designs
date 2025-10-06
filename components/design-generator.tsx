"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Wand2, Plus, Minus, Loader2, CheckCircle2, ShieldAlert } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useDesign } from "@/lib/design-context"
import { AuthModal } from "@/components/auth-modal"
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
  { value: "sqm", label: "Square Meters" },
  { value: "acres", label: "Acres" },
  { value: "hectares", label: "Hectares" },
  { value: "perches", label: "Perches" },
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
  const [hasBalcony, setHasBalcony] = useState(false)
  const [hasTerrace, setHasTerrace] = useState(false)
  const [perspective, setPerspective] = useState("front")

  // App state
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Use shared design context
  const { isGenerating, setIsGenerating, setGeneratedDesign } = useDesign()
  const [generationStartedAt, setGenerationStartedAt] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [currentStep, setCurrentStep] = useState<"validating" | "queued" | "generating" | "watermarking" | "saving" | "done">("validating")
  const controllerRef = useRef<AbortController | null>(null)
  const [profilePoints, setProfilePoints] = useState<number | null>(null)
  const isFreeUser = (profilePoints ?? 0) <= 10
  const tips = [
    { en: "Use larger windows for better natural light.", si: "හොඳ ස්වභාවික ආලෝකයට විශාල කවුළු භාවිතා කරන්න." },
    { en: "Orient living spaces to catch prevailing breezes.", si: "වසන්ත සුළඟට මුහුණලා ජීවන අවකාශ සකසන්න." },
    { en: "Blend local materials with modern forms.", si: "දේශීය ද්‍රව්‍ය නූතන හැඩතල සමඟ මිශ්‍ර කරන්න." },
    { en: "Add courtyards for tropical ventilation.", si: "උෂ්ණ වාතායනය සඳහා ඇඟෙවල් එක් කරන්න." },
  ]
  const [tipIndex, setTipIndex] = useState(0)
  const galleryImages = [
    "/modern-house.png",
    "/contemporary-house.png",
    "/modern-villa.png",
    "/traditional-house.jpg",
    "/tropical-house-design.jpg",
    "/modern-glass-office.png",
  ]

  const router = useRouter()
  const supabase = createClient()

  // Save form state to localStorage whenever it changes
  const saveFormState = () => {
    const formState = {
      buildingType,
      selectedStyle,
      styleIndex,
      landSize,
      landUnit,
      floors,
      hasPool,
      hasBalcony,
      hasTerrace,
      perspective,
    }
    localStorage.setItem('designGeneratorForm', JSON.stringify(formState))
  }

  // Load form state from localStorage
  const loadFormState = () => {
    try {
      const saved = localStorage.getItem('designGeneratorForm')
      if (saved) {
        const formState = JSON.parse(saved)
        setBuildingType(formState.buildingType || "residential")
        setSelectedStyle(formState.selectedStyle || "")
        setStyleIndex(formState.styleIndex || 0)
        setLandSize(formState.landSize || 10)
        setLandUnit(formState.landUnit || "perches")
        setFloors(formState.floors || [{
          id: "ground",
          name: "Ground Floor",
          bedrooms: 2,
          bathrooms: 2,
          livingRooms: 1,
          kitchens: 1,
          diningRooms: 1,
          carParks: 1,
        }])
        setHasPool(!!formState.hasPool)
        setHasBalcony(!!formState.hasBalcony)
        setHasTerrace(!!formState.hasTerrace)
        setPerspective(formState.perspective || "front")
      }
    } catch (error) {
      console.error('Error loading form state:', error)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      try {
        if (user?.id) {
          const { data } = await supabase.from("profiles").select("points").eq("id", user.id).single()
          if (data?.points !== undefined) setProfilePoints(data.points)
        } else {
          setProfilePoints(null)
        }
      } catch {}
    }

    getUser()
    loadFormState()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user?.id) {
        supabase
          .from("profiles")
          .select("points")
          .eq("id", session.user.id)
          .single()
          .then((res: { data: { points?: number } | null } | null | undefined) => {
            const data = res?.data as { points?: number } | null
            if (data?.points !== undefined) setProfilePoints(data.points)
          })
      } else {
        setProfilePoints(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Save form state whenever any form field changes
  useEffect(() => {
    saveFormState()
  }, [buildingType, selectedStyle, styleIndex, landSize, landUnit, floors, hasPool, hasBalcony, hasTerrace, perspective])


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
      setShowAuthModal(true)
      return
    }

    setIsGenerating(true)
    setGenerationStartedAt(Date.now())
    setElapsedSeconds(0)
    setCurrentStep("validating")

    const formData = {
      buildingType,
      style: selectedStyle,
      landSize,
      landUnit,
      floors: floors,
      hasPool,
      hasBalcony,
      hasTerrace,
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
        console.log("❌ No session found, showing auth modal")
        setShowAuthModal(true)
        return
      }

      console.log("📤 Sending request to API...")
      
      // Create an AbortController for timeout/cancel
      const controller = new AbortController()
      controllerRef.current = controller
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.log("⏰ Request timed out after 120 seconds")
      }, 120000) // 2 minutes timeout
      
      console.log("📤 Making API call to /api/generate-design")
      console.log("🔑 Using token:", session.access_token.substring(0, 20) + "...")
      console.log("📋 Sending form data:", formData)
      
      setCurrentStep("queued")
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

      setCurrentStep("generating")
      if (response.ok) {
        const result = await response.json()
        console.log("✅ Success response:", result)
        
        // Update shared design context
        setCurrentStep(result?.isWatermarked ? "watermarking" : "saving")
        setGeneratedDesign({
          imageUrl: result.imageUrl || "/ai-generated-house-design-concept.jpg",
          thumbnailUrl: result.thumbnailUrl || "/ai-generated-house-design-concept.jpg",
          isWatermarked: result.isWatermarked || false,
          prompt: result.prompt || "Mock prompt",
          designId: result.designId,
          remainingPoints: result.remainingPoints || 0,
        })
        setCurrentStep("done")
        
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
      controllerRef.current = null
    }
  }

  // Timer effect during generation
  useEffect(() => {
    if (!isGenerating || !generationStartedAt) return
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - generationStartedAt) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [isGenerating, generationStartedAt])

  const steps: { key: typeof currentStep; label: string }[] = [
    { key: "validating", label: "Validating" },
    { key: "queued", label: "Queued" },
    { key: "generating", label: "Generating" },
    { key: "watermarking", label: "Watermarking" },
    { key: "saving", label: "Saving" },
    { key: "done", label: "Completed" },
  ] as any

  const renderLoadingUI = () => {
    if (!isGenerating) return null
    return (
      <Card className="p-4" role="status" aria-live="polite">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="font-medium">Generating design</span>
          </div>
          <span className="text-xs text-muted-foreground">{elapsedSeconds}s</span>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const activeIndex = steps.findIndex(s => s.key === currentStep)
            const isActive = activeIndex >= index
            return (
              <div key={step.key} className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${isActive ? "bg-primary/10 border-primary text-primary" : "text-muted-foreground"}`}>
                  {isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="w-3.5 h-3.5 rounded-full bg-muted inline-block" />}
                  <span>{step.label}</span>
                </div>
                {index < steps.length - 1 && <div className="w-6 h-px bg-muted" />}
              </div>
            )
          })}
        </div>

        {/* Progress bar (indeterminate) */}
        <div className="h-2 w-full bg-muted rounded overflow-hidden my-3" aria-hidden>
          <div className="h-full w-2/3 bg-primary animate-pulse" />
        </div>

        {/* Prompt preview (EN | SI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <Card className="p-3">
            <div className="text-xs font-semibold mb-1">Prompt (EN)</div>
            <p className="text-xs text-muted-foreground">
              {`${buildingType} • ${selectedStyle || "style"} • ${landSize} ${landUnit} • ${floors.length} floor(s) • features: ${[hasPool && "pool", hasBalcony && "balcony", hasTerrace && "terrace"].filter(Boolean).join(", ") || "none"} • perspective: ${perspective}`}
            </p>
          </Card>
          <Card className="p-3">
            <div className="text-xs font-semibold mb-1">විස්තරය (SI)</div>
            <p className="text-xs text-muted-foreground">
              {`${buildingType} ගොඩනැගිල්ල • ශෛලිය: ${selectedStyle || "-"} • ඉඩම් විශාලත්වය: ${landSize} ${landUnit} • මහල: ${floors.length} • විශේෂාංග: ${[hasPool && "පූල් එක", hasBalcony && "බල්කනි", hasTerrace && "තරාසය"].filter(Boolean).join(", ") || "නැත"} • දර්ශනය: ${perspective}`}
            </p>
          </Card>
        </div>

        {/* Tips + Mini Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <Card className="p-3">
            <div className="text-xs font-semibold mb-1">Design Tip</div>
            <p className="text-xs"><span className="font-medium">EN:</span> {tips[tipIndex].en}</p>
            <p className="text-xs text-muted-foreground"><span className="font-medium">SI:</span> {tips[tipIndex].si}</p>
          </Card>
          <Card className="p-3 md:col-span-2">
            <div className="text-xs font-semibold mb-2">From the community</div>
            <div className="grid grid-cols-3 gap-2">
              {galleryImages.map((src, i) => (
                <div key={i} className="aspect-square rounded overflow-hidden bg-muted">
                  <img src={src} alt="gallery" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="mt-2 text-right">
              <button className="text-xs text-primary hover:underline" onClick={() => router.push("/gallery")}>View gallery</button>
            </div>
          </Card>
        </div>

        {/* Points & Upsell */}
        <div className="mt-3 p-3 border rounded">
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <div className="font-medium">Points balance: {profilePoints ?? "—"}</div>
              {isFreeUser && (
                <div className="text-muted-foreground">Free users may see a small watermark.</div>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={() => router.push("/pricing")}>Get more points</Button>
          </div>
        </div>

        {/* Timeout fallback and controls */}
        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Typically completes in 20–60s. If it takes too long, you can retry.</span>
        </div>
        {elapsedSeconds >= 60 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
            <div className="flex items-center gap-2 text-amber-800 mb-2 text-sm">
              <ShieldAlert className="h-4 w-4" />
              <span>This is taking longer than usual. You can retry or wait a bit more.</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleGenerate()}>Retry</Button>
              <Button size="sm" variant="outline" onClick={() => setIsGenerating(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Card>
    )
  }

  // Listen for perspective regeneration requests
  useEffect(() => {
    const handler = (e: any) => {
      const newPerspective = e.detail?.perspective
      if (!newPerspective) return
      setPerspective(newPerspective)
      // Trigger immediate regeneration with updated perspective
      handleGenerate()
    }
    document.addEventListener('regenerate-with-perspective', handler as EventListener)
    return () => document.removeEventListener('regenerate-with-perspective', handler as EventListener)
  }, [selectedStyle, landSize, landUnit, floors, hasPool, hasBalcony, hasTerrace, buildingType])


  return (
    <div className="space-y-6">
      {/* Building Type Selection */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Building Type</Label>
        <Select value={buildingType} onValueChange={setBuildingType} disabled>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="residential">Residential</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Style Selection Grid */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Architectural Style</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {architecturalStyles.map((style, index) => (
            <Card 
              key={style.id}
              className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                selectedStyle === style.id ? "ring-2 ring-primary bg-primary/5" : ""
              }`}
              onClick={() => {
                setSelectedStyle(style.id)
                setStyleIndex(index)
              }}
            >
              <div className="w-full aspect-square rounded mb-2 overflow-hidden">
                <img
                  src={style.image || "/placeholder.svg"}
                  alt={style.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-sm font-medium">{style.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">{style.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Land Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Floor Configuration</Label>
          <Button variant="default" size="sm" onClick={addFloor} disabled={floors.length >= 5}>
            <Plus className="h-4 w-4 mr-2" />
            Add Floor
          </Button>
        </div>

        {floors.map((floor, index) => (
          <Card key={floor.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">{floor.name}</h3>
              {floors.length > 1 && (
                <Button variant="default" size="sm" onClick={() => removeFloor(floor.id)}>
                  <Minus className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Bedrooms</Label>
                <div className="flex items-center justify-between bg-muted rounded-lg p-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateFloor(floor.id, "bedrooms", Math.max(0, floor.bedrooms - 1))}
                    disabled={floor.bedrooms <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium px-2">{floor.bedrooms}</span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateFloor(floor.id, "bedrooms", Math.min(10, floor.bedrooms + 1))}
                    disabled={floor.bedrooms >= 10}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Bathrooms</Label>
                <div className="flex items-center justify-between bg-muted rounded-lg p-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateFloor(floor.id, "bathrooms", Math.max(0, floor.bathrooms - 1))}
                    disabled={floor.bathrooms <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium px-2">{floor.bathrooms}</span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateFloor(floor.id, "bathrooms", Math.min(5, floor.bathrooms + 1))}
                    disabled={floor.bathrooms >= 5}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Living Rooms</Label>
                <div className="flex items-center justify-between bg-muted rounded-lg p-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateFloor(floor.id, "livingRooms", Math.max(0, floor.livingRooms - 1))}
                    disabled={floor.livingRooms <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium px-2">{floor.livingRooms}</span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateFloor(floor.id, "livingRooms", Math.min(3, floor.livingRooms + 1))}
                    disabled={floor.livingRooms >= 3}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Kitchens</Label>
                <div className="flex items-center justify-between bg-muted rounded-lg p-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateFloor(floor.id, "kitchens", Math.max(0, floor.kitchens - 1))}
                    disabled={floor.kitchens <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium px-2">{floor.kitchens}</span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateFloor(floor.id, "kitchens", Math.min(2, floor.kitchens + 1))}
                    disabled={floor.kitchens >= 2}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Dining Rooms</Label>
                <div className="flex items-center justify-between bg-muted rounded-lg p-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateFloor(floor.id, "diningRooms", Math.max(0, floor.diningRooms - 1))}
                    disabled={floor.diningRooms <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium px-2">{floor.diningRooms}</span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateFloor(floor.id, "diningRooms", Math.min(2, floor.diningRooms + 1))}
                    disabled={floor.diningRooms >= 2}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Car parks only for ground floor */}
              {index === 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Car Parks</Label>
                  <div className="flex items-center justify-between bg-muted rounded-lg p-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => updateFloor(floor.id, "carParks", Math.max(0, floor.carParks - 1))}
                      disabled={floor.carParks <= 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium px-2">{floor.carParks}</span>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => updateFloor(floor.id, "carParks", Math.min(3, floor.carParks + 1))}
                      disabled={floor.carParks >= 3}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Optional Features */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Optional Features</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={hasPool} onChange={() => setHasPool(!hasPool)} className="h-4 w-4" />
            <span>Swimming Pool</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={hasBalcony} onChange={() => setHasBalcony(!hasBalcony)} className="h-4 w-4" />
            <span>Balcony</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={hasTerrace} onChange={() => setHasTerrace(!hasTerrace)} className="h-4 w-4" />
            <span>Terrace/Roof Garden</span>
          </label>
        </div>
      </div>

      {/* Perspective moved to canvas controls */}

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
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Design (1 Point)
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false)
          // Trigger generation after successful login
          handleGenerate()
        }}
      />

    </div>
  )
}
