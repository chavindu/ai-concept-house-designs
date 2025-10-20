import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database/client'
import { verifyAuthFromCookies } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('API: User designs request received')
    
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
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user designs
    const designsResult = await query(
      `SELECT id, title, image_url, thumbnail_url, status, created_at, is_watermarked, perspective, prompt, style, building_type, is_public
       FROM designs 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    )

    console.log('API: Found designs:', designsResult.rows.length)

    return NextResponse.json({
      designs: designsResult.rows
    })
  } catch (error: any) {
    console.error('Error fetching user designs:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch designs' }, { status: 500 })
  }
}
