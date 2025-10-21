import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database/client'
import { verifyAuthFromCookies } from '@/lib/auth/session'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
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

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user is admin
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    )

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all designs with user information
    const designsResult = await query(
      `SELECT 
         d.id,
         d.title,
         d.image_url,
         d.thumbnail_url,
         d.status,
         d.is_public,
         d.is_watermarked,
         d.created_at,
         d.user_id,
         u.full_name as user_name,
         u.email as user_email,
         u.avatar_url as user_avatar
       FROM designs d
       LEFT JOIN users u ON d.user_id = u.id
       ORDER BY d.created_at DESC`
    )

    return NextResponse.json({
      designs: designsResult.rows,
      authMethod: authMethod,
    })
  } catch (error: any) {
    console.error('Error fetching designs:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch designs' }, { status: 500 })
  }
}
