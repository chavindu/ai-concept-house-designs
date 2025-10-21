import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database/client'
import { verifyAuthFromCookies } from '@/lib/auth/session'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('API: User transactions request received')
    
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
      transactions: transactionsResult.rows,
      authMethod: authMethod,
    })
  } catch (error: any) {
    console.error('Error fetching user transactions:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch transactions' }, { status: 500 })
  }
}
