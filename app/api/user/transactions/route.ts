import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database/client'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
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

    return NextResponse.json({
      transactions: transactionsResult.rows
    })
  } catch (error: any) {
    console.error('Error fetching user transactions:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch transactions' }, { status: 500 })
  }
}
