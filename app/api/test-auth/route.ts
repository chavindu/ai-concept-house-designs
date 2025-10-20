import { type NextRequest, NextResponse } from "next/server"
import { verifyAuthFromCookies } from "@/lib/auth/session"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check authentication using cookies
    const authResult = await verifyAuthFromCookies(request)
    if (!authResult) {
      return NextResponse.json({ error: "No valid authentication found" }, { status: 401 })
    }

    const { user } = authResult

    // Get user profile using API call
    const profileResponse = await fetch(`${request.nextUrl.origin}/api/user/profile`, {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    })

    if (!profileResponse.ok) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const profile = await profileResponse.json()

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
