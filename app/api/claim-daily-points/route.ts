import { type NextRequest, NextResponse } from "next/server"
import { claimDailyPoints } from "@/lib/points"
import { verifyAuthFromCookies } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    console.log("API: Claim daily points request received")
    
    // Try cookie-based auth first
    const auth = await verifyAuthFromCookies(request)
    console.log("API: Auth from cookies:", auth ? 'success' : 'failed')

    let userId = request.headers.get('x-user-id')
    if (!userId && auth?.user?.id) {
      userId = auth.user.id
    }

    console.log("API: User ID:", userId)
    
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
