import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
const ACCESS_TOKEN_EXPIRES_IN = '15m' // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = '7d' // 7 days

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET environment variables are required')
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface RefreshTokenPayload {
  userId: string
  sessionId: string
  iat?: number
  exp?: number
}

/**
 * Generate an access token
 * @param payload - JWT payload containing user information
 * @returns Access token string
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      issuer: 'architecture.lk',
      audience: 'architecture.lk',
    })
  } catch (error) {
    console.error('Error generating access token:', error)
    throw new Error('Failed to generate access token')
  }
}

/**
 * Generate a refresh token
 * @param userId - User ID
 * @param sessionId - Session ID
 * @returns Refresh token string
 */
export function generateRefreshToken(userId: string, sessionId: string): string {
  try {
    const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
      userId,
      sessionId,
    }
    
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'architecture.lk',
      audience: 'architecture.lk',
    })
  } catch (error) {
    console.error('Error generating refresh token:', error)
    throw new Error('Failed to generate refresh token')
  }
}

/**
 * Verify an access token
 * @param token - Access token string
 * @returns Decoded JWT payload
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'architecture.lk',
      audience: 'architecture.lk',
    }) as JWTPayload
    
    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token has expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token')
    } else {
      console.error('Error verifying access token:', error)
      throw new Error('Failed to verify access token')
    }
  }
}

/**
 * Verify a refresh token
 * @param token - Refresh token string
 * @returns Decoded refresh token payload
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'architecture.lk',
      audience: 'architecture.lk',
    }) as RefreshTokenPayload
    
    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token')
    } else {
      console.error('Error verifying refresh token:', error)
      throw new Error('Failed to verify refresh token')
    }
  }
}

/**
 * Decode a JWT token without verification (for debugging)
 * @param token - JWT token string
 * @returns Decoded payload (not verified)
 */
export function decodeToken(token: string): any {
  try {
    return jwt.decode(token)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

/**
 * Check if a token is expired
 * @param token - JWT token string
 * @returns Boolean indicating if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any
    if (!decoded || !decoded.exp) {
      return true
    }
    
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch (error) {
    return true
  }
}

/**
 * Generate a random token for verification purposes
 * @param length - Length of the token (default: 32)
 * @returns Random token string
 */
export function generateRandomToken(length: number = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  
  for (let i = 0; i < length; i++) {
    token += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  return token
}

/**
 * Generate a UUID-based token
 * @returns UUID string
 */
export function generateUUIDToken(): string {
  return uuidv4()
}
