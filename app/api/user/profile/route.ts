import { NextRequest, NextResponse } from 'next/server'
import { getUserWithProfile } from '@/lib/database/server'
import { verifyAuthFromCookies } from '@/lib/auth/session'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('API: User profile request received')
    console.log('API: Request URL:', request.url)
    console.log('API: Request headers:', Object.fromEntries(request.headers.entries()))
    console.log('API: Cookies:', Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value ? 'present' : 'missing'])))
    
    // Try NextAuth session first (preferred method)
    const session = await getServerSession(authOptions)
    console.log('API: NextAuth session:', session ? 'found' : 'not found')
    
    let userId = null
    let authMethod = 'none'
    
    if (session?.user?.id) {
      userId = session.user.id
      authMethod = 'nextauth'
      console.log('API: Using NextAuth session, user ID:', userId)
    } else {
      // Fallback: Try cookie-based auth
      const auth = await verifyAuthFromCookies(request)
      console.log('API: Auth from cookies:', auth ? 'success' : 'failed')
      if (auth?.user?.id) {
        userId = auth.user.id
        authMethod = 'cookies'
        console.log('API: Using cookie auth, user ID:', userId)
      }
    }

    // Check header fallback
    if (!userId) {
      userId = request.headers.get('x-user-id')
      if (userId) {
        authMethod = 'header'
        console.log('API: Using header auth, user ID:', userId)
      }
    }

    console.log('API: Final user ID:', userId, 'Method:', authMethod)

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
      authMethod: authMethod,
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
