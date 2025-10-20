"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Download, Share2, Search, Filter, Grid3X3, List, Eye } from "lucide-react"

interface Design {
  id: string
  title: string
  prompt: string
  style: string
  image_url: string
  created_at: string
  user_id: string
  profiles: {
    full_name: string
    avatar_url: string
  }
}

const architecturalStyles = [
  "All Styles",
  "Modern",
  "Traditional Sri Lankan",
  "Contemporary",
  "Minimalist",
  "Tropical",
  "Colonial",
]

export default function GalleryPage() {
  const [designs, setDesigns] = useState<Design[]>([])
  const [filteredDesigns, setFilteredDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("All Styles")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchDesigns()
    getCurrentUser()
  }, [])

  useEffect(() => {
    filterAndSortDesigns()
  }, [designs, searchQuery, selectedStyle, sortBy])

  const getCurrentUser = async () => {
    try {
      // Check if user is authenticated via API
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error getting current user:", error)
      setUser(null)
    }
  }

  const fetchDesigns = async () => {
    try {
      // Fetch public designs from your API
      const response = await fetch('/api/gallery/designs')
      if (response.ok) {
        const data = await response.json()
        setDesigns(data.designs || [])
      } else {
        console.error("Failed to fetch designs")
        setDesigns([])
      }
    } catch (error) {
      console.error("Error fetching designs:", error)
      setDesigns([])
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortDesigns = () => {
    let filtered = [...designs]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (design) =>
          design.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          design.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          design.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by style
    if (selectedStyle !== "All Styles") {
      filtered = filtered.filter((design) => design.style === selectedStyle.toLowerCase())
    }

    // Sort designs
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case "title":
        filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""))
        break
    }

    setFilteredDesigns(filtered)
  }

  const handleLike = async (designId: string) => {
    if (!user) {
      // Redirect to login or show login modal
      return
    }
    // TODO: Implement like functionality
    console.log("Like design:", designId)
  }

  const handleDownload = (design: Design) => {
    // TODO: Implement download functionality
    console.log("Download design:", design.id)
  }

  const handleShare = (design: Design) => {
    if (navigator.share) {
      navigator.share({
        title: design.title || "Amazing House Design",
        text: design.prompt,
        url: window.location.href + "/" + design.id,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href + "/" + design.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Gallery</h1>
          <p className="text-muted-foreground">Discover amazing house designs created by our community</p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search designs, prompts, or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {architecturalStyles.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredDesigns.length} of {designs.length} designs
          </p>
        </div>

        {/* Designs Grid/List */}
        {filteredDesigns.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
            {filteredDesigns.map((design) => (
              <Card
                key={design.id}
                className={`overflow-hidden hover:shadow-lg transition-shadow ${viewMode === "list" ? "flex" : ""}`}
              >
                <div className={`${viewMode === "list" ? "w-64 flex-shrink-0" : "aspect-video"} bg-muted`}>
                  {design.thumbnail_url || design.image_url ? (
                    <img
                      src={design.thumbnail_url || design.image_url || "/placeholder.svg"}
                      alt={design.title || "Generated design"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Eye className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{design.title || "Untitled Design"}</h3>
                      <p
                        className={`text-sm text-muted-foreground ${
                          viewMode === "list" ? "line-clamp-2" : "line-clamp-3"
                        }`}
                      >
                        {design.prompt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={design.profiles?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {design.profiles?.full_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{design.profiles?.full_name || "Anonymous"}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(design.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {design.style || "Custom"}
                      </Badge>
                    </div>

                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleLike(design.id)} className="h-8 w-8 p-0">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDownload(design)} className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleShare(design)} className="h-8 w-8 p-0">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Eye className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No designs found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedStyle !== "All Styles"
                ? "Try adjusting your search or filters"
                : "Be the first to share a design with the community!"}
            </p>
            {!searchQuery && selectedStyle === "All Styles" && (
              <Button onClick={() => (window.location.href = "/")}>Create Your First Design</Button>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
