import { NextRequest, NextResponse } from 'next/server'
import { refreshUserSession } from '@/lib/auth/session'
import { getUserById } from '@/lib/database/server'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.next()
    
    // Try to refresh the session
    const newAccessToken = await refreshUserSession(request, response)
    
    if (!newAccessToken) {
      return NextResponse.json(
        { error: 'Refresh token invalid or expired' },
        { status: 401 }
      )
    }

    // Get user information
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 401 }
      )
    }

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Token refreshed successfully',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          email_verified: user.email_verified,
          role: user.role,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    )
  }
}
