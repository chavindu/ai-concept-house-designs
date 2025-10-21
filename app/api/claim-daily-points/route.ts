import { type NextRequest, NextResponse } from "next/server"
import { claimDailyPoints } from "@/lib/points"
import { verifyAuthFromCookies } from "@/lib/auth/session"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'

export async function POST(request: NextRequest) {
  try {
    console.log("API: Claim daily points request received")
    
    // Try NextAuth session first (preferred method)
    const session = await getServerSession(authOptions)
    console.log("API: NextAuth session:", session ? 'found' : 'not found')
    
    let userId = null
    let authMethod = 'none'
    
    if (session?.user?.id) {
      userId = session.user.id
      authMethod = 'nextauth'
      console.log("API: Using NextAuth session, user ID:", userId)
    } else {
      // Fallback: Try cookie-based auth
      const auth = await verifyAuthFromCookies(request)
      console.log("API: Auth from cookies:", auth ? 'success' : 'failed')
      if (auth?.user?.id) {
        userId = auth.user.id
        authMethod = 'cookies'
        console.log("API: Using cookie auth, user ID:", userId)
      }
    }

    // Check header fallback
    if (!userId) {
      userId = request.headers.get('x-user-id')
      if (userId) {
        authMethod = 'header'
        console.log("API: Using header auth, user ID:", userId)
      }
    }

    console.log("API: Final user ID:", userId, "Method:", authMethod)
    
    if (!userId) {
      console.log("API: No user ID found")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("API: Claiming daily points for user:", userId)
    // Claim daily points
    const result = await claimDailyPoints(userId)

    console.log("API: Daily points claimed successfully, new balance:", result.newBalance)
    return NextResponse.json({
      success: true,
      message: "Daily points claimed successfully",
      newBalance: result.newBalance,
      authMethod: authMethod,
    })
  } catch (error) {
    console.error("Daily points claim error:", error)
    
    if (error instanceof Error && error.message === "Daily points already claimed today") {
      return NextResponse.json(
        { error: "Daily points already claimed today" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to claim daily points" },
      { status: 500 }
    )
  }
}
