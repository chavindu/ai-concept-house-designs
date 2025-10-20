import { NextRequest, NextResponse } from 'next/server'
import { logoutUser } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logout successful' },
      { status: 200 }
    )

    // Clear session and cookies
    await logoutUser(request, response)

    return response
  } catch (error) {
    console.error('Logout error:', error)
    
    // Still return success and clear cookies even if there's an error
    const response = NextResponse.json(
      { success: true, message: 'Logout successful' },
      { status: 200 }
    )
    
    // Clear cookies
    const { clearAuthCookies } = await import('@/lib/auth/session')
    clearAuthCookies(response)
    
    return response
  }
}
