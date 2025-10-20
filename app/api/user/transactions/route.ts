import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database/client'
import { verifyAuthFromCookies } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('API: User transactions request received')
    
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

    // Get recent points transactions
    const transactionsResult = await query(
      `SELECT id, amount, type, description, created_at
       FROM points_transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [userId]
    )

    console.log('API: Found transactions:', transactionsResult.rows.length)

    return NextResponse.json({
      transactions: transactionsResult.rows
    })
  } catch (error: any) {
    console.error('Error fetching user transactions:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch transactions' }, { status: 500 })
  }
}
