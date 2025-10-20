"use client"

import { useState, useEffect } from "react"
// import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, Star, Calendar, Phone, Mail, Award, Building, Search, Filter, DollarSign } from "lucide-react"

interface Architect {
  id: string
  full_name: string
  email: string
  phone: string
  avatar_url: string
  bio: string
  specializations: string[]
  location: string
  experience_years: number
  rating: number
  hourly_rate: number
  calendly_url: string
  portfolio_images: string[]
  certifications: string[]
  languages: string[]
  created_at: string
}

const specializations = [
  "All Specializations",
  "Residential Design",
  "Commercial Architecture",
  "Interior Design",
  "Landscape Architecture",
  "Sustainable Design",
  "Traditional Sri Lankan",
  "Modern Architecture",
  "Renovation & Restoration",
]

const locations = [
  "All Locations",
  "Colombo",
  "Kandy",
  "Galle",
  "Negombo",
  "Jaffna",
  "Anuradhapura",
  "Batticaloa",
  "Kurunegala",
]

export default function ArchitectsPage() {
  const [architects, setArchitects] = useState<Architect[]>([])
  const [filteredArchitects, setFilteredArchitects] = useState<Architect[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [sortBy, setSortBy] = useState("rating")
  const [selectedArchitect, setSelectedArchitect] = useState<Architect | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchArchitects()
  }, [])

  useEffect(() => {
    filterAndSortArchitects()
  }, [architects, searchQuery, selectedSpecialization, selectedLocation, sortBy])

  const fetchArchitects = async () => {
    try {
      // For demo purposes, we'll create mock data since we don't have architect profiles in the database yet
      const mockArchitects: Architect[] = [
        {
          id: "1",
          full_name: "Arjuna Perera",
          email: "arjuna@example.com",
          phone: "+94 77 123 4567",
          avatar_url: "/architect-male.jpg",
          bio: "Award-winning architect specializing in sustainable tropical design with over 15 years of experience in residential and commercial projects across Sri Lanka.",
          specializations: ["Residential Design", "Sustainable Design", "Traditional Sri Lankan"],
          location: "Colombo",
          experience_years: 15,
          rating: 4.9,
          hourly_rate: 8500,
          calendly_url: "https://calendly.com/arjuna-perera",
          portfolio_images: ["/modern-house.png", "/traditional-house.jpg"],
          certifications: ["SLIA Chartered Architect", "Green Building Council"],
          languages: ["English", "Sinhala", "Tamil"],
          created_at: "2020-01-15T00:00:00Z",
        },
        {
          id: "2",
          full_name: "Samantha Fernando",
          email: "samantha@example.com",
          phone: "+94 71 987 6543",
          avatar_url: "/architect-female.jpg",
          bio: "Contemporary architect with expertise in luxury residential projects and interior design. Known for innovative use of space and natural lighting.",
          specializations: ["Residential Design", "Interior Design", "Modern Architecture"],
          location: "Kandy",
          experience_years: 12,
          rating: 4.8,
          hourly_rate: 7500,
          calendly_url: "https://calendly.com/samantha-fernando",
          portfolio_images: ["/luxury-interior.png", "/modern-villa.png"],
          certifications: ["SLIA Chartered Architect", "Interior Design Institute"],
          languages: ["English", "Sinhala"],
          created_at: "2019-03-20T00:00:00Z",
        },
        {
          id: "3",
          full_name: "Rohan Silva",
          email: "rohan@example.com",
          phone: "+94 76 555 1234",
          avatar_url: "/architect-male-2.jpg",
          bio: "Commercial architecture specialist with extensive experience in office buildings, hotels, and retail spaces. Expert in sustainable building practices.",
          specializations: ["Commercial Architecture", "Sustainable Design"],
          location: "Galle",
          experience_years: 18,
          rating: 4.7,
          hourly_rate: 9000,
          calendly_url: "https://calendly.com/rohan-silva",
          portfolio_images: ["/modern-glass-office.png", "/hotel-design.jpg"],
          certifications: ["SLIA Chartered Architect", "LEED AP", "Project Management Professional"],
          languages: ["English", "Sinhala"],
          created_at: "2018-07-10T00:00:00Z",
        },
      ]

      setArchitects(mockArchitects)
    } catch (error) {
      console.error("Error fetching architects:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortArchitects = () => {
    let filtered = [...architects]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (architect) =>
          architect.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          architect.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
          architect.specializations.some((spec) => spec.toLowerCase().includes(searchQuery.toLowerCase())) ||
          architect.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by specialization
    if (selectedSpecialization !== "All Specializations") {
      filtered = filtered.filter((architect) => architect.specializations.includes(selectedSpecialization))
    }

    // Filter by location
    if (selectedLocation !== "All Locations") {
      filtered = filtered.filter((architect) => architect.location === selectedLocation)
    }

    // Sort architects
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "experience":
        filtered.sort((a, b) => b.experience_years - a.experience_years)
        break
      case "price_low":
        filtered.sort((a, b) => a.hourly_rate - b.hourly_rate)
        break
      case "price_high":
        filtered.sort((a, b) => b.hourly_rate - a.hourly_rate)
        break
      case "name":
        filtered.sort((a, b) => a.full_name.localeCompare(b.full_name))
        break
    }

    setFilteredArchitects(filtered)
  }

  const handleBookConsultation = (architect: Architect) => {
    // Open Calendly in a new window/tab
    window.open(architect.calendly_url, "_blank", "width=800,height=600")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-muted animate-pulse rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted animate-pulse rounded" />
                    <div className="h-3 bg-muted animate-pulse rounded w-5/6" />
                  </div>
                </div>
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
          <h1 className="text-3xl font-bold mb-2">Find Your Perfect Architect</h1>
          <p className="text-muted-foreground">
            Connect with experienced architects in Sri Lanka for your dream project
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search architects, specializations, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-40">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredArchitects.length} of {architects.length} architects
          </p>
        </div>

        {/* Architects Grid */}
        {filteredArchitects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArchitects.map((architect) => (
              <Card key={architect.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Architect Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={architect.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-lg">
                        {architect.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{architect.full_name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{architect.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{architect.experience_years} years exp.</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {architect.location}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{architect.bio}</p>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {architect.specializations.slice(0, 3).map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {architect.specializations.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{architect.specializations.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Rate */}
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">LKR {architect.hourly_rate.toLocaleString()}/hour</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => setSelectedArchitect(architect)}
                        >
                          View Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={architect.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>
                                {architect.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h2 className="text-xl font-bold">{architect.full_name}</h2>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{architect.rating} rating</span>
                                <span>•</span>
                                <span>{architect.experience_years} years experience</span>
                              </div>
                            </div>
                          </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                          {/* Contact Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{architect.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{architect.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{architect.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">LKR {architect.hourly_rate.toLocaleString()}/hour</span>
                            </div>
                          </div>

                          {/* Bio */}
                          <div>
                            <h3 className="font-semibold mb-2">About</h3>
                            <p className="text-sm text-muted-foreground">{architect.bio}</p>
                          </div>

                          {/* Specializations */}
                          <div>
                            <h3 className="font-semibold mb-2">Specializations</h3>
                            <div className="flex flex-wrap gap-2">
                              {architect.specializations.map((spec) => (
                                <Badge key={spec} variant="secondary">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Certifications */}
                          <div>
                            <h3 className="font-semibold mb-2">Certifications</h3>
                            <div className="flex flex-wrap gap-2">
                              {architect.certifications.map((cert) => (
                                <Badge key={cert} variant="outline" className="flex items-center gap-1">
                                  <Award className="h-3 w-3" />
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Languages */}
                          <div>
                            <h3 className="font-semibold mb-2">Languages</h3>
                            <div className="flex gap-2">
                              {architect.languages.map((lang) => (
                                <Badge key={lang} variant="outline">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Portfolio Preview */}
                          <div>
                            <h3 className="font-semibold mb-2">Portfolio</h3>
                            <div className="grid grid-cols-2 gap-2">
                              {architect.portfolio_images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image || "/placeholder.svg"}
                                  alt={`Portfolio ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-md"
                                />
                              ))}
                            </div>
                          </div>

                          {/* Book Consultation Button */}
                          <Button onClick={() => handleBookConsultation(architect)} className="w-full" size="lg">
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Consultation
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button onClick={() => handleBookConsultation(architect)} className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No architects found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedSpecialization !== "All Specializations" || selectedLocation !== "All Locations"
                ? "Try adjusting your search or filters"
                : "No architects are currently available"}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
