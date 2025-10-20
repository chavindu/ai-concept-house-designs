import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, verifyPassword, validatePassword } from '@/lib/auth/password'
import { createUser, getUserByEmail, verifyUserEmail } from '@/lib/database/server'
import { createEmailVerificationToken } from '@/lib/auth/email-verification'
import { createUserSession } from '@/lib/auth/session'
import { generateRandomAvatar } from '@/lib/utils/avatar-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName } = body

    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate random avatar for the user
    const avatarUrl = generateRandomAvatar(email, fullName)

    // Create user
    const user = await createUser({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      avatar_url: avatarUrl,
      email_verified: false,
    })

    // Create email verification token
    await createEmailVerificationToken(user.id, email)

    // Create session and set cookies
    const response = NextResponse.json(
      {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          email_verified: user.email_verified,
          role: user.role,
        },
      },
      { status: 201 }
    )

    // Generate access token for immediate login
    const { generateAccessToken } = await import('@/lib/auth/jwt')
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Create session
    await createUserSession(user.id, response)

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
