"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Share2, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

export function CommunityGallery() {
  const router = useRouter()

  // Sample gallery data
  const galleryItems = [
    {
      id: 1,
      image: "/modern-house.png",
      title: "Modern Villa",
      style: "Contemporary",
      likes: 24,
      views: 156,
    },
    {
      id: 2,
      image: "/traditional-sri-lankan-house.jpg",
      title: "Traditional House",
      style: "Sri Lankan",
      likes: 18,
      views: 89,
    },
    {
      id: 3,
      image: "/contemporary-house.png",
      title: "Contemporary Design",
      style: "Modern",
      likes: 32,
      views: 203,
    },
    {
      id: 4,
      image: "/minimalist-house.png",
      title: "Minimalist Home",
      style: "Minimalist",
      likes: 41,
      views: 278,
    },
    {
      id: 5,
      image: "/tropical-house-design.jpg",
      title: "Tropical Villa",
      style: "Tropical",
      likes: 27,
      views: 134,
    },
    {
      id: 6,
      image: "/colonial-house-architecture.jpg",
      title: "Colonial Style",
      style: "Colonial",
      likes: 15,
      views: 92,
    },
    {
      id: 7,
      image: "/modern-house.png",
      title: "Luxury Villa",
      style: "Luxury",
      likes: 38,
      views: 245,
    },
    {
      id: 8,
      image: "/contemporary-house.png",
      title: "Urban House",
      style: "Urban",
      likes: 22,
      views: 167,
    },
  ]

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
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

              {/* Overlay actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                  <Heart className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
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
                  {item.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {item.views}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
