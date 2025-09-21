import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generatePrompt } from "@/lib/prompt-generator"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check user points
    const { data: profile } = await supabase.from("user_profiles").select("points").eq("id", user.id).single()

    if (!profile || profile.points < 10) {
      return NextResponse.json(
        {
          error: "Insufficient points. You need at least 10 points to generate a design.",
        },
        { status: 400 },
      )
    }

    const formData = await request.json()

    // Generate the architectural prompt
    const prompt = generatePrompt(formData)

    // Deduct points (10 points per generation)
    const { error: pointsError } = await supabase
      .from("user_profiles")
      .update({ points: profile.points - 10 })
      .eq("id", user.id)

    if (pointsError) {
      console.error("Error deducting points:", pointsError)
    }

    // Log the transaction
    await supabase.from("points_transactions").insert({
      user_id: user.id,
      amount: -10,
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
        status: "generating",
      })
      .select()
      .single()

    if (designError) {
      console.error("Error saving design:", designError)
    }

    // TODO: Integrate with actual AI image generation service
    // For now, return a placeholder response
    const mockImageUrl = "/ai-generated-house-design-concept.jpg"

    // Update design with generated image
    if (design) {
      await supabase
        .from("designs")
        .update({
          image_url: mockImageUrl,
          status: "completed",
        })
        .eq("id", design.id)
    }

    return NextResponse.json({
      success: true,
      imageUrl: mockImageUrl,
      prompt: prompt,
      designId: design?.id,
      remainingPoints: profile.points - 10,
    })
  } catch (error) {
    console.error("Design generation error:", error)
    return NextResponse.json({ error: "Failed to generate design" }, { status: 500 })
  }
}
