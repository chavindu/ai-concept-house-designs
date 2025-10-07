import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { editArchitecturalDesignPerspective } from "@/lib/ai-service"
import { generatePrompt } from "@/lib/prompt-generator"

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
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("❌ Authentication failed:", authError?.message)
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    console.log("✅ User authenticated:", user.id)

    // Check user points
    console.log("\n💰 Checking user points...")
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      console.log("❌ Failed to fetch user profile:", profileError?.message)
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 }
      )
    }

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

    // Deduct 1 point
    console.log("\n💸 Deducting 1 point...")
    const newPoints = currentPoints - 1
    const { error: pointsError } = await supabase
      .from("profiles")
      .update({ points: newPoints })
      .eq("id", user.id)

    if (pointsError) {
      console.log("❌ Failed to deduct points:", pointsError.message)
      return NextResponse.json(
        { error: "Failed to deduct points" },
        { status: 500 }
      )
    }

    console.log("✅ Points deducted. New balance:", newPoints)

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
    const { data: designRecord, error: saveError } = await supabase
      .from("designs")
      .insert({
        user_id: user.id,
        image_url: editResult.imageUrl,
        thumbnail_url: editResult.thumbnailUrl,
        prompt: originalPrompt,
        perspective: newPerspective,
        style: originalFormData.style,
        is_watermarked: editResult.isWatermarked,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (saveError) {
      console.log("❌ Failed to save design:", saveError.message)
      
      // Refund the point since save failed
      console.log("🔄 Refunding point due to save failure...")
      await supabase
        .from("profiles")
        .update({ points: currentPoints })
        .eq("id", user.id)
      
      return NextResponse.json(
        { error: "Failed to save design", pointRefunded: true },
        { status: 500 }
      )
    }

    console.log("✅ Design saved successfully. Design ID:", designRecord.id)

    // Log point transaction
    console.log("\n📊 Logging point transaction...")
    await supabase
      .from("points_transactions")
      .insert({
        user_id: user.id,
        type: "perspective_edit",
        amount: -1,
        description: `Perspective edit to ${newPerspective}`,
        design_id: designRecord.id,
        created_at: new Date().toISOString()
      })

    console.log("✅ Point transaction logged")

    // Return success response
    const response = {
      imageUrl: editResult.imageUrl,
      thumbnailUrl: editResult.thumbnailUrl,
      isWatermarked: editResult.isWatermarked,
      perspective: newPerspective,
      designId: designRecord.id,
      remainingPoints: newPoints,
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

    // Try to refund point if we deducted one
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        console.log("🔄 Attempting to refund point due to error...")
        const { data: profile } = await supabase
          .from("profiles")
          .select("points")
          .eq("id", user.id)
          .single()
        
        if (profile) {
          await supabase
            .from("profiles")
            .update({ points: (profile.points || 0) + 1 })
            .eq("id", user.id)
          
          console.log("✅ Point refunded")
        }
      }
    } catch (refundError) {
      console.error("❌ Failed to refund point:", refundError)
    }

    return NextResponse.json(
      { 
        error: `Perspective editing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        pointRefunded: true 
      },
      { status: 500 }
    )
  }
}
