"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Share2, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface GalleryItem {
  id: string
  image_url: string
  thumbnail_url: string
  title: string
  style: string
  description_en: string
  description_si: string
  is_watermarked: boolean
  likes_count: number
  views_count: number
  user_liked: boolean
  created_at: string
}

export function CommunityGallery() {
  const router = useRouter()
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    try {
      console.log("🔄 Fetching gallery items...")
      
      const { data: designs, error } = await supabase
        .from("designs")
        .select(`
          id,
          image_url,
          thumbnail_url,
          title,
          style,
          description_en,
          description_si,
          is_watermarked,
          created_at
        `)
        .eq("is_public", true)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(8)

      console.log("Gallery query result:", { designs, error })

      if (error) {
        console.error("❌ Error fetching gallery:", error)
        console.log("Using sample data instead")
        setGalleryItems(getSampleData())
        return
      }

      if (!designs || designs.length === 0) {
        console.log("No designs found, using sample data")
        setGalleryItems(getSampleData())
        return
      }

      const processedItems = designs.map(design => ({
        id: design.id,
        image_url: design.image_url || "/placeholder.svg",
        thumbnail_url: design.thumbnail_url || design.image_url || "/placeholder.svg",
        title: design.title || "Untitled Design",
        style: design.style || "Custom",
        description_en: design.description_en || "A beautiful architectural design",
        description_si: design.description_si || "අලංකාර ගෘහ නිර්මාණයක්",
        is_watermarked: design.is_watermarked || false,
        likes_count: Math.floor(Math.random() * 50), // TODO: Get real likes count
        views_count: Math.floor(Math.random() * 200), // TODO: Get real views count
        user_liked: false, // TODO: Check if current user liked this
        created_at: design.created_at
      }))

      console.log("✅ Processed gallery items:", processedItems.length)
      setGalleryItems(processedItems)
    } catch (error) {
      console.error("❌ Error fetching gallery:", error)
      console.log("Using sample data as fallback")
      setGalleryItems(getSampleData())
    } finally {
      setLoading(false)
    }
  }

  const getSampleData = (): GalleryItem[] => [
    {
      id: "1",
      image_url: "/modern-house.png",
      thumbnail_url: "/modern-house.png",
      title: "Modern Villa",
      style: "Contemporary",
      description_en: "A stunning modern villa with clean lines and contemporary design",
      description_si: "නවීන විලාවක් සහිත අලංකාර නවීන විලාවක්",
      is_watermarked: false,
      likes_count: 24,
      views_count: 156,
      user_liked: false,
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      image_url: "/traditional-sri-lankan-house.jpg",
      thumbnail_url: "/traditional-sri-lankan-house.jpg",
      title: "Traditional House",
      style: "Sri Lankan",
      description_en: "Traditional Sri Lankan architecture with modern amenities",
      description_si: "නවීන සුවිශේෂීතා සහිත සම්ප්‍රදායික ශ්‍රී ලාංකික ගෘහ නිර්මාණය",
      is_watermarked: true,
      likes_count: 18,
      views_count: 89,
      user_liked: false,
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      image_url: "/contemporary-house.png",
      thumbnail_url: "/contemporary-house.png",
      title: "Contemporary Design",
      style: "Modern",
      description_en: "Contemporary house design with innovative features",
      description_si: "නවෝත්පාදනීය විශේෂතා සහිත නවීන ගෘහ නිර්මාණය",
      is_watermarked: false,
      likes_count: 32,
      views_count: 203,
      user_liked: false,
      created_at: new Date().toISOString()
    },
    {
      id: "4",
      image_url: "/minimalist-house.png",
      thumbnail_url: "/minimalist-house.png",
      title: "Minimalist Home",
      style: "Minimalist",
      description_en: "Clean minimalist design with focus on simplicity",
      description_si: "සරලත්වය කෙරෙහි අවධානය යොමු කරන අලංකාර අවමවාදී නිර්මාණය",
      is_watermarked: true,
      likes_count: 41,
      views_count: 278,
      user_liked: false,
      created_at: new Date().toISOString()
    },
  ]

  const handleLike = async (itemId: string) => {
    // TODO: Implement like functionality
    console.log("Like item:", itemId)
  }

  const handleShare = async (itemId: string) => {
    // TODO: Implement share functionality
    console.log("Share item:", itemId)
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Community Gallery</h2>
          <Button variant="outline" disabled>
            View More
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Community Gallery</h2>
        <Button variant="outline" onClick={() => router.push("/gallery")}>
          View More
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {galleryItems.map((item) => (
          <Card key={item.id} className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
            <div className="aspect-square relative overflow-hidden">
              <img
                src={item.image_url || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

              {/* Watermark overlay for free user designs */}
              {item.is_watermarked && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Architecture.lk
                </div>
              )}

              {/* Overlay actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLike(item.id)
                  }}
                >
                  <Heart className={`h-3 w-3 ${item.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShare(item.id)
                  }}
                >
                  <Share2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="p-3 space-y-1">
              <h3 className="font-medium text-sm truncate">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.style}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {item.likes_count}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {item.views_count}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}