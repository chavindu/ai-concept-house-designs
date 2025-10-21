import { redirect } from "next/navigation"
import { getAccessTokenFromServerCookies } from "@/lib/auth/session"
import { verifyAccessToken } from "@/lib/auth/jwt"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building, ImageIcon, CreditCard, TrendingUp, AlertTriangle } from "lucide-react"
import { AIServiceTester } from "@/components/ai-service-tester"

// Force dynamic rendering since this page uses cookies
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  // Check authentication using server cookies
  try {
    const accessToken = await getAccessTokenFromServerCookies()
    
    if (!accessToken) {
      redirect("/auth/login")
    }

    const payload = verifyAccessToken(accessToken)
    
    // Check if user is admin
    if (payload.role !== 'admin') {
      redirect("/dashboard")
    }
  } catch (error) {
    console.error('Error verifying auth from cookies:', error)
    redirect("/auth/login")
  }

  // For now, show a simplified admin dashboard
  // TODO: Implement database queries using the new system
  const totalUsers = 0
  const totalArchitects = 0
  const totalDesigns = 0
  const publicDesigns = 0
  const recentUsers: any[] = []
  const recentDesigns: any[] = []

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
              <p className="text-xs text-muted-foreground">Registered architects</p>
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
              <p className="text-xs text-muted-foreground">Community designs</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                AI Service Tester
              </CardTitle>
              <CardDescription>
                Test AI services and image generation functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIServiceTester />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>
                Monitor system health and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge variant="default">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Service</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage</span>
                  <Badge variant="default">Available</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest registered users</CardDescription>
            </CardHeader>
            <CardContent>
              {recentUsers.length > 0 ? (
                <div className="space-y-2">
                  {recentUsers.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent users</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Designs</CardTitle>
              <CardDescription>Latest generated designs</CardDescription>
            </CardHeader>
            <CardContent>
              {recentDesigns.length > 0 ? (
                <div className="space-y-2">
                  {recentDesigns.map((design: any) => (
                    <div key={design.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{design.title}</p>
                        <p className="text-xs text-muted-foreground">
                          by {design.profiles?.full_name || 'Unknown'}
                        </p>
                      </div>
                      <Badge variant={design.is_public ? "default" : "outline"}>
                        {design.is_public ? "Public" : "Private"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent designs</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}