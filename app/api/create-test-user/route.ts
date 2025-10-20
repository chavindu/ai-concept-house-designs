import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/database/server"
import { hashPassword } from "@/lib/auth/password"

// This route creates test users using the new authentication system
// Only use this for development/testing
export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not allowed in production" }, { status: 403 })
    }

    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Hash the password
    const passwordHash = await hashPassword(password)

    // Create user in the new system
    const user = await createUser({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      email_verified: true, // Auto-confirm email for test users
      role: 'user',
      avatar_url: null,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name
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
