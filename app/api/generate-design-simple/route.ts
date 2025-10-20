import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database/client"
import { verifyAuthFromCookies } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    console.log("=== DESIGN GENERATION API CALLED ===")
    
    // Get user ID from cookies or headers
    const auth = await verifyAuthFromCookies(request)
    const userIdFromHeader = request.headers.get('x-user-id')
    const userId = userIdFromHeader || auth?.user?.id || null
    
    if (!userId) {
      console.log("❌ No user ID in cookies/headers")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("✅ User authenticated:", userId)

    // Check user points
    const profileResult = await query(
      'SELECT points FROM profiles WHERE id = $1',
      [userId]
    )

    console.log("Profile query result:", profileResult.rows)

    if (profileResult.rows.length === 0) {
      console.log("❌ Profile not found")
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const profile = profileResult.rows[0]
    if (profile.points < 1) {
      console.log("❌ Insufficient points:", profile.points)
      return NextResponse.json(
        { error: "Insufficient points. You need at least 1 point to generate a design." },
        { status: 400 }
      )
    }

    console.log("✅ User has sufficient points:", profile.points)

    // Get form data
    const formData = await request.json()
    console.log("Form data received:", formData)

    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      message: "Design generation endpoint updated for Azure migration",
      userPoints: profile.points,
      formData: formData
    })

  } catch (error) {
    console.error("Design generation error:", error)
    return NextResponse.json({ error: "Failed to generate design" }, { status: 500 })
  }
}