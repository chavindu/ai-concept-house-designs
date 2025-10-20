import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken } from '@/lib/auth/email-verification'
import { verifyUserEmail } from '@/lib/database/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Verify the token
    const userId = await verifyEmailToken(token)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Mark user email as verified
    await verifyUserEmail(userId)

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Email verification failed' },
      { status: 500 }
    )
  }
}
