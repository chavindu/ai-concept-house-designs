"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, MoreHorizontal, Eye, EyeOff, Trash2 } from "lucide-react"

interface Design {
  id: string
  title: string
  image_url: string
  thumbnail_url: string
  status: string
  is_public: boolean
  is_watermarked: boolean
  created_at: string
  user_id: string
  user_name: string
  user_email: string
  user_avatar: string
}

export default function AdminDesignsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [designs, setDesigns] = useState<Design[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login")
        return
      }

      if (user.role !== "admin") {
        router.push("/dashboard")
        return
      }

      fetchDesigns()
    }
  }, [user, loading, router])

  const fetchDesigns = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/designs', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setDesigns(data.designs || [])
      }
    } catch (error) {
      console.error('Error fetching designs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null // Will redirect
  }

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || design.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Design Management</h1>
            <p className="text-muted-foreground">Moderate and manage user-generated designs</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search designs, prompts, or users..." className="pl-10" />
            </div>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Designs</SelectItem>
                <SelectItem value="public">Public Only</SelectItem>
                <SelectItem value="private">Private Only</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="newest">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Designs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs && designs.length > 0 ? (
            designs.map((design) => (
              <Card key={design.id} className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
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
                  <div className="absolute top-2 right-2">
                    <Badge variant={design.is_public ? "default" : "secondary"}>
                      {design.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{design.title || "Untitled Design"}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{design.prompt}</p>
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
                    <Badge variant="outline" className="text-xs">
                      {design.style || "Custom"}
                    </Badge>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        title={design.is_public ? "Make Private" : "Make Public"}
                      >
                        {design.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        title="Delete Design"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="p-12 text-center">
                <Eye className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No designs found</h3>
                <p className="text-muted-foreground">No designs have been generated yet</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
