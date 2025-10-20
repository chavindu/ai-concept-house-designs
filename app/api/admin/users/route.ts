import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database/client'

export const dynamic = 'force-dynamic'

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

    // Get all users with their design counts
    const usersResult = await query(
      `SELECT 
         u.id,
         u.email,
         u.full_name,
         u.role,
         u.email_verified,
         u.created_at,
         p.points,
         COALESCE(design_counts.design_count, 0) as design_count
       FROM users u
       LEFT JOIN profiles p ON u.id = p.id
       LEFT JOIN (
         SELECT user_id, COUNT(*) as design_count
         FROM designs
         GROUP BY user_id
       ) design_counts ON u.id = design_counts.user_id
       ORDER BY u.created_at DESC`
    )

    return NextResponse.json({
      users: usersResult.rows
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 })
  }
}
