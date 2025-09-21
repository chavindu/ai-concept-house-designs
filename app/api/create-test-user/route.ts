import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// This route creates test users using Supabase Admin API
// Only use this for development/testing
export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not allowed in production" }, { status: 403 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create user in auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName
      }
    })

    if (authError) {
      console.error("Error creating auth user:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // The trigger should automatically create the profile
    // But let's also create it manually to be sure
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: authUser.user.id,
        full_name: fullName,
        email: email,
        points: 10,
        role: "user",
        language_preference: "en"
      })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      // Don't fail the request, the user was created successfully
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        full_name: fullName
      }
    })

  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}
