"use client"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Coins, Download, Share2, Eye, Calendar, CreditCard, Sparkles } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user designs
  const { data: designs } = await supabase
    .from("designs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get recent points transactions
  const { data: transactions } = await supabase
    .from("points_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  const userInitials =
    profile?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    "U"

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-lg font-semibold">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {profile?.full_name || "User"}!</h1>
              <p className="text-muted-foreground">Manage your designs and account settings</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Available Points</p>
                  <p className="text-2xl font-bold">{profile?.points || 0}</p>
                </div>
              </div>
            </Card>
            <Button className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Buy Points
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Designs</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{designs?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Designs generated</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Used</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {transactions?.filter((t) => t.type === "spent").reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">Total points spent</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Designs</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{designs?.filter((d) => d.is_public).length || 0}</div>
              <p className="text-xs text-muted-foreground">Shared with community</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">Account created</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="designs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="designs">My Designs</TabsTrigger>
            <TabsTrigger value="points">Points History</TabsTrigger>
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="designs" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Generated Designs</h2>
              <Button onClick={() => (window.location.href = "/")}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate New Design
              </Button>
            </div>

            {designs && designs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {designs.map((design) => (
                  <Card key={design.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted">
                      {design.image_url ? (
                        <img
                          src={design.image_url || "/placeholder.svg"}
                          alt={design.title || "Generated design"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Sparkles className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold truncate">{design.title || "Untitled Design"}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{design.prompt}</p>
                        </div>
                        {design.is_public && (
                          <Badge variant="secondary" className="ml-2">
                            Public
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{design.style || "Custom"}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(design.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
                <p className="text-muted-foreground mb-4">Start creating amazing house designs with AI</p>
                <Button onClick={() => (window.location.href = "/")}>Generate Your First Design</Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="points" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Points History</h2>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">{profile?.points || 0} points</span>
              </div>
            </div>

            {transactions && transactions.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              transaction.type === "earned"
                                ? "bg-green-100 text-green-600"
                                : transaction.type === "spent"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <Coins className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {transaction.description ||
                                (transaction.type === "earned"
                                  ? "Points earned"
                                  : transaction.type === "spent"
                                    ? "Design generation"
                                    : "Points purchased")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`font-semibold ${
                            transaction.type === "earned"
                              ? "text-green-600"
                              : transaction.type === "spent"
                                ? "text-red-600"
                                : "text-blue-600"
                          }`}
                        >
                          {transaction.type === "spent" ? "-" : "+"}
                          {Math.abs(transaction.amount)} points
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                <p className="text-muted-foreground">Your points activity will appear here</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Manage your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <p className="text-sm text-muted-foreground mt-1">{profile?.full_name || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Account Type</label>
                    <p className="text-sm text-muted-foreground mt-1 capitalize">{profile?.role || "User"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Member Since</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="outline">Edit Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
