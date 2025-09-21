"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Wand2, Download, Share2, Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const architecturalStyles = [
  { id: "modern", name: "Modern", image: "/modern-house.png" },
  { id: "traditional", name: "Traditional Sri Lankan", image: "/traditional-sri-lankan-house.jpg" },
  { id: "contemporary", name: "Contemporary", image: "/contemporary-house.png" },
  { id: "minimalist", name: "Minimalist", image: "/minimalist-house.png" },
  { id: "tropical", name: "Tropical", image: "/tropical-house-design.jpg" },
  { id: "colonial", name: "Colonial", image: "/colonial-house-architecture.jpg" },
]

export function DesignGenerator() {
  const [prompt, setPrompt] = useState("")
  const [selectedStyle, setSelectedStyle] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string>("")
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

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

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    if (!user) {
      router.push("/auth/login")
      return
    }

    setIsGenerating(true)

    setTimeout(() => {
      setGeneratedImage("/ai-generated-house-design-concept.jpg")
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="space-y-8">
      {/* Style Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Choose Architectural Style</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {architecturalStyles.map((style) => (
            <Card
              key={style.id}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedStyle === style.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedStyle(style.id)}
            >
              <div className="p-3 space-y-2">
                <img
                  src={style.image || "/placeholder.svg"}
                  alt={style.name}
                  className="w-full h-20 object-cover rounded-md"
                />
                <p className="text-sm font-medium text-center">{style.name}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Describe Your Dream House</h3>
        <Textarea
          placeholder="Describe your ideal house... (e.g., 'A 3-bedroom house with large windows, garden view, modern kitchen, and swimming pool')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="cursor-pointer hover:bg-accent">
            3 bedrooms
          </Badge>
          <Badge variant="secondary" className="cursor-pointer hover:bg-accent">
            swimming pool
          </Badge>
          <Badge variant="secondary" className="cursor-pointer hover:bg-accent">
            garden view
          </Badge>
          <Badge variant="secondary" className="cursor-pointer hover:bg-accent">
            modern kitchen
          </Badge>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating || loading}
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

      {/* Generated Result */}
      {generatedImage && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Generated Design</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          <img
            src={generatedImage || "/placeholder.svg"}
            alt="Generated house design"
            className="w-full rounded-lg border"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Style: {architecturalStyles.find((s) => s.id === selectedStyle)?.name || "Custom"}</span>
            <span>Generated with AI</span>
          </div>
        </Card>
      )}
    </div>
  )
}
