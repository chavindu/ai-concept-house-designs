import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { getUserWithProfile } from '@/lib/database/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Session Test API: Request received')
    
    // Get NextAuth session using getServerSession
    const session = await getServerSession(authOptions)
    console.log('Session Test API: Session:', session ? 'found' : 'not found')
    
    if (!session) {
      return NextResponse.json(
        { error: 'No session found', details: 'User not authenticated' },
        { status: 401 }
      )
    }

    console.log('Session Test API: Session details:', {
      userId: (session.user as any).id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as any).role,
    })

    const userId = (session.user as any).id
    if (!userId) {
      return NextResponse.json(
        { error: 'No user ID in session', session: session.user },
        { status: 401 }
      )
    }

    // Try to get user profile
    const user = await getUserWithProfile(userId)
    console.log('Session Test API: User profile result:', user ? 'found' : 'not found')
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database', userId, sessionEmail: session.user.email },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      session: {
        userId: (session.user as any).id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role,
      },
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        points: user.points,
        role: user.role,
      }
    })
  } catch (error) {
    console.error('Session Test API: Error:', error)
    return NextResponse.json(
      { error: 'Session test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
