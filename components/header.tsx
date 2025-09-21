"use client"

import { Button } from "@/components/ui/button"
import { Home, LogIn, LogOut, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

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
        <div className="flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">Architecture.lk</span>
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

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <>
              <Button variant="ghost" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Dashboard
              </Button>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={handleLogin} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Log in
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
