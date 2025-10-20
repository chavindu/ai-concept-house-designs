import { type NextRequest, NextResponse } from "next/server"
import { claimDailyPoints } from "@/lib/points"

export async function POST(request: NextRequest) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Claim daily points
    const result = await claimDailyPoints(userId)

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
