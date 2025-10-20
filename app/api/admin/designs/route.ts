import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database/client'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

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
      designs: designsResult.rows
    })
  } catch (error: any) {
    console.error('Error fetching designs:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch designs' }, { status: 500 })
  }
}
