import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== DESIGN GENERATION API CALLED ===")
    
    const supabase = createClient()

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    console.log("Auth header exists:", !!authHeader)
    
    if (!authHeader) {
      console.log("❌ No authorization header")
      return NextResponse.json({ error: "No authorization header" }, { status: 401 })
    }

    // Check authentication using the token from the header
    const token = authHeader.replace('Bearer ', '')
    console.log("Token length:", token.length)
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.log("❌ Authentication failed:", authError)
      return NextResponse.json({ error: "Unauthorized", details: authError }, { status: 401 })
    }

    console.log("✅ User authenticated:", user.id, user.email)

    // Check user points
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", user.id)
      .single()

    console.log("Profile query result:", { profile, profileError })

    if (profileError) {
      console.log("❌ Profile error:", profileError)
      return NextResponse.json({ error: "Profile not found", details: profileError }, { status: 404 })
    }

    if (!profile || profile.points < 1) {
      console.log("❌ Insufficient points:", profile?.points)
      return NextResponse.json(
        { error: "Insufficient points. You need at least 1 point to generate a design." },
        { status: 400 }
      )
    }

    console.log("✅ User has sufficient points:", profile.points)

    // Get form data
    const formData = await request.json()
    console.log("Form data received:", formData)

    // Simulate processing
    console.log("🔄 Starting mock generation...")
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log("✅ Mock generation completed")

    // Deduct points
    const { error: pointsError } = await supabase
      .from("profiles")
      .update({ points: profile.points - 1 })
      .eq("id", user.id)

    if (pointsError) {
      console.log("❌ Error deducting points:", pointsError)
    } else {
      console.log("✅ Points deducted successfully")
    }

    // Return success response
    const response = {
      success: true,
      imageUrl: "/ai-generated-house-design-concept.jpg",
      thumbnailUrl: "/ai-generated-house-design-concept.jpg",
      isWatermarked: profile.points <= 10,
      prompt: "Mock prompt",
      designId: "mock-design-id",
      remainingPoints: profile.points - 1,
    }

    console.log("✅ Returning success response:", response)
    return NextResponse.json(response)

  } catch (error) {
    console.error("❌ API Error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
