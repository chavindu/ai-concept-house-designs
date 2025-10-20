"use client"

import { useSession } from "next-auth/react"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function NextAuthTestComponent() {
  const { data: session, status } = useSession()
  const { user, signInWithGoogle, logout } = useAuth()

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>NextAuth.js Integration Test</CardTitle>
          <CardDescription>
            Test component to verify NextAuth.js integration with Google OAuth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">NextAuth Session Status:</h3>
            <p className="text-sm text-muted-foreground">
              Status: <span className="font-mono">{status}</span>
            </p>
            {session ? (
              <div className="mt-2 p-3 bg-green-50 rounded-md">
                <p className="text-sm">
                  ✅ NextAuth session active
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  User: {session.user?.email}
                </p>
              </div>
            ) : (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="text-sm">❌ No NextAuth session</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Auth Context Status:</h3>
            {user ? (
              <div className="mt-2 p-3 bg-green-50 rounded-md">
                <p className="text-sm">
                  ✅ User authenticated via Auth Context
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {user.id} | Email: {user.email} | Role: {user.role}
                </p>
              </div>
            ) : (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="text-sm">❌ No user in Auth Context</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={signInWithGoogle} variant="outline">
              Test Google Sign-In
            </Button>
            <Button onClick={logout} variant="destructive">
              Test Logout
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p><strong>Expected behavior:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Both NextAuth session and Auth Context should show the same user</li>
              <li>Google Sign-In should create/update user in database</li>
              <li>Logout should clear both sessions</li>
              <li>Session should persist across page refreshes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
