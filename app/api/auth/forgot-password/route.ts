import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/database/server'
import { createPasswordResetTokenForUser } from '@/lib/auth/password-reset'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Check if user exists
    const user = await getUserByEmail(email)
    
    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      try {
        await createPasswordResetTokenForUser(user.id, email)
      } catch (error) {
        console.error('Error creating password reset token:', error)
        // Don't expose the error to the client
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}
