import { NextRequest, NextResponse } from "next/server"
import { editArchitecturalDesignPerspective } from "@/lib/ai-service"
import { generatePrompt } from "@/lib/prompt-generator"
import { query } from "@/lib/database/client"
import { deductPoints } from "@/lib/points"
import { verifyAuthFromCookies } from "@/lib/auth/session"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'

export async function POST(request: NextRequest) {
  console.log("=".repeat(80))
  console.log("🎨 API: Starting perspective edit request")
  console.log("=".repeat(80))

  try {
    // Parse request body
    const body = await request.json()
    const { baseImageUrl, newPerspective, originalFormData } = body

    console.log("📝 Request data:")
    console.log("- Base image URL length:", baseImageUrl?.length || 0)
    console.log("- New perspective:", newPerspective)
    console.log("- Original form data keys:", Object.keys(originalFormData || {}))

    // Validate required fields
    if (!baseImageUrl || !newPerspective || !originalFormData) {
      return NextResponse.json(
        { error: "Missing required fields: baseImageUrl, newPerspective, originalFormData" },
        { status: 400 }
      )
    }

    // Validate perspective
    const validPerspectives = ['front', 'front-left', 'front-right']
    if (!validPerspectives.includes(newPerspective)) {
      return NextResponse.json(
        { error: "Invalid perspective. Must be one of: front, front-left, front-right" },
        { status: 400 }
      )
    }

    // Verify authentication
    console.log("\n🔐 Verifying authentication...")
    
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
    
    if (!userId) {
      console.log("❌ No user ID found")
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    console.log("✅ User authenticated:", userId, "Method:", authMethod)

    // Check user points
    console.log("\n💰 Checking user points...")
    const profileResult = await query(
      'SELECT points FROM profiles WHERE id = $1',
      [userId]
    )

    if (profileResult.rows.length === 0) {
      console.log("❌ Failed to fetch user profile")
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 }
      )
    }

    const profile = profileResult.rows[0]
    const currentPoints = profile.points || 0
    console.log("📊 Current points:", currentPoints)

    if (currentPoints < 1) {
      return NextResponse.json(
        { error: "Insufficient points. You need at least 1 point to edit perspective." },
        { status: 400 }
      )
    }

    // Determine if user is free (for watermarking)
    const isFreeUser = currentPoints <= 10

    // Generate original prompt for context
    console.log("\n📝 Generating original prompt for context...")
    const originalPrompt = generatePrompt(originalFormData)
    console.log("📏 Original prompt length:", originalPrompt.length)

    // Call AI service to edit the perspective
    console.log("\n🤖 Calling AI service for perspective editing...")
    const editResult = await editArchitecturalDesignPerspective(
      baseImageUrl,
      newPerspective,
      originalPrompt,
      isFreeUser
    )

    console.log("✅ AI service completed")
    console.log("🖼️ Result image URL length:", editResult.imageUrl.length)
    console.log("🏷️ Is watermarked:", editResult.isWatermarked)

    // Save the edited design to database
    console.log("\n💾 Saving edited design to database...")
    const designResult = await query(
      `INSERT INTO designs (user_id, image_url, thumbnail_url, prompt, perspective, style, is_watermarked, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        editResult.imageUrl,
        editResult.thumbnailUrl,
        originalPrompt,
        newPerspective,
        originalFormData.style,
        editResult.isWatermarked,
        "completed"
      ]
    )

    if (designResult.rows.length === 0) {
      console.log("❌ Failed to save design")
      return NextResponse.json(
        { error: "Failed to save design" },
        { status: 500 }
      )
    }

    const designRecord = designResult.rows[0]
    console.log("✅ Design saved successfully. Design ID:", designRecord.id)

    // Deduct points after successful generation
    try {
      await deductPoints(userId, 1, `Perspective edit to ${newPerspective}`, designRecord.id)
      console.log("✅ Points deducted successfully")
    } catch (pointsError) {
      console.error("❌ Failed to deduct points:", pointsError)
      // Don't fail the request if points deduction fails
    }

    // Return success response
    const response = {
      imageUrl: editResult.imageUrl,
      thumbnailUrl: editResult.thumbnailUrl,
      isWatermarked: editResult.isWatermarked,
      perspective: newPerspective,
      designId: designRecord.id,
      remainingPoints: currentPoints - 1,
      originalFormData: originalFormData
    }

    console.log("=".repeat(80))
    console.log("🎉 PERSPECTIVE EDIT COMPLETED SUCCESSFULLY")
    console.log("=".repeat(80))

    return NextResponse.json(response)

  } catch (error) {
    console.log("\n" + "=".repeat(80))
    console.log("❌ PERSPECTIVE EDIT API ERROR")
    console.log("=".repeat(80))
    console.error("Error details:", error)
    console.error("Error message:", error instanceof Error ? error.message : String(error))

    return NextResponse.json(
      { 
        error: `Perspective editing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    )
  }
}