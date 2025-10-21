import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from './jwt'
import { createSession, getSessionByRefreshToken, updateSessionLastUsed, deleteSession, deleteAllUserSessions } from '@/lib/database/server'
import { getToken } from 'next-auth/jwt'

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL?.startsWith('https'),
  sameSite: 'lax' as const,
  path: '/',
  domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
}

const ACCESS_TOKEN_COOKIE_NAME = 'access_token'
const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token'

/**
 * Set authentication cookies in response
 * @param response - NextResponse object
 * @param accessToken - Access token
 * @param refreshToken - Refresh token
 */
export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string): void {
  // Set access token cookie (15 minutes)
  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60, // 15 minutes
  })

  // Set refresh token cookie (7 days)
  response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
}

/**
 * Clear authentication cookies
 * @param response - NextResponse object
 */
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  })
  
  response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  })
}

/**
 * Get access token from cookies (server-side)
 * @param request - NextRequest object
 * @returns Access token or null
 */
export function getAccessTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value || null
}

/**
 * Get refresh token from cookies (server-side)
 * @param request - NextRequest object
 * @returns Refresh token or null
 */
export function getRefreshTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value || null
}

/**
 * Get access token from cookies (server component)
 * @returns Access token or null
 */
export async function getAccessTokenFromServerCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value || null
}

/**
 * Get refresh token from cookies (server component)
 * @returns Refresh token or null
 */
export async function getRefreshTokenFromServerCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value || null
}

/**
 * Verify user authentication from cookies
 * @param request - NextRequest object
 * @returns User information or null
 */
export async function verifyAuthFromCookies(request: NextRequest): Promise<{
  user: { id: string; email: string; role: string }
  accessToken: string
} | null> {
  try {
    const accessToken = getAccessTokenFromCookies(request)
    
    if (accessToken) {
      const payload = verifyAccessToken(accessToken)
      
      return {
        user: {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
        },
        accessToken,
      }
    }

    // Fallback: Try NextAuth JWT token
    const nextAuthToken = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
    if (nextAuthToken && (nextAuthToken as any).userId) {
      return {
        user: {
          id: (nextAuthToken as any).userId as string,
          email: (nextAuthToken as any).email as string,
          role: ((nextAuthToken as any).role as string) || 'user',
        },
        accessToken: 'nextauth',
      }
    }

    return null
  } catch (error) {
    console.error('Error verifying auth from cookies:', error)
    return null
  }
}

/**
 * Create a new session for a user
 * @param userId - User ID
 * @param response - NextResponse object
 * @returns Session information
 */
export async function createUserSession(userId: string, response: NextResponse): Promise<{
  accessToken: string
  refreshToken: string
  sessionId: string
}> {
  try {
    // Generate tokens
    const accessToken = generateAccessToken({
      userId,
      email: '', // Will be filled by the calling function
      role: 'user', // Will be filled by the calling function
    })
    
    const sessionId = require('uuid').v4()
    const refreshToken = generateRefreshToken(userId, sessionId)
    
    // Hash the refresh token for storage
    const bcrypt = require('bcrypt')
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12)
    
    // Calculate expiration date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    // Store session in database
    await createSession({
      user_id: userId,
      refresh_token_hash: refreshTokenHash,
      expires_at: expiresAt,
    })
    
    // Set cookies
    setAuthCookies(response, accessToken, refreshToken)
    
    return {
      accessToken,
      refreshToken,
      sessionId,
    }
  } catch (error) {
    console.error('Error creating user session:', error)
    throw new Error('Failed to create user session')
  }
}

/**
 * Refresh user session using refresh token
 * @param request - NextRequest object
 * @param response - NextResponse object
 * @returns New access token or null
 */
export async function refreshUserSession(request: NextRequest, response: NextResponse): Promise<string | null> {
  try {
    const refreshToken = getRefreshTokenFromCookies(request)
    
    if (!refreshToken) {
      return null
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)
    
    // Hash the refresh token to find the session
    const bcrypt = require('bcrypt')
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12)
    
    // Get session from database
    const session = await getSessionByRefreshToken(refreshTokenHash)
    
    if (!session || session.user_id !== payload.userId) {
      return null
    }

    // Update session last used
    await updateSessionLastUsed(session.id)
    
    // Generate new access token
    const accessToken = generateAccessToken({
      userId: payload.userId,
      email: '', // Will be filled by the calling function
      role: 'user', // Will be filled by the calling function
    })
    
    // Update access token cookie
    response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60, // 15 minutes
    })
    
    return accessToken
  } catch (error) {
    console.error('Error refreshing user session:', error)
    return null
  }
}

/**
 * Logout user and clear session
 * @param request - NextRequest object
 * @param response - NextResponse object
 */
export async function logoutUser(request: NextRequest, response: NextResponse): Promise<void> {
  try {
    const refreshToken = getRefreshTokenFromCookies(request)
    
    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken)
        
        // Hash the refresh token to find the session
        const bcrypt = require('bcrypt')
        const refreshTokenHash = await bcrypt.hash(refreshToken, 12)
        
        // Get and delete session
        const session = await getSessionByRefreshToken(refreshTokenHash)
        if (session) {
          await deleteSession(session.id)
        }
      } catch (error) {
        console.error('Error during logout cleanup:', error)
      }
    }
    
    // Clear cookies
    clearAuthCookies(response)
  } catch (error) {
    console.error('Error during logout:', error)
    // Still clear cookies even if there's an error
    clearAuthCookies(response)
  }
}

/**
 * Logout user from all sessions
 * @param userId - User ID
 * @param response - NextResponse object
 */
export async function logoutUserFromAllSessions(userId: string, response: NextResponse): Promise<void> {
  try {
    // Delete all user sessions
    await deleteAllUserSessions(userId)
    
    // Clear cookies
    clearAuthCookies(response)
  } catch (error) {
    console.error('Error during logout from all sessions:', error)
    // Still clear cookies even if there's an error
    clearAuthCookies(response)
  }
}
