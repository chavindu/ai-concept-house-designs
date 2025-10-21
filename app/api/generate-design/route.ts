import { type NextRequest, NextResponse } from "next/server"
import { generatePrompt } from "@/lib/prompt-generator"
import { generateArchitecturalDesign, checkGenerationLimit } from "@/lib/ai-service"
import { deductPoints } from "@/lib/points"
import { query } from "@/lib/database/client"
import { verifyAuthFromCookies } from "@/lib/auth/session"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 MAIN DESIGN GENERATION API CALLED")
    console.log("=====================================")
    
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
      console.log("No user ID (cookies/headers)")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("User authenticated:", userId, "Method:", authMethod)

    // Check user points
    const profileResult = await query(
      'SELECT points FROM profiles WHERE id = $1',
      [userId]
    )

    if (profileResult.rows.length === 0) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      )
    }

    const profile = profileResult.rows[0]
    if (profile.points < 1) {
      return NextResponse.json(
        {
          error: "Insufficient points. You need at least 1 point to generate a design.",
        },
        { status: 400 },
      )
    }

    // Check generation rate limit (20 per hour as per spec)
    if (!checkGenerationLimit(userId)) {
      return NextResponse.json(
        {
          error: "Generation limit exceeded. You can generate up to 20 designs per hour.",
        },
        { status: 429 },
      )
    }

    const formData = await request.json()
    console.log("📋 Form data received:", formData)

    // Generate the architectural prompt
    console.log("🎨 Generating prompt...")
    const prompt = generatePrompt(formData)
    console.log("✅ Prompt generated successfully")

    // Save the design request first
    const designResult = await query(
      `INSERT INTO designs (user_id, title, prompt, style, building_type, specifications, perspective, points_cost, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        `${formData.style} ${formData.buildingType}`,
        prompt,
        formData.style,
        formData.buildingType,
        JSON.stringify(formData),
        formData.perspective,
        1,
        "generating"
      ]
    )

    const design = designResult.rows[0]
    if (!design) {
      console.error("Error saving design")
      return NextResponse.json({ error: "Failed to save design" }, { status: 500 })
    }

    // Generate AI design
    try {
      console.log("🤖 Starting AI generation with Gemini...")
      console.log("📝 Prompt being sent to Gemini:", prompt.substring(0, 200) + "...")
      console.log("👤 User type:", profile.points <= 10 ? "Free user (watermarked)" : "Premium user")
      
      // Check API key status
      console.log("\n🔑 API KEY STATUS CHECK:")
      console.log("=".repeat(50))
      const apiKey = process.env.GOOGLE_AI_API_KEY
      console.log("API Key exists:", !!apiKey)
      console.log("API Key length:", apiKey?.length || 0)
      console.log("API Key preview:", apiKey ? `${apiKey.substring(0, 10)}...` : "NO KEY")
      console.log("=".repeat(50))
      
      const isFreeUser = profile.points <= 10 // Free users have 10 or fewer points
      const aiResult = await generateArchitecturalDesign(prompt, isFreeUser)
      console.log("✅ AI generation completed:", aiResult)

      // Update design with generated image
      await query(
        `UPDATE designs 
         SET image_url = $1, thumbnail_url = $2, is_watermarked = $3, status = $4, updated_at = NOW()
         WHERE id = $5`,
        [aiResult.imageUrl, aiResult.thumbnailUrl, aiResult.isWatermarked, "completed", design.id]
      )

      // Deduct points after successful generation
      try {
        await deductPoints(userId, 1, "AI Design Generation", design.id)
        console.log("✅ Points deducted successfully")
      } catch (pointsError) {
        console.error("Error deducting points:", pointsError)
        // Don't fail the request if points deduction fails
      }

      return NextResponse.json({
        success: true,
        imageUrl: aiResult.imageUrl,
        thumbnailUrl: aiResult.thumbnailUrl,
        isWatermarked: aiResult.isWatermarked,
        prompt: prompt,
        designId: design.id,
        remainingPoints: profile.points - 1,
        originalFormData: formData, // Include form data for regeneration
        authMethod: authMethod,
      })
    } catch (aiError) {
      console.error("AI generation failed:", aiError)
      
      // Update design status to failed
      await query(
        'UPDATE designs SET status = $1, updated_at = NOW() WHERE id = $2',
        ["failed", design.id]
      )

      return NextResponse.json(
        { error: "AI generation failed. Please try again later." },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Design generation error:", error)
    return NextResponse.json({ error: "Failed to generate design" }, { status: 500 })
  }
}