import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { claimDailyPoints } from "@/lib/points"

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 })
    }

    // Check authentication using the token from the header
    const token = authHeader.replace('Bearer ', '')
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Claim daily points
    const result = await claimDailyPoints(user.id)

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
