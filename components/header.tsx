"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, LogIn, User, CreditCard, History, Settings, Calendar, ImageIcon, ChevronDown, Globe, Coins } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<"EN" | "SI">("EN")
  const [userPoints, setUserPoints] = useState<number>(0)
  const [canClaimDaily, setCanClaimDaily] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial user and points
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        await fetchUserPoints(user.id)
      }
      
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserPoints(session.user.id)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const fetchUserPoints = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("points, daily_points_claimed")
        .eq("id", userId)
        .single()

      if (profile) {
        setUserPoints(profile.points)
        
        // Check if user can claim daily points
        const today = new Date().toISOString().split('T')[0]
        setCanClaimDaily(profile.daily_points_claimed !== today)
      }
    } catch (error) {
      console.error("Error fetching user points:", error)
    }
  }

  const handleClaimDailyPoints = async () => {
    try {
      // Get the session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        alert("Please log in to claim daily points")
        return
      }

      const response = await fetch("/api/claim-daily-points", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setUserPoints(result.newBalance)
        setCanClaimDaily(false)
        // Show success message
        alert("Daily points claimed! You received 2 points.")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to claim daily points")
      }
    } catch (error) {
      console.error("Error claiming daily points:", error)
      alert("Failed to claim daily points")
    }
  }

  const handleLogin = () => {
    router.push("/auth/login")
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Architecture.lk</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {language}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setLanguage("EN")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("SI")}>සිංහල</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <Coins className="h-4 w-4 mr-2" />
                  Points: {userPoints}
                </DropdownMenuItem>
                {canClaimDaily && (
                  <DropdownMenuItem onClick={handleClaimDailyPoints}>
                    <Coins className="h-4 w-4 mr-2" />
                    Claim Daily Points (+2)
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/pricing")}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Buy Points
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  My Generations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  My Bookings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <History className="h-4 w-4 mr-2" />
                  Payment History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleLogin} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Log in
            </Button>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="/gallery" className="text-muted-foreground hover:text-foreground transition-colors">
            Gallery
          </a>
          <a href="/architects" className="text-muted-foreground hover:text-foreground transition-colors">
            Architects
          </a>
          <a href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
        </nav>
      </div>
    </header>
  )
}
