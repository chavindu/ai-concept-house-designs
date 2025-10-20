import { NextRequest, NextResponse } from 'next/server'
import { getUserWithProfile } from '@/lib/database/server'
import { verifyAuthFromCookies } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('API: User profile request received')
    
    // Try cookie-based auth first
    const auth = await verifyAuthFromCookies(request)
    console.log('API: Auth from cookies:', auth ? 'success' : 'failed')

    let userId = request.headers.get('x-user-id')
    if (!userId && auth?.user?.id) {
      userId = auth.user.id
    }

    console.log('API: User ID:', userId)

    if (!userId) {
      console.log('API: No user ID found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('API: Fetching user with profile for ID:', userId)
    const user = await getUserWithProfile(userId)
    console.log('API: User profile result:', user ? 'found' : 'not found')
    
    if (!user) {
      console.log('API: User not found')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const responseData = {
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
    }
    
    console.log('API: Returning user data:', responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('User profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}
