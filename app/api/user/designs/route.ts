import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database/client'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user designs
    const designsResult = await query(
      `SELECT id, title, image_url, thumbnail_url, status, created_at, is_watermarked, perspective
       FROM designs 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    )

    return NextResponse.json({
      designs: designsResult.rows
    })
  } catch (error: any) {
    console.error('Error fetching user designs:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch designs' }, { status: 500 })
  }
}
