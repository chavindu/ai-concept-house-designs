"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Image as ImageIcon, Download, RefreshCw } from "lucide-react"

interface GenerationResult {
  success: boolean
  imageUrl?: string
  error?: string
  processingTime?: number
  prompt?: string
}

export default function TestImageGenerationPage() {
  const [apiKey, setApiKey] = useState("")
  const [prompt, setPrompt] = useState("A modern colonial hybrid house with tropical elements, featuring large windows, a sloping roof, and integrated carport. The design should blend traditional Sri Lankan architecture with contemporary materials. Front perspective, daytime lighting, lush landscaping.")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      alert("Please enter your Google AI API key")
      return
    }

    if (!prompt.trim()) {
      alert("Please enter a prompt")
      return
    }

    setIsGenerating(true)
    setResult(null)

    try {
      console.log("🧪 Testing direct image generation...")
      console.log("📝 Prompt:", prompt)
      console.log("🔑 API Key:", apiKey.substring(0, 10) + "...")

      const response = await fetch("/api/test-direct-image-gen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          prompt: prompt.trim(),
        }),
      })

      const data = await response.json()
      console.log("📥 Response:", data)

      if (response.ok) {
        setResult(data)
      } else {
        setResult({
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        })
      }
    } catch (error) {
      console.error("❌ Generation failed:", error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      })
    }

    setIsGenerating(false)
  }

  const handleDownload = () => {
    if (result?.imageUrl) {
      const link = document.createElement("a")
      link.href = result.imageUrl
      link.download = `generated-image-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleRefresh = () => {
    setResult(null)
    setPrompt("")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Image Generation Test</h1>
          <p className="text-muted-foreground">
            Test Google Gemini 2.5 Flash Image Preview model directly
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Generation Settings
              </CardTitle>
              <CardDescription>
                Configure your API key and prompt for image generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Key Input */}
              <div className="space-y-2">
                <Label htmlFor="apiKey">Google AI API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Google AI API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the image you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Be specific about architectural details, style, perspective, and lighting
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !apiKey.trim() || !prompt.trim()}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleRefresh}
                  disabled={isGenerating}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Prompts */}
              <div className="space-y-2">
                <Label>Quick Prompts</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Modern minimalist house with large glass windows, concrete and wood materials, front view",
                    "Traditional Sri Lankan colonial house with veranda, red tile roof, tropical garden",
                    "Contemporary tropical villa with infinity pool, open plan design, ocean view",
                    "Geoffrey Bawa style house with courtyards, natural materials, integrated landscape"
                  ].map((quickPrompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto p-2 text-xs"
                      onClick={() => setPrompt(quickPrompt)}
                      disabled={isGenerating}
                    >
                      {quickPrompt}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Image</CardTitle>
              <CardDescription>
                {result ? (
                  result.success ? (
                    "Image generated successfully"
                  ) : (
                    "Generation failed"
                  )
                ) : (
                  "No image generated yet"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Generating image...</p>
                  <p className="text-xs text-muted-foreground">
                    This may take 10-30 seconds
                  </p>
                </div>
              )}

              {result && result.success && result.imageUrl && (
                <div className="space-y-4">
                  {/* Generated Image */}
                  <div className="relative">
                    <img
                      src={result.imageUrl}
                      alt="Generated image"
                      className="w-full h-auto rounded-lg border shadow-sm"
                    />
                  </div>

                  {/* Image Actions */}
                  <div className="flex gap-2">
                    <Button onClick={handleDownload} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  {/* Generation Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processing Time:</span>
                      <span>{result.processingTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-green-600">Success</span>
                    </div>
                  </div>
                </div>
              )}

              {result && !result.success && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <h4 className="font-medium text-red-800 mb-2">Generation Failed</h4>
                  <p className="text-red-700 text-sm">{result.error}</p>
                </div>
              )}

              {!isGenerating && !result && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 text-muted-foreground">
                  <ImageIcon className="h-12 w-12" />
                  <p>Enter your API key and prompt to generate an image</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium mb-1">Getting Your API Key:</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></li>
                <li>Sign in with your Google account</li>
                <li>Click "Create API Key"</li>
                <li>Copy the generated API key</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-1">Writing Effective Prompts:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Be specific about architectural style (modern, traditional, colonial, etc.)</li>
                <li>Include perspective (front view, aerial, 3/4 view)</li>
                <li>Mention materials (concrete, wood, glass, brick)</li>
                <li>Specify lighting (daytime, sunset, interior lighting)</li>
                <li>Add landscape elements (garden, pool, trees)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
