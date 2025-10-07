import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generatePrompt } from "@/lib/prompt-generator"
import { generateArchitecturalDesign, checkGenerationLimit } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 MAIN DESIGN GENERATION API CALLED")
    console.log("=====================================")
    
    const supabase = await createClient()

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      console.log("No authorization header")
      return NextResponse.json({ error: "No authorization header" }, { status: 401 })
    }

    // Check authentication using the token from the header
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.log("Authentication failed:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("User authenticated:", user.id)

    // Check user points and generation limits
    const { data: profile } = await supabase.from("profiles").select("points").eq("id", user.id).single()

    if (!profile || profile.points < 1) {
      return NextResponse.json(
        {
          error: "Insufficient points. You need at least 1 point to generate a design.",
        },
        { status: 400 },
      )
    }

    // Check generation rate limit (20 per hour as per spec)
    if (!checkGenerationLimit(user.id)) {
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

    // Deduct points (1 point per generation as per spec)
    const { error: pointsError } = await supabase
      .from("profiles")
      .update({ points: profile.points - 1 })
      .eq("id", user.id)

    if (pointsError) {
      console.error("Error deducting points:", pointsError)
    }

    // Log the transaction
    await supabase.from("points_transactions").insert({
      user_id: user.id,
      amount: -1,
      type: "deduction",
      description: "AI Design Generation",
      reference_id: `design_${Date.now()}`,
    })

    // Save the design request
    const { data: design, error: designError } = await supabase
      .from("designs")
      .insert({
        user_id: user.id,
        title: `${formData.style} ${formData.buildingType}`,
        prompt: prompt,
        style: formData.style,
        building_type: formData.buildingType,
        specifications: formData,
        perspective: formData.perspective,
        points_cost: 1,
        status: "generating",
      })
      .select()
      .single()

    if (designError) {
      console.error("Error saving design:", designError)
      // Continue with generation even if saving fails
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
      if (design) {
        await supabase
          .from("designs")
          .update({
            image_url: aiResult.imageUrl,
            thumbnail_url: aiResult.thumbnailUrl,
            is_watermarked: aiResult.isWatermarked,
            status: "completed",
          })
          .eq("id", design.id)
      }

      return NextResponse.json({
        success: true,
        imageUrl: aiResult.imageUrl,
        thumbnailUrl: aiResult.thumbnailUrl,
        isWatermarked: aiResult.isWatermarked,
        prompt: prompt,
        designId: design?.id,
        remainingPoints: profile.points - 1,
        originalFormData: formData, // Include form data for regeneration
      })
    } catch (aiError) {
      console.error("AI generation failed:", aiError)
      
      // Update design status to failed
      if (design) {
        await supabase
          .from("designs")
          .update({
            status: "failed",
          })
          .eq("id", design.id)
      }

      // Refund the point
      await supabase
        .from("profiles")
        .update({ points: profile.points })
        .eq("id", user.id)

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
