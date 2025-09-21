import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 })
    }

    // Check authentication using the token from the header
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", details: authError }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("points, daily_points_claimed")
      .eq("id", user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "Profile not found", details: profileError }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      profile: {
        points: profile.points,
        daily_points_claimed: profile.daily_points_claimed,
      }
    })
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
