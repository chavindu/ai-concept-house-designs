import { query, withTransaction } from './client'

// User interface
export interface User {
  id: string
  email: string
  password_hash?: string
  full_name?: string
  avatar_url?: string
  email_verified: boolean
  role: 'user' | 'admin'
  language_preference: string
  created_at: Date
  updated_at: Date
}

// User with profile interface
export interface UserWithProfile extends User {
  points: number
  daily_points_claimed?: Date
}

// Session interface
export interface Session {
  id: string
  user_id: string
  refresh_token_hash: string
  expires_at: Date
  created_at: Date
  last_used_at: Date
}

// Verification token interface
export interface VerificationToken {
  id: string
  user_id: string
  token: string
  expires_at: Date
  created_at: Date
}

// Password reset token interface
export interface PasswordResetToken {
  id: string
  user_id: string
  token: string
  expires_at: Date
  created_at: Date
}

// User database operations
export async function createUser(userData: {
  email: string
  password_hash?: string
  full_name?: string
  email_verified?: boolean
}): Promise<User> {
  const result = await query<User>(
    `INSERT INTO users (email, password_hash, full_name, email_verified)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      userData.email,
      userData.password_hash,
      userData.full_name,
      userData.email_verified || false,
    ]
  )
  
  return result.rows[0]
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )
  
  return result.rows[0] || null
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  )
  
  return result.rows[0] || null
}


export async function ensureUserProfile(userId: string): Promise<void> {
  // Check if profile exists, if not create one
  const profileCheck = await query(
    'SELECT id FROM profiles WHERE id = $1',
    [userId]
  )
  
  if (profileCheck.rows.length === 0) {
    // Create profile with default points
    await query(
      'INSERT INTO profiles (id, points) VALUES ($1, 10)',
      [userId]
    )
  }
}

export async function getUserWithProfile(userId: string): Promise<UserWithProfile | null> {
  // Ensure user has a profile
  await ensureUserProfile(userId)
  
  const result = await query<UserWithProfile>(
    `SELECT u.*, COALESCE(p.points, 0) as points, p.daily_points_claimed
     FROM users u
     LEFT JOIN profiles p ON u.id = p.id
     WHERE u.id = $1`,
    [userId]
  )
  
  return result.rows[0] || null
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const fields = []
  const values = []
  let paramCount = 1

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id') {
      fields.push(`${key} = $${paramCount}`)
      values.push(value)
      paramCount++
    }
  })

  if (fields.length === 0) {
    throw new Error('No fields to update')
  }

  fields.push(`updated_at = NOW()`)
  values.push(id)

  const result = await query<User>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  )

  return result.rows[0]
}

export async function verifyUserEmail(id: string): Promise<void> {
  await query(
    'UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1',
    [id]
  )
}

// Session database operations
export async function createSession(sessionData: {
  user_id: string
  refresh_token_hash: string
  expires_at: Date
}): Promise<Session> {
  const result = await query<Session>(
    `INSERT INTO sessions (user_id, refresh_token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [sessionData.user_id, sessionData.refresh_token_hash, sessionData.expires_at]
  )
  
  return result.rows[0]
}

export async function getSessionByRefreshToken(refreshTokenHash: string): Promise<Session | null> {
  const result = await query<Session>(
    'SELECT * FROM sessions WHERE refresh_token_hash = $1 AND expires_at > NOW()',
    [refreshTokenHash]
  )
  
  return result.rows[0] || null
}

export async function updateSessionLastUsed(sessionId: string): Promise<void> {
  await query(
    'UPDATE sessions SET last_used_at = NOW() WHERE id = $1',
    [sessionId]
  )
}

export async function deleteSession(sessionId: string): Promise<void> {
  await query('DELETE FROM sessions WHERE id = $1', [sessionId])
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  await query('DELETE FROM sessions WHERE user_id = $1', [userId])
}

export async function cleanupExpiredSessions(): Promise<void> {
  await query('DELETE FROM sessions WHERE expires_at < NOW()')
}

// Verification token operations
export async function createVerificationToken(tokenData: {
  user_id: string
  token: string
  expires_at: Date
}): Promise<VerificationToken> {
  const result = await query<VerificationToken>(
    `INSERT INTO verification_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [tokenData.user_id, tokenData.token, tokenData.expires_at]
  )
  
  return result.rows[0]
}

export async function getVerificationToken(token: string): Promise<VerificationToken | null> {
  const result = await query<VerificationToken>(
    'SELECT * FROM verification_tokens WHERE token = $1 AND expires_at > NOW()',
    [token]
  )
  
  return result.rows[0] || null
}

export async function deleteVerificationToken(token: string): Promise<void> {
  await query('DELETE FROM verification_tokens WHERE token = $1', [token])
}

export async function cleanupExpiredVerificationTokens(): Promise<void> {
  await query('DELETE FROM verification_tokens WHERE expires_at < NOW()')
}

// Password reset token operations
export async function createPasswordResetToken(tokenData: {
  user_id: string
  token: string
  expires_at: Date
}): Promise<PasswordResetToken> {
  const result = await query<PasswordResetToken>(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [tokenData.user_id, tokenData.token, tokenData.expires_at]
  )
  
  return result.rows[0]
}

export async function getPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
  const result = await query<PasswordResetToken>(
    'SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()',
    [token]
  )
  
  return result.rows[0] || null
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  await query('DELETE FROM password_reset_tokens WHERE token = $1', [token])
}

export async function cleanupExpiredPasswordResetTokens(): Promise<void> {
  await query('DELETE FROM password_reset_tokens WHERE expires_at < NOW()')
}

// Profile operations
export async function getUserProfile(userId: string): Promise<{ points: number; daily_points_claimed?: Date } | null> {
  const result = await query<{ points: number; daily_points_claimed?: Date }>(
    'SELECT points, daily_points_claimed FROM profiles WHERE id = $1',
    [userId]
  )
  
  return result.rows[0] || null
}

export async function updateUserPoints(userId: string, points: number): Promise<void> {
  await query(
    'UPDATE profiles SET points = $1, updated_at = NOW() WHERE id = $2',
    [points, userId]
  )
}

export async function updateDailyPointsClaimed(userId: string, date: Date): Promise<void> {
  await query(
    'UPDATE profiles SET daily_points_claimed = $1, updated_at = NOW() WHERE id = $2',
    [date, userId]
  )
}

// Cleanup function for expired tokens (can be called periodically)
export async function cleanupExpiredTokens(): Promise<void> {
  await withTransaction(async (client) => {
    await client.query('DELETE FROM sessions WHERE expires_at < NOW()')
    await client.query('DELETE FROM verification_tokens WHERE expires_at < NOW()')
    await client.query('DELETE FROM password_reset_tokens WHERE expires_at < NOW()')
  })
}
