"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, LogIn, User, CreditCard, History, Settings, Calendar, ImageIcon, ChevronDown, Globe, Coins } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { AuthModal } from "@/components/auth-modal"
import { usePricingModal } from "@/lib/pricing-modal-context"

export function Header() {
  const { user, loading, logout } = useAuth()
  const { openModal: openPricingModal } = usePricingModal()
  const [language, setLanguage] = useState<"EN" | "SI">("EN")
  const [userPoints, setUserPoints] = useState<number>(0)
  const [canClaimDaily, setCanClaimDaily] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchUserPoints()
    }
  }, [user])

  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Header: Fetched user profile data:', data)
        setUserPoints(data.points || 0)
        
        // Check if user can claim daily points
        const today = new Date().toISOString().split('T')[0]
        const lastClaimed = data.daily_points_claimed ? new Date(data.daily_points_claimed).toISOString().split('T')[0] : null
        setCanClaimDaily(lastClaimed !== today)
      } else {
        console.error('Header: Failed to fetch user profile:', response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching user points:", error)
    }
  }

  const handleClaimDailyPoints = async () => {
    try {
      const response = await fetch("/api/claim-daily-points", {
        method: "POST",
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        setUserPoints(result.newBalance)
        setCanClaimDaily(false)
        toast({
          title: "Daily Points Claimed!",
          description: "You received 2 points. New balance: " + result.newBalance,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Failed to Claim Points",
          description: error.error || "Failed to claim daily points",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error claiming daily points:", error)
      toast({
        title: "Error",
        description: "Failed to claim daily points. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLogin = () => {
    setIsAuthModalOpen(true)
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Language Switch */}
        <div className="flex items-center">
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

        {/* Center: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">Architecture.lk</span>
        </Link>

        {/* Right: Profile/Login with Points */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <div className="flex items-center gap-3">
              {/* Points Balance */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Coins className="h-4 w-4" />
                <span>{userPoints} points</span>
              </div>
              
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} alt={user.full_name || 'Profile'} />
                      <AvatarFallback>
                        {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{user.full_name || 'Profile'}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {canClaimDaily && (
                    <DropdownMenuItem onClick={handleClaimDailyPoints}>
                      <Coins className="h-4 w-4 mr-2" />
                      Claim Daily Points (+2)
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={openPricingModal}>
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
            </div>
          ) : (
            <Button onClick={handleLogin} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Log in
            </Button>
          )}
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false)
          // Refresh user points after successful login/register
          if (user) {
            fetchUserPoints()
          }
        }}
      />
      
    </header>
  )
}