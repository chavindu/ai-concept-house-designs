import { NextRequest, NextResponse } from 'next/server'
import { getUserWithProfile } from '@/lib/database/server'
import { verifyAuthFromCookies } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Try cookie-based auth first
    const auth = await verifyAuthFromCookies(request)

    let userId = request.headers.get('x-user-id')
    if (!userId && auth?.user?.id) {
      userId = auth.user.id
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await getUserWithProfile(userId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      email_verified: user.email_verified,
      role: user.role,
      language_preference: user.language_preference,
      points: user.points,
      daily_points_claimed: user.daily_points_claimed,
      created_at: user.created_at,
      updated_at: user.updated_at,
    })
  } catch (error) {
    console.error('User profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}
