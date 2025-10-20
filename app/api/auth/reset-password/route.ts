import { NextRequest, NextResponse } from 'next/server'
import { validatePassword } from '@/lib/auth/password'
import { resetPasswordWithToken, isPasswordResetTokenValid } from '@/lib/auth/password-reset'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
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

    // Check if token is valid
    const isTokenValid = await isPasswordResetTokenValid(token)
    if (!isTokenValid) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Reset password
    const success = await resetPasswordWithToken(token, password)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Password reset failed' },
      { status: 500 }
    )
  }
}
