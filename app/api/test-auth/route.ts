import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getUserWithProfile } from '@/lib/database/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Test API: User profile test request received')
    
    // Try NextAuth token first
    let nextAuthToken = null
    try {
      nextAuthToken = await getToken({ 
        req: request as any, 
        secret: process.env.NEXTAUTH_SECRET 
      })
      console.log('Test API: NextAuth token:', nextAuthToken ? 'found' : 'not found')
    } catch (error) {
      console.error('Test API: NextAuth token error:', error)
    }

    if (!nextAuthToken) {
      return NextResponse.json(
        { error: 'No NextAuth token found', details: 'User not authenticated via NextAuth' },
        { status: 401 }
      )
    }

    const userId = (nextAuthToken as any).userId
    console.log('Test API: User ID from token:', userId)

    if (!userId) {
      return NextResponse.json(
        { error: 'No user ID in token', token: nextAuthToken },
        { status: 401 }
      )
    }

    // Try to get user profile
    const user = await getUserWithProfile(userId)
    console.log('Test API: User profile result:', user ? 'found' : 'not found')
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database', userId },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        points: user.points,
        role: user.role,
      },
      token: {
        userId: (nextAuthToken as any).userId,
        email: (nextAuthToken as any).email,
        role: (nextAuthToken as any).role,
      }
    })
  } catch (error) {
    console.error('Test API: Error:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}