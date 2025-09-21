import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building, ImageIcon, CreditCard, TrendingUp, AlertTriangle } from "lucide-react"
import { AIServiceTester } from "@/components/ai-service-tester"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin")) {
    redirect("/dashboard")
  }

  // Get dashboard statistics
  const [
    { count: totalUsers },
    { count: totalArchitects },
    { count: totalDesigns },
    { count: publicDesigns },
    { data: recentUsers },
    { data: recentDesigns },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("architects").select("*", { count: "exact", head: true }),
    supabase.from("designs").select("*", { count: "exact", head: true }),
    supabase.from("designs").select("*", { count: "exact", head: true }).eq("is_public", true),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("designs").select("*, profiles(full_name)").order("created_at", { ascending: false }).limit(5),
  ])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, architects, designs, and system settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Architects</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalArchitects || 0}</div>
              <p className="text-xs text-muted-foreground">Verified architects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Designs</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDesigns || 0}</div>
              <p className="text-xs text-muted-foreground">Generated designs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Designs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publicDesigns || 0}</div>
              <p className="text-xs text-muted-foreground">Shared publicly</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Manage Users</h3>
              <p className="text-sm text-muted-foreground">View and manage user accounts</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Building className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Manage Architects</h3>
              <p className="text-sm text-muted-foreground">Verify and manage architects</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Manage Designs</h3>
              <p className="text-sm text-muted-foreground">Moderate design content</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Payment Settings</h3>
              <p className="text-sm text-muted-foreground">Configure payment options</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers && recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.full_name || "Anonymous"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role || "user"}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent users</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Designs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Designs</CardTitle>
              <CardDescription>Latest generated designs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDesigns && recentDesigns.length > 0 ? (
                  recentDesigns.map((design) => (
                    <div key={design.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium truncate">{design.title || "Untitled Design"}</p>
                        <p className="text-sm text-muted-foreground">by {design.profiles?.full_name || "Anonymous"}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={design.is_public ? "default" : "secondary"}>
                          {design.is_public ? "Public" : "Private"}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(design.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent designs</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Service Tester */}
        <div className="mt-6">
          <AIServiceTester />
        </div>

        {/* System Alerts */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              System Alerts
            </CardTitle>
            <CardDescription>Important notifications and system status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-md">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Payment System Integration Pending</p>
                  <p className="text-xs text-muted-foreground">
                    PayHere integration needs to be configured for point purchases
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-md">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">System Running Normally</p>
                  <p className="text-xs text-muted-foreground">All core features are operational</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
